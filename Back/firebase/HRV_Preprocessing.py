import matplotlib
matplotlib.use('Agg')
import neurokit2 as nk
import numpy as np
import pandas as pd
from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler
from pyhrv.frequency_domain import welch_psd
from firebase_admin import db
import time
import asyncio
from config import initialize_firebase  # Import from config if needed, or rely on main init

# CONFIG
WINDOW_SIZE = 600       # 10Hz * 60s = 600 points (1 Minute Window)
COLLECTION_RATE = 10    # Raw data comes in at 10Hz
PROCESSING_RATE = 100   # Upsample to 100Hz for NeuroKit processing

# Scaling Bounds (Estimated from sample data)
SCALING_BOUNDS = {
    "LF_HF_ratio": (0, 20),
    "LF_abs": (0, 5000000),
    "HF_abs": (0, 5000000),
    "Total_Power": (0, 10000000)
}

raw_ppg_buffer = []
last_ppg_val = None  # เก็บค่าล่าสุดเพื่อเช็คค่าซ้ำ
scheduler = BackgroundScheduler()

# ==========================================
# 2. ฟังก์ชันดึงและคำนวณ (Core Functions)
# ==========================================
def get_ppg_from_firebase():
    """
    ดึงข้อมูล PPG จาก Firebase Path เดียวกับ EDA
    """
    try:
        # ใช้ Path เดียวกับ EDA ที่แก้ไขไปล่าสุด
        ref = db.reference("/Device/Inpatient/MD-V5-0000804/1s")
        input_data = ref.get()

        if not input_data:
            return None
        else:
            # ดึงค่า PPG (ตรวจสอบชื่อ key ให้แน่ใจว่าเป็น PPG หรือ PG)
            # ในรูป EDA มี key "PPG" ดังนั้นน่าจะใช้ "PPG" ครับ
            return float(input_data.get("PPG", 0))

    except Exception as e:
        print(f"Fetch Error: {e}")
        return None

def normalize_value(val, min_v, max_v):
    """Simple MinMax Scaler with clamping 0-1"""
    if val < min_v: return 0.0
    if val > max_v: return 1.0
    return (val - min_v) / (max_v - min_v)

def store_hrv_to_firebase(features):
    try:
        ref = db.reference("/Preprocessing/HRV")
        ref.set(features)
        print("-" * 50)
        print(f"✅ UPDATED FIREBASE at {features['Timestamp']}")
        print(f"   LF/HF (Norm): {features['LF_HF_ratio_Normalized']:.4f} | Total Power (Norm): {features['Total_Power_Normalized']:.4f}")
        print("-" * 50)
    except Exception as e:
        print(f"Error saving: {e}")


def process_hrv_window(ppg_data_list):
    try:
        ppg_signal = np.array(ppg_data_list, dtype=float)

        # 0. Resample: 10Hz -> 100Hz
        # NeuroKit needs higher sampling rate for effective filtering
        ppg_resampled = nk.signal_resample(
            ppg_signal, 
            sampling_rate=COLLECTION_RATE, 
            desired_sampling_rate=PROCESSING_RATE
        )

        # 1. Clean
        ppg_cleaned = nk.ppg_clean(ppg_resampled, sampling_rate=PROCESSING_RATE)

        # 2. Peaks
        signals, info = nk.ppg_peaks(ppg_cleaned, sampling_rate=PROCESSING_RATE)
        peaks = info['PPG_Peaks']

        if len(peaks) == 0:
            print("⚠️ Not enough peaks detected.")
            return None

        # 3. NNI & Welch
        nni = np.diff(peaks) * 1000 / PROCESSING_RATE

        # ต้องมีช่วง NNI มากพอถึงจะคำนวณ PSD ได้
        if len(nni) == 0:
            print("⚠️ NNI too short for Frequency analysis.")
            return None

        freq_results = welch_psd(nni=nni, show=False)
        freq_dict = freq_results.as_dict()
        
        # Raw Values
        lf_hf_raw = float(freq_dict['fft_ratio'])
        lf_n_raw = float(freq_dict['fft_norm'][0])
        hf_n_raw = float(freq_dict['fft_norm'][1])
        lf_abs_raw = float(freq_dict['fft_abs'][1])
        hf_abs_raw = float(freq_dict['fft_abs'][2])
        total_power_raw = float(freq_dict['fft_total'])

        return {
            "Timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            
            # --- Normalized Values (0-1) ---
            "LF_HF_ratio_Normalized": normalize_value(lf_hf_raw, *SCALING_BOUNDS["LF_HF_ratio"]),
            "LF_n_Normalized": lf_n_raw / 100.0, # LF_n is 0-100
            "HF_n_Normalized": hf_n_raw / 100.0, # HF_n is 0-100
            "LF_abs_Normalized": normalize_value(lf_abs_raw, *SCALING_BOUNDS["LF_abs"]),
            "HF_abs_Normalized": normalize_value(hf_abs_raw, *SCALING_BOUNDS["HF_abs"]),
            "Total_Power_Normalized": normalize_value(total_power_raw, *SCALING_BOUNDS["Total_Power"]),
            
            # --- Raw Values (Keep for reference) ---
            "LF_HF_ratio_Raw": lf_hf_raw,
            "LF_n_Raw": lf_n_raw,
            "HF_n_Raw": hf_n_raw,
            "LF_abs_Raw": lf_abs_raw,
            "HF_abs_Raw": hf_abs_raw,
            "Total_Power_Raw": total_power_raw
        }
    except Exception as e:
        print(f"Calc Error: {e}")
        return None


def collect_and_process_ppg():
    global raw_ppg_buffer

    # 1. รับค่า
    new_val = get_ppg_from_firebase()

    if new_val is not None:
        raw_ppg_buffer.append(new_val)

        # Debug print: โชว์ค่า buffer size เพื่อดูความคืบหน้า
        if len(raw_ppg_buffer) % 10 == 0:
            print(f"DEBUG: PPG Buffered {len(raw_ppg_buffer)}/{WINDOW_SIZE} | Data: {new_val}")

    # 2. Sliding Window (ถ้า buffer เต็ม ให้เอาตัวเก่าออก)
    if len(raw_ppg_buffer) > WINDOW_SIZE:
        raw_ppg_buffer.pop(0)

    # 3. Process ทุกครั้งที่เต็ม
    if len(raw_ppg_buffer) == WINDOW_SIZE:
        # อาจจะ process ทุกๆ  interval หรือทุกครั้งก็ได้ แต่เพื่อไม่ให้หนักเกินไปอาจจะ process ทุกๆ X ข้อมูล
        # แต่ในที่นี้ทำตาม logic เดิมคือเต็มแล้ว process เลย
        features = process_hrv_window(raw_ppg_buffer)
        if features:
            store_hrv_to_firebase(features)
            # Reset buffer เพื่อรอรอบใหม่ หรือ จะทำ sliding window จริงๆ (เก็บของเก่าไว้) ก็ได้
            # แต่เพื่อความง่ายและเหมือน EDA เรา Reset ดีกว่าไหม? 
            # แต่ HRV ปกติต้องใช้ช่วงเวลาต่อเนื่อง ถ้า Reset อาจจะขาดตอน
            # ในที่นี้ขอใช้แบบ Sliding: pop ตัวแรกออกไปแล้ว (บรรทัดบน) ดังนั้นข้อมูลจะ shift ทีละ 1 จุด
            # แต่ process ทุก 1 จุดจะหนักไป ให้ process เฉพาะตอนครบรอบดีกว่า
            pass


# ปรับ logic: เพื่อไม่ให้หนักเกินไป เราจะ process เฉพาะเมื่อรวบรวมข้อมูลใหม่ครบ set
def collect_and_process_ppg_batch():
    global raw_ppg_buffer, last_ppg_val
    new_val = get_ppg_from_firebase()
    
    # Simple Duplicate Filter: เอาออกเพื่อให้รับค่าซ้ำได้
    if new_val is not None:
        # if new_val != last_ppg_val:  <-- Comment Out Duplicate Check
        raw_ppg_buffer.append(new_val)
        last_ppg_val = new_val
        
        # Debug: แสดงจำนวนทุกครั้งที่มีข้อมูลเข้า
        print(f"DEBUG: Data Count {len(raw_ppg_buffer)}/{WINDOW_SIZE} | Value: {new_val}")
        
    if len(raw_ppg_buffer) >= WINDOW_SIZE:
        print("🔄 Processing HRV Batch...")
        features = process_hrv_window(raw_ppg_buffer)
        if features:
            store_hrv_to_firebase(features)
        
        # Reset buffer เพื่อรอชุดใหม่ (Overlap นิดหน่อยอาจจะดีกว่าแต่เอาแบบ Simple ก่อน)
        raw_ppg_buffer = []

# ==========================================
# 3. Scheduler & Async Start
# ==========================================
def schedule_preprocessing_interval():
    if not scheduler.get_jobs():
        # PPG มาถี่กว่า EDA มักจะมา 10-100Hz 
        # สมมติ Firebase เก็บ 1 ค่าล่าสุดเสมอ เราต้องดึงให้ทัน
        scheduler.add_job(collect_and_process_ppg_batch, trigger='interval', seconds=0.1, max_instances=10)
        scheduler.start()
        print("⏰ HRV Scheduler started.")

async def start_schedule_preprocessing_hrv():
    try:
        schedule_preprocessing_interval()
        return {"message": "Started scheduling preprocessing HRV"}
    except Exception as e:
        return {"error": str(e)}

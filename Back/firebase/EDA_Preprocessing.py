import neurokit2 as nk
import numpy as np
import pandas as pd
from datetime import datetime
from firebase_admin import db
from apscheduler.schedulers.background import BackgroundScheduler

raw_eda_data = []
scheduler = BackgroundScheduler()


def get_eda_from_firebase():
    firebase_data = db.reference("/Device/Inpatient/MD-V5-0000804/1s")
    input_data = firebase_data.get()

    if not input_data:
        return None
    else:
        return float(input_data["EDA"])


def preprocess_eda(eda_raw):
    eda_signal = np.array(eda_raw, dtype=float)

    if len(eda_signal) == 0:
        print("ไม่มีข้อมูลสำหรับการ preprocessing")
        return None, None

    eda_cleaned = nk.eda_clean(eda_signal, sampling_rate=15)

    df = pd.DataFrame({"EDA_Clean": eda_cleaned})

    eda_components = nk.eda_phasic(df["EDA_Clean"], sampling_rate=15, method="cvxEDA")

    eda_phasic = eda_components["EDA_Phasic"]
    eda_tonic = eda_components["EDA_Tonic"]

    return eda_phasic, eda_tonic


def store_processed_eda_to_firebase(eda_phasic, eda_tonic):
    if eda_phasic is None or eda_tonic is None or len(eda_phasic) == 0 or len(eda_tonic) == 0:
        print("ไม่มีข้อมูล EDA ที่จะเก็บลง Firebase")
        return

    avg_phasic = np.mean(eda_phasic)
    avg_tonic = np.mean(eda_tonic)

    EDA_Data = {
        "Timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "EDA_Phasic": avg_phasic,
        "EDA_Tonic": avg_tonic
    }

    firebase_ref = db.reference("/Preprocessing/EDA")
    firebase_ref.set(EDA_Data)

    print(
        "------------------------------------------------------------------------------------------------------------------------------")
    print(
        f"Preprocessing | EDA Phasic: {avg_phasic} | EDA Tonic: {avg_tonic} | Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(
        "------------------------------------------------------------------------------------------------------------------------------")


def collect_and_process_eda():
    global raw_eda_data

    eda_value = get_eda_from_firebase()

    if eda_value is None:
        print("ไม่มีข้อมูล EDA ใน Firebase")
        return

    raw_eda_data.append(eda_value)

    if len(raw_eda_data) >= 30:
        eda_phasic, eda_tonic = preprocess_eda(raw_eda_data)
        store_processed_eda_to_firebase(eda_phasic, eda_tonic)
        raw_eda_data = []


def schedule_preprocessing_interval():
    scheduler.add_job(collect_and_process_eda, trigger='interval', seconds=1, max_instances=4)
    scheduler.start()


async def start_schedule_preprocessing_eda():
    try:
        schedule_preprocessing_interval()
        return {"message": "Started scheduling preprocessing"}
    except Exception as e:
        return {"error": str(e)}
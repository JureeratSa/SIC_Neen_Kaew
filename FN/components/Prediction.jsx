"use client";
import { useEffect, useState } from "react";
import { query, ref, onValue } from "firebase/database";
import { db } from "@/app/firebase";

export default function PredictionDetails() {
  const [latestData, setLatestData] = useState(null);
  const [comfortLevel, setComfortLevel] = useState("");
  const [comfortLevelClass, setComfortLevelClass] = useState("");
  const [loading, setLoading] = useState(true);
  const [showPainModal, setShowPainModal] = useState(false);
  const [previousPainLevel, setPreviousPainLevel] = useState(null);
  const [audioRef, setAudioRef] = useState(null);
  const [alertInterval, setAlertInterval] = useState(null);
  const [deviceData, setDeviceData] = useState(null);

  // สร้าง Audio object เมื่อ component mount
  useEffect(() => {
    const audio = new Audio();
    
    // ลองหาไฟล์เสียงในตำแหน่งต่างๆ
    const soundPaths = [
      '/sounds/PainAlert.mp3',
    ];
    
    // ทดสอบไฟล์เสียงแรกที่หาเจอ
    let currentPathIndex = 0;
    
    const testAudioPath = () => {
      if (currentPathIndex < soundPaths.length) {
        audio.src = soundPaths[currentPathIndex];
        audio.volume = 0.7;
        audio.preload = 'auto';
        
        // ทดสอบว่าโหลดได้หรือไม่
        audio.oncanplaythrough = () => {
          console.log(`✅ Audio file found: ${soundPaths[currentPathIndex]}`);
          setAudioRef(audio);
        };
        
        audio.onerror = () => {
          console.log(`❌ Audio file not found: ${soundPaths[currentPathIndex]}`);
          currentPathIndex++;
          if (currentPathIndex < soundPaths.length) {
            testAudioPath();
          } else {
            console.log('⚠️ No audio file found, will use beep sound as fallback');
            setAudioRef(null); // ใช้ beep แทน
          }
        };
      }
    };
    
    testAudioPath();
    
    return () => {
      if (audio) {
        audio.pause();
        audio.src = '';
      }
    };
  }, []);

  // ฟังก์ชันเริ่มเล่นเสียงแจ้งเตือนแบบ loop
  const startAlertSound = () => {
    stopAlertSound();
    playAlertSound();
    
    const interval = setInterval(() => {
      playAlertSound();
    }, 3000);
    
    setAlertInterval(interval);
    console.log('🔄 Started alert sound loop');
  };

  // ฟังก์ชันหยุดเล่นเสียงแจ้งเตือน
  const stopAlertSound = () => {
    if (alertInterval) {
      clearInterval(alertInterval);
      setAlertInterval(null);
      console.log('⏹️ Stopped alert sound loop');
    }
    
    if (audioRef) {
      audioRef.pause();
      audioRef.currentTime = 0;
    }
  };

  // ฟังก์ชันเล่นเสียงแจ้งเตือน (beep + file ใน 1 loop)
  const playAlertSound = () => {
    console.log('🔊 Starting alert sound sequence...');
    
    // เล่น beep beep beep ก่อนเสมอ
    playBeepSequence()
      .then(() => {
        // หลังจาก beep เสร็จ รอ 0.5 วินาที แล้วเล่นไฟล์เสียง
        setTimeout(() => {
          playAudioFile();
        }, 500);
      })
      .catch(error => {
        console.log('Beep sequence error:', error);
        // ถ้า beep ไม่ได้ ก็เล่นแค่ไฟล์เสียง
        playAudioFile();
      });
  };

  // ฟังก์ชันเล่นเสียง beep beep beep (Promise-based)
  const playBeepSequence = () => {
    return new Promise((resolve, reject) => {
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // ฟังก์ชันสร้าง beep เดี่ยว
        const createBeep = (startTime = 0) => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.value = 800; // ความถี่ 800 Hz
          oscillator.type = 'sine';
          
          // ปรับระดับเสียงให้นุ่มขึ้น
          gainNode.gain.setValueAtTime(0, audioContext.currentTime + startTime);
          gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + startTime + 0.05);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + startTime + 0.2);
          
          oscillator.start(audioContext.currentTime + startTime);
          oscillator.stop(audioContext.currentTime + startTime + 0.2);
          
          return oscillator;
        };
        
        // เล่นเสียง beep 3 ครั้งติดกัน
        const beep1 = createBeep(0);      // beep 1
        const beep2 = createBeep(0.3);    // beep 2 
        const beep3 = createBeep(0.6);    // beep 3
        
        console.log('🔊 Playing beep sequence: beep beep beep');
        
        // รอให้ beep ทั้งหมดเสร็จ (0.6 + 0.2 = 0.8 วินาที)
        setTimeout(() => {
          console.log('✅ Beep sequence completed');
          resolve();
        }, 900); // รอ 0.9 วินาที ให้แน่ใจว่าเสร็จ
        
      } catch (error) {
        console.log('Web Audio API not supported:', error);
        reject(error);
      }
    });
  };

  // ฟังก์ชันเล่นไฟล์เสียง
  const playAudioFile = () => {
    try {
      if (audioRef && audioRef.src) {
        audioRef.currentTime = 0;
        audioRef.play()
          .then(() => {
            console.log('🎵 Audio file played successfully');
          })
          .catch(error => {
            console.log('Audio file play failed:', error);
          });
      } else {
        console.log('⚠️ No audio file available');
      }
    } catch (error) {
      console.log('Audio file error:', error);
    }
  };

  const comfortLevelMapping = {
    0: {
      text: "No pain",
      daisyClass: "bg-base-300 text-base-content",
      badgeClass: "badge-ghost",
      color: "#7EDA57"
    },
    1: {
      text: "Mild Pain",
      daisyClass: "bg-warning text-warning-content",
      badgeClass: "badge-warning",
      color: "#f6b932"
    },
    2: {
      text: "Moderate Pain",
      daisyClass: "bg-warning text-warning-content",
      badgeClass: "badge-warning",
      color: "#EA580C"
    },
    3: {
      text: "Severe Pain",
      daisyClass: "bg-error text-error-content",
      badgeClass: "badge-error",
      color: "#f60b41"
    }
  };

  // ฟังก์ชันตรวจสอบการเปลี่ยนจาก Neutral เป็น Pain
  const checkPainTransition = (currentLevel, previousLevel) => {
    if (previousLevel === 0 && currentLevel === 1) {
      return true;
    }
    return false;
  };

  // ฟังก์ชันสำหรับรับทราบและปิด Modal
  const handleAcknowledgePain = () => {
    console.log("✅ Pain acknowledged by user");
    stopAlertSound();
    setShowPainModal(false);
    
    const acknowledgeTime = new Date().toISOString();
    console.log("Acknowledged at:", acknowledgeTime);
  };

  // Pain Alert Modal Component
  const PainAlertModal = () => {
    if (!showPainModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50">
        <div className="bg-white bg-opacity-95 rounded-lg p-8 max-w-md mx-4 shadow-2xl">
          {/* Alert Header */}
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
              <svg 
                className="w-8 h-8 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 16.5c-.77.833.192 2.5 1.732 2.5z" 
                />
              </svg>
            </div>
          </div>

          {/* Alert Content */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              🚨 PAIN ALERT
            </h2>
            <p className="text-gray-700 mb-4">
              Patient comfort level has changed from <span className="font-semibold text-gray-600">Neutral</span> to <span className="font-semibold text-red-600">Pain</span>
            </p>
            
            {/* Current Data Summary */}
            {latestData && (
              <div className="bg-red-50 p-4 rounded-lg mb-4 text-left">
                <p className="text-sm text-gray-600 mb-2">Current readings:</p>
                <div className="text-sm space-y-1">
                  <p><strong>EDA:</strong> {deviceData?.EDA || latestData.EDA || "--"} µS</p>
                  <p><strong>HR:</strong> {latestData.PPG > 200? "--" : latestData.PPG} bpm</p>
                  <p><strong>Skin Temp:</strong> {latestData.ST} °C</p>
                  <p><strong>Time:</strong> {new Date(latestData.timestamp).toLocaleTimeString()}</p>
                </div>
              </div>
            )}
            
            <p className="text-sm text-gray-600">
              Please check on the patient and acknowledge this alert.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleAcknowledgePain}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
            >
              Acknowledged
            </button>
            <button
              onClick={() => {
                stopAlertSound();
                setShowPainModal(false);
              }}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-3 px-6 rounded-lg transition duration-200"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    );
  };

  // แยก useEffect สำหรับดึงข้อมูล Predictions
  useEffect(() => {
    setLoading(true);
    const predictionsPath = "Predictions/Data/Latest";
    const firebaseQuery = query(ref(db, predictionsPath));
    
    const unsubscribe = onValue(
      firebaseQuery,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setLatestData(data);
          const currentLevel = parseInt(data.PainLevel, 10);
          console.log("Current data:", data);
          console.log("Previous pain level:", previousPainLevel);
          console.log("Current pain level:", currentLevel);
          
          // ตรวจสอบการเปลี่ยนจาก Neutral เป็น Pain
          if (previousPainLevel !== null && checkPainTransition(currentLevel, previousPainLevel)) {
            console.log("🚨 Pain detected! Showing modal...");
            setShowPainModal(true);
            startAlertSound();
          }
          
          const levelInfo = comfortLevelMapping[currentLevel] || {
            text: "- -",
            daisyClass: "bg-base-300 text-base-content",
            badgeClass: "badge-ghost",
            color: "#A0A0A0"
          };
          setComfortLevel(levelInfo.text);
          setComfortLevelClass(levelInfo.daisyClass);
          setPreviousPainLevel(currentLevel);
        } else {
          console.error("No data available");
          setComfortLevel("No data available");
          setComfortLevelClass("bg-base-300 text-base-content");
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching data:", error);
        setComfortLevel("Error fetching data");
        setComfortLevelClass("bg-base-300 text-base-content");
        setLoading(false);
      }
    );
    
    return () => unsubscribe();
  }, [previousPainLevel]);

  // แยก useEffect สำหรับดึงข้อมูล Device
  useEffect(() => {
    const devicePath = "Device/Inpatient/MD-V5-0000804/1s";
    const deviceQuery = query(ref(db, devicePath));
    
    const unsubscribeDevice = onValue(
      deviceQuery,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          console.log("Device data:", data);
          setDeviceData(data);
        } else {
          console.error("No device data available");
        }
      },
      (error) => {
        console.error("Error fetching device data:", error);
      }
    );
    
    return () => unsubscribeDevice();
  }, []);

  if (loading) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex justify-center items-center h-32">
            <span className="loading loading-spinner loading-lg"></span>
            <span className="ml-4">Loading pain level data...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!latestData) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-bold mb-2">No Data Available</h3>
          <p className="text-base-content/60">
            Pain monitoring data is currently unavailable
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <div className="text-sm text-gray-600">
          Last updated:{" "}
          <span className="font-medium">{new Date(latestData.timestamp).toLocaleTimeString()}</span>
        </div>
      </div>
      
      <div className="text-center mb-6">
        <div className={`hero rounded-lg ${comfortLevelClass} shadow-lg ${comfortLevel === "Pain" ? "animate-pulse" : ""}`}>
          <div className="hero-content text-center py-8">
            <div>
              <h1 className="text-5xl font-bold mb-4">{comfortLevel}</h1>
              <p className="text-lg opacity-80">Current Pain Assessment</p>
              {comfortLevel === "Pain" && (
                <div className="absolute top-2 right-2">
                  <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border-l-4 border-red-500 rounded-lg p-4 shadow-sm">
          <div className="text-center">
            <div className="text-red-500 text-2xl mb-2">❤️</div>
            <div className="text-gray-600 text-sm mb-1">Heart Rate</div>
            <div className="text-2xl font-bold text-red-500">
              {deviceData?.HeartRate ? parseFloat(deviceData.HeartRate).toFixed(0) : "--"}
              <span className="text-sm"> bpm</span>
            </div>
            <div className={deviceData?.HeartRate > 200 || deviceData?.HeartRate < 60? "text-xs text-red-600 mt-1" : "text-xs text-green-600 mt-1"} >{deviceData?.HeartRate > 200 || deviceData?.HeartRate < 60? "Abnormal Range" : "Normal Range"}</div>
          </div>
        </div>

        <div className="bg-white border-l-4 border-orange-500 rounded-lg p-4 shadow-sm">
          <div className="text-center">
            <div className="text-orange-500 text-2xl mb-2">🌡️</div>
            <div className="text-gray-600 text-sm mb-1">Skin Temperature</div>
            <div className="text-2xl font-bold text-orange-500">
              {deviceData?.ST ? parseFloat(deviceData.ST).toFixed(2) : "--"}
              <span className="text-sm">°C</span>
            </div>
            <div className="text-xs text-orange-600 mt-1">Elevated</div>
          </div>
        </div>

        <div className="bg-white border-l-4 border-blue-500 rounded-lg p-4 shadow-sm">
          <div className="text-center">
            <div className="text-blue-500 text-2xl mb-2">⚡</div>
            <div className="text-gray-600 text-sm mb-1">EDA</div>
            <div className="text-2xl font-bold text-blue-500">
              {deviceData?.EDA ? parseFloat(deviceData.EDA).toFixed(2) : "--"}
              <span className="text-sm">μS</span>
            </div>
            <div className="text-xs text-blue-600 mt-1">Normal</div>
          </div>
        </div>
      </div>

      {/* Test Button (for development)
      <div className="mt-6 text-center">
        <button
          onClick={() => {
            setShowPainModal(true);
            startAlertSound();
          }}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded text-sm"
        >
          🧪 Test Pain Alert (Dev Only)
        </button>
      </div> */}

      {/* Pain Alert Modal */}
      <PainAlertModal />
    </>
  );
}
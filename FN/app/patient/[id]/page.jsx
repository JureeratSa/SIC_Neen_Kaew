// PatientDetail.jsx
"use client";
import { useEffect, useState } from "react";
import { query, ref, onValue } from "firebase/database";
import { db } from "../../firebase";
import { useParams } from "next/navigation";
import Prediction from "@/components/Prediction";
import TrueRealtimeVitalSign from "@/components/VitalSign";
import Link from "next/link";
import OverviewSignals from '@/components/OverViewSignal';
import OverviewComfortLevel from '@/components/OverViewComfort';
import Swal from 'sweetalert2';

// BMI Circle Component
const BMICircle = ({ bmiValue = 0 }) => {
  const getBMICategory = (bmi) => {
    if (bmi < 18.5)
      return { category: "Underweight", color: "#06b6d4", bgColor: "#cffafe" };
    if (bmi < 25)
      return { category: "Normal", color: "#10b981", bgColor: "#d1fae5" };
    if (bmi < 30)
      return { category: "Overweight", color: "#f59e0b", bgColor: "#fef3c7" };
    return { category: "Obese", color: "#ef4444", bgColor: "#fee2e2" };
  };

  const { category, color, bgColor } = getBMICategory(bmiValue);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 text-center h-32 w-full flex flex-col justify-center">
      <div className="relative w-16 h-16 mx-auto mb-2">
        {/* Outer Circle with BMI category color */}
        <div
          className="w-16 h-16 rounded-full border-4 flex items-center justify-center"
          style={{
            borderColor: color,
            backgroundColor: bgColor,
          }}
        >
          {/* BMI Value */}
          <div className="text-lg font-bold" style={{ color }}>
            {bmiValue}
          </div>
        </div>
      </div>

      <div className="text-xs text-gray-600">
        <div className="font-medium" style={{ color }}>
          {category}
        </div>
        <div className="text-gray-500">BMI Status</div>
      </div>
    </div>
  );
};

const PatientDetail = () => {
  const { id } = useParams();
  const [patientData, setPatientData] = useState();
  const [battery, setBattery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("patient-info");

  const [deviceStatus, setDeviceStatus] = useState({
    isActive: false,
    lastUpdate: null,
    timeSinceUpdate: 0
  });

  
  // เพิ่ม state สำหรับ modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    weight: '',
    height: '',
    bmi: '',
    sex: '',
    age: ''
  });

  console.log("id : ", id);

   const calculateTimeSinceUpdate = (lastUpdateTime) => {
    if (!lastUpdateTime) return 0;
    const now = new Date();
    const updateTime = new Date(lastUpdateTime);
    return Math.floor((now - updateTime) / 1000); // seconds
  };

  // Function สำหรับตรวจสอบ device status
  const checkDeviceStatus = (lastUpdateTime) => {
    const timeSince = calculateTimeSinceUpdate(lastUpdateTime);
    return {
      isActive: timeSince < 60, // Active ถ้าอัพเดตภายใน 1 นาที (60 วินาที)
      timeSinceUpdate: timeSince
    };
  };

  useEffect(() => {
    const firebase_patients_db = query(ref(db, `Patients/Data/${id}`));

    const unsubscribe_patients = onValue(firebase_patients_db, (snapshot) => {
      const patient_data = snapshot.val();
      if (patient_data) {
        setPatientData(patient_data);
      }
      setLoading(false);
    });

    return () => {
      unsubscribe_patients();
    };
  }, [id]);

  // แก้ไข useEffect สำหรับ device monitoring
  useEffect(() => {
    const devicePath = "Device/Inpatient/MD-V5-0000804/1s"; // เปลี่ยนเป็น path ที่คุณต้องการ
    const deviceQuery = query(ref(db, devicePath));
    
    const unsubscribeDevice = onValue(
      deviceQuery,
      (snapshot) => {
        const data = snapshot.val();
        const currentTime = new Date().toISOString();
        
        if (data) {
          console.log("Device data updated:", data);
          
          // อัพเดต battery ถ้ามี
          if (data.BatteryPercent !== undefined) {
            setBattery(data.BatteryPercent);
          }
          
          // อัพเดต device status
          setDeviceStatus({
            isActive: true,
            lastUpdate: currentTime,
            timeSinceUpdate: 0
          });
          
        } else {
          console.log("No device data available");
          // ถ้าไม่มีข้อมูล ให้ใช้เวลาปัจจุบันเป็น reference
          setDeviceStatus(prev => ({
            ...prev,
            isActive: false
          }));
        }
      },
      (error) => {
        console.error("Error fetching device data:", error);
        setDeviceStatus(prev => ({
          ...prev,
          isActive: false
        }));
      }
    );

    // Timer เพื่ือัพเดตเวลาทุก 5 วินาที
    const statusUpdateTimer = setInterval(() => {
      setDeviceStatus(prev => {
        if (prev.lastUpdate) {
          const status = checkDeviceStatus(prev.lastUpdate);
          return {
            ...prev,
            isActive: status.isActive,
            timeSinceUpdate: status.timeSinceUpdate
          };
        }
        return prev;
      });
    }, 5000); // อัพเดตทุก 5 วินาที
    
    return () => {
      unsubscribeDevice();
      clearInterval(statusUpdateTimer);
    };
  }, []);

  // Function สำหรับแสดงเวลาที่ผ่านมาแบบ human-readable
  const formatTimeSinceUpdate = (seconds) => {
    if (seconds < 60) {
      return `${seconds}s ago`;
    } else if (seconds < 3600) {
      return `${Math.floor(seconds / 60)}m ago`;
    } else {
      return `${Math.floor(seconds / 3600)}h ago`;
    }
  };

  // แก้ไขส่วนแสดง Device Status
  const DeviceStatusDisplay = () => (
    <div className="mb-8">
      <h3 className="font-bold text-gray-800 mb-4">
        Device Information:
      </h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center pb-3 border-b border-slate-600">
          <span className="text-gray-600">Device ID:</span>
          <span className="font-medium text-gray-800">
            {patientData?.DeviceID || "001"}
          </span>
        </div>
        
        {/* Status with real-time indicator */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-600">
          <span className="text-gray-600">Status:</span>
          <div className="flex items-center gap-2">
            <div 
              className={`w-2 h-2 rounded-full ${
                deviceStatus.isActive ? 'bg-green-500' : 'bg-red-500'
              } animate-pulse`}
            />
            <span className={`font-medium ${
              deviceStatus.isActive ? 'text-green-600' : 'text-red-600'
            }`}>
              {deviceStatus.isActive ? 'Active' : 'Non-active'}
            </span>
          </div>
        </div>

        {/* Last Update Time */}
        {deviceStatus.lastUpdate && (
          <div className="flex justify-between items-center pb-3 border-b border-slate-600">
            <span className="text-gray-600">Last Update:</span>
            <span className="font-medium text-gray-800 text-sm">
              {formatTimeSinceUpdate(deviceStatus.timeSinceUpdate)}
            </span>
          </div>
        )}
        
        <div className="flex justify-between items-center pb-3 border-b border-slate-600">
          <span className="text-gray-600">Battery:</span>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-800">{battery || '--'}%</span>
            {battery && (
              <div className="w-8 h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${
                    battery > 20 ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.max(battery, 5)}%` }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Warning message สำหรับ Non-active */}
      {!deviceStatus.isActive && deviceStatus.lastUpdate && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-red-700 text-sm font-medium">
              Device has been inactive for {formatTimeSinceUpdate(deviceStatus.timeSinceUpdate)}
            </span>
          </div>
          <div className="text-red-600 text-xs mt-1">
            No data received for more than 1 minute
          </div>
        </div>
      )}
    </div>
  );

  useEffect(() => {
    const firebase_patients_db = query(ref(db, `Patients/Data/${id}`));

    const unsubscribe_patients = onValue(firebase_patients_db, (snapshot) => {
      const patient_data = snapshot.val();
      if (patient_data) {
        setPatientData(patient_data);
      }
      setLoading(false);
    });

    return () => {
      unsubscribe_patients();
    };
  }, [id]);

  useEffect(() => {
    const batteryPath = "Device/Inpatient/MD-V5-0000804/1s/BatteryPercent";
    const batteryQuery = query(ref(db, batteryPath));
    
    const unsubscribeDevice = onValue(
      batteryQuery,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          console.log("Device data:", data);
          setBattery(data);
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

  // เมื่อเปิด modal ให้เซ็ตข้อมูลเดิม
  const openModal = () => {
  setFormData({
    weight: patientData?.Weight || '',
    height: patientData?.Height || '',
    bmi: patientData?.BMI || '',
    sex: patientData?.Sex || '',
    age: patientData?.Age || ''  // ← เพิ่มตรงนี้
  });
  setIsModalOpen(true);
};


  // คำนวณ BMI อัตโนมัติ
  const calculateBMI = (weight, height) => {
    if (weight && height) {
      const heightInMeters = height / 100;
      const bmi = weight / (heightInMeters * heightInMeters);
      return bmi.toFixed(1);
    }
    return '';
  };

  // จัดการการเปลี่ยนแปลงใน form
  const handleInputChange = (field, value) => {
    const newFormData = { ...formData, [field]: value };
    
    // ถ้าเปลี่ยน weight หรือ height ให้คำนวณ BMI ใหม่
    if (field === 'weight' || field === 'height') {
      const weight = field === 'weight' ? parseFloat(value) : parseFloat(newFormData.weight);
      const height = field === 'height' ? parseInt(value) : parseInt(newFormData.height);
      newFormData.bmi = calculateBMI(weight, height);
    }
    
    setFormData(newFormData);
  };
const handleSubmit = async (e) => {
  e.preventDefault();
  setIsUpdating(true);

  try {
    const updateData = {
      weight: parseFloat(formData.weight),
      height: parseInt(formData.height),
      bmi: parseFloat(formData.bmi),
      sex: formData.sex,
      age: parseInt(formData.age)
    };

    console.log('Sending data:', updateData);

    // แก้ไข URL ตามที่ต้องการ
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL 
      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/patient_data/${id}`
      : `http://localhost:8000/patient_data/${id}`;

    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(updateData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('Success response:', result);
    
    // อัพเดต state ใน component
    setPatientData(prev => ({
      ...prev,
      Weight: updateData.weight,
      Height: updateData.height,
      BMI: updateData.bmi,
      Sex: updateData.sex,
      Age: updateData.age
    }));

    // ปิด modal
    setIsModalOpen(false);
    
    // แสดง Success Alert ด้วย SweetAlert2
    Swal.fire({
      title: 'Success!',
      text: 'Patient data updated successfully',
      icon: 'success',
      confirmButtonText: 'OK',
      confirmButtonColor: '#10b981',
      timer: 3000,
      timerProgressBar: true,
      showClass: {
        popup: 'animate__animated animate__fadeInDown'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp'
      }
    });

  } catch (error) {
    console.error('Full error details:', error);
    
    // กำหนด error message
    let errorTitle = 'Update Failed';
    let errorMessage = 'Error updating patient data';
    let errorIcon = 'error';
    
    if (error.message.includes('Failed to fetch')) {
      errorTitle = 'Network Error';
      errorMessage = 'Cannot connect to server. Please check if the API server is running.';
      errorIcon = 'warning';
    } else if (error.message.includes('404')) {
      errorTitle = 'Not Found';
      errorMessage = `Patient with ID "${id}" not found.`;
    } else if (error.message.includes('400')) {
      errorTitle = 'Invalid Data';
      errorMessage = 'Invalid data format. Please check your input.';
    } else if (error.message.includes('500')) {
      errorTitle = 'Server Error';
      errorMessage = 'Server error. Please try again later.';
    } else {
      errorMessage = error.message;
    }
    
    // แสดง Error Alert ด้วย SweetAlert2
    Swal.fire({
      title: errorTitle,
      text: errorMessage,
      icon: errorIcon,
      confirmButtonText: 'Try Again',
      confirmButtonColor: '#ef4444',
      showClass: {
        popup: 'animate__animated animate__shakeX'
      }
    });
    
  } finally {
    setIsUpdating(false);
  }
};

// เพิ่ม Confirmation Dialog ก่อนการ Update (Optional)
const handleSubmitWithConfirmation = async (e) => {
  e.preventDefault();

  // แสดง Confirmation Dialog ก่อน
  const result = await Swal.fire({
    title: 'Confirm Update',
    text: 'Are you sure you want to update this patient information?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#06b6d4',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Yes, Update',
    cancelButtonText: 'Cancel',
    showClass: {
      popup: 'animate__animated animate__zoomIn'
    }
  });

  // ถ้าผู้ใช้กด Cancel ให้หยุด
  if (!result.isConfirmed) {
    return;
  }

  // ถ้าผู้ใช้กด Confirm ให้ทำการ update
  setIsUpdating(true);

  try {
    const updateData = {
      weight: parseFloat(formData.weight),
      height: parseInt(formData.height),
      bmi: parseFloat(formData.bmi),
      sex: formData.sex
    };

    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL 
      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/patient_data/${id}`
      : `http://localhost:8000/patient_data/${id}`;

    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(updateData)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const responseData = await response.json();
    
    // อัพเดต state
    setPatientData(prev => ({
      ...prev,
      Weight: updateData.weight,
      Height: updateData.height,
      BMI: updateData.bmi,
      Sex: updateData.sex
    }));

    // ปิด modal
    setIsModalOpen(false);
    
    // แสดง Success with custom HTML
    Swal.fire({
      title: '<strong>Update Successful!</strong>',
      html: `
        <div class="text-left">
          <p><strong>Weight:</strong> ${updateData.weight} kg</p>
          <p><strong>Height:</strong> ${updateData.height} cm</p>
          <p><strong>BMI:</strong> ${updateData.bmi}</p>
          <p><strong>Gender:</strong> ${updateData.sex}</p>
        </div>
      `,
      icon: 'success',
      confirmButtonColor: '#10b981',
      timer: 4000,
      timerProgressBar: true,
      showClass: {
        popup: 'animate__animated animate__bounceIn'
      }
    });

  } catch (error) {
    console.error('Error:', error);
    
    Swal.fire({
      title: 'Update Failed',
      text: 'Something went wrong. Please try again.',
      icon: 'error',
      confirmButtonColor: '#ef4444'
    });
  } finally {
    setIsUpdating(false);
  }
};

// Loading Alert (แสดงขณะกำลัง update)
const showLoadingAlert = () => {
  Swal.fire({
    title: 'Updating...',
    html: 'Please wait while we update the patient information.',
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
};

// ปิด Loading Alert
const closeLoadingAlert = () => {
  Swal.close();
};

  // Modal Component
  const UpdateModal = () => {
    if (!isModalOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              Edit Patient Information
            </h2>
            <button
              onClick={() => setIsModalOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Age (years)
            </label>
            <input
              type="number"
              min="0"
              max="150"
              value={formData.age}
              onChange={(e) => handleInputChange('age', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Enter age"
              required
            />
          </div>
            {/* Weight */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={(e) => handleInputChange('weight', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Enter weight"
                required
              />
            </div>

            {/* Height */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Height (cm)
              </label>
              <input
                type="number"
                value={formData.height}
                onChange={(e) => handleInputChange('height', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Enter height"
                required
              />
            </div>

            {/* BMI (Read-only, auto-calculated) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                BMI (Auto-calculated)
              </label>
              <input
                type="text"
                value={formData.bmi}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                placeholder="BMI will be calculated automatically"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender
              </label>
              <select
                value={formData.sex}
                onChange={(e) => handleInputChange('sex', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdating}
                className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors disabled:bg-teal-300"
              >
                {isUpdating ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Updating...
                  </div>
                ) : (
                  'Save'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  const renderMainContent = () => {
    switch (activeTab) {
      case "patient-info":
        return (
          <div className="space-y-6">
            {/* Prediction Component */}
            <div className="mb-6">
              <Prediction />
            </div>

            {/* Pain Management */}
            <div className="bg-white rounded-lg border p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  Pain Management & Prescriptions
                </h2>
                <button className="text-teal-600 text-sm font-medium hover:text-teal-700">
                  + Add medication
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-red-500 text-xl">💊</div>
                    <div>
                      <div className="font-semibold text-gray-800">
                        Pain Relief - Morphine 10mg
                      </div>
                      <div className="text-sm text-gray-600">
                        Last administered: 2 hours ago
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-red-600 font-medium">
                      Next dose available in 2 hours
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-orange-500 text-xl">💊</div>
                    <div>
                      <div className="font-semibold text-gray-800">
                        Heart Medication
                      </div>
                      <div className="text-sm text-gray-600">
                        3 months duration
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">
                      25th October 2019
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "vital-signs":
        return (
          <div className="p-8 min-h-screen">
            <div className="grid grid-cols-2 gap-6 h-96 mb-20">
              <div className="flex justify-center items-center h-full w-full">
                <div className="w-full h-full max-w-xs">
                  <TrueRealtimeVitalSign
                    title="EDA"
                    dataPath="Device/Inpatient/MD-V5-0000804/1s/EDA"
                    timestamp_path="/Preprocessing/EDA/Timestamp"
                    unit="µS"
                    yMin={0}
                    yMax={5}
                    bdColor="#87CEFA"
                    bgColor="#87CEFA"
                  />
                </div>
              </div>

              <div className="flex justify-center items-center h-full w-full">
                <div className="w-full h-full max-w-xs">
                  <TrueRealtimeVitalSign
                    title="Phasic"
                    dataPath="Preprocessing/EDA/EDA_Phasic"
                    timestamp_path="/Preprocessing/EDA/Timestamp"
                    unit="µS"
                    yMin={-2}
                    yMax={2}
                    bdColor="#339999"
                    bgColor="#339999"
                  />
                </div>
              </div>

              <div className="flex justify-center items-center h-full w-full">
                <div className="w-full h-full max-w-xs">
                  <TrueRealtimeVitalSign
                    title="Tonic"
                    dataPath="Preprocessing/EDA/EDA_Tonic"
                    timestamp_path="/Preprocessing/EDA/Timestamp"
                    unit="µS"
                    yMin={-5}
                    yMax={5}
                    bdColor="#FF6666"
                    bgColor="#FF6666"
                  />
                </div>
              </div>

              <div className="flex justify-center items-center h-full w-full">
                <div className="w-full h-full max-w-xs">
                  <TrueRealtimeVitalSign
                    title="Skin Temperature"
                    dataPath="Device/Inpatient/MD-V5-0000804/1s/ST"
                    sdPath="Device/Inpatient/MD-V5-0000804/1s/SD-ST"
                    unit="°C"
                    yMin={29}
                    yMax={38}
                    bdColor="#FF9966"
                    bgColor="#FF9966"
                  />
                </div>
              </div>
            </div>

            <div style={{ height: '450px' }}></div>

            <div className="space-y-8 relative">
              <div className="bg-white p-6 rounded-lg shadow-lg border w-full clear-both">
                <OverviewComfortLevel/>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-lg border w-full">
                <OverviewSignals/>
              </div>
            </div>
          </div>
        );

      case "medical-history":
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Pain History Timeline
              </h2>

              <div className="space-y-4">
                {[
                  {
                    date: "12/05/2023",
                    time: "14:30",
                    painLevel: 8,
                    location: "Lower Back",
                    description: "Severe pain during movement",
                    treatment: "Morphine 10mg administered",
                    color: "border-red-500",
                    bgColor: "bg-red-50",
                    icon: "🔴"
                  },
                  {
                    date: "12/05/2023",
                    time: "10:15",
                    painLevel: 6,
                    location: "Chest Area",
                    description: "Moderate pain, breathing difficulty",
                    treatment: "Oxygen therapy + Pain relief",
                    color: "border-orange-500",
                    bgColor: "bg-orange-50",
                    icon: "🟠"
                  },
                  {
                    date: "11/05/2023",
                    time: "22:45",
                    painLevel: 4,
                    location: "Abdomen",
                    description: "Mild cramping sensation",
                    treatment: "Monitoring only",
                    color: "border-yellow-500",
                    bgColor: "bg-yellow-50",
                    icon: "🟡"
                  },
                  {
                    date: "11/05/2023",
                    time: "16:20",
                    painLevel: 3,
                    location: "Head",
                    description: "Light headache",
                    treatment: "Paracetamol 500mg",
                    color: "border-green-500",
                    bgColor: "bg-green-50",
                    icon: "🟢"
                  }
                ].map((record, index) => (
                  <div
                    key={index}
                    className={`${record.bgColor} border-l-4 ${record.color} rounded-r-lg p-4 shadow-sm`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{record.icon}</div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-lg text-gray-800">
                              Pain Level: {record.painLevel}/10
                            </h3>
                            <span className="text-sm text-gray-500">
                              ({record.painLevel >= 7 ? 'Severe' : 
                                record.painLevel >= 5 ? 'Moderate' : 
                                record.painLevel >= 3 ? 'Mild' : 'Very Mild'})
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-700">
                            Location: {record.location}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600 font-medium">
                          {record.date}
                        </div>
                        <div className="text-xs text-gray-500">
                          {record.time}
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-11 space-y-2">
                      <div className="text-sm text-gray-700">
                        <strong>Description:</strong> {record.description}
                      </div>
                      <div className="text-sm text-gray-700">
                        <strong>Treatment:</strong> {record.treatment}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pain Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
                <div className="bg-red-100 rounded-lg p-4 text-center border border-red-200">
                  <div className="text-red-600 text-sm mb-1">Severe Pain</div>
                  <div className="text-2xl font-bold text-red-700">2</div>
                  <div className="text-xs text-red-600">
                    Episodes (7-10)
                  </div>
                </div>
                <div className="bg-orange-100 rounded-lg p-4 text-center border border-orange-200">
                  <div className="text-orange-600 text-sm mb-1">Moderate Pain</div>
                  <div className="text-2xl font-bold text-orange-700">3</div>
                  <div className="text-xs text-orange-600">
                    Episodes (4-6)
                  </div>
                </div>
                <div className="bg-yellow-100 rounded-lg p-4 text-center border border-yellow-200">
                  <div className="text-yellow-600 text-sm mb-1">Mild Pain</div>
                  <div className="text-2xl font-bold text-yellow-700">4</div>
                  <div className="text-xs text-yellow-600">
                    Episodes (1-3)
                  </div>
                </div>
                <div className="bg-blue-100 rounded-lg p-4 text-center border border-blue-200">
                  <div className="text-blue-600 text-sm mb-1">Avg Pain Level</div>
                  <div className="text-2xl font-bold text-blue-700">5.2</div>
                  <div className="text-xs text-blue-600">
                    Last 24 hours
                  </div>
                </div>
              </div>

              {/* Pain Locations Chart */}
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-bold text-lg text-gray-800 mb-4">
                  Most Common Pain Locations
                </h3>
                <div className="space-y-3">
                  {[
                    { location: "Lower Back", count: 5, percentage: 45 },
                    { location: "Chest Area", count: 3, percentage: 27 },
                    { location: "Abdomen", count: 2, percentage: 18 },
                    { location: "Head", count: 1, percentage: 10 }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-teal-500 rounded"></div>
                        <span className="text-sm font-medium text-gray-700">
                          {item.location}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-teal-500 h-2 rounded-full"
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 min-w-[3rem]">
                          {item.count} times
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Medications */}
              <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-bold text-lg text-gray-800 mb-4">
                  Recent Pain Medications
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded border">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="text-blue-500">💊</div>
                      <span className="font-medium">Morphine 10mg</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Last: 2 hours ago | Next: 2 hours
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="text-green-500">💊</div>
                      <span className="font-medium">Paracetamol 500mg</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Last: 6 hours ago | Available now
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen ">
      <div className="flex h-screen">
        {/* Left Sidebar - Patient Card (1/3 width) */}
        <div className="w-1/3 bg-transparent overflow-y-auto">
          <div className="p-6">
            {/* Back Button */}
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-600 mb-6 cursor-pointer hover:text-gray-800 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span className="text-sm">Back to dashboard</span>
            </Link>

            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-800 mb-8">
              Current Appointment
            </h1>

            {/* Profile Section */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-full bg-teal-500 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                {patientData?.First_name?.charAt(0) || "--"}
                {patientData?.Last_name?.charAt(0) || "--"}
              </div>

              <h2 className="text-xl font-bold text-gray-800 mb-1">
                {patientData?.First_name || "Roger"}{" "}
                {patientData?.Last_name || "Curtis"}
              </h2>
              <p className="text-gray-600 text-sm mb-4">
                Age: {patientData?.Age || "35"}
              </p>

              <button 
                onClick={openModal}
                className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-full text-sm font-medium transition-colors"
              >
                Update
              </button>
            </div>

            <DeviceStatusDisplay />



            {/* Information Section */}
            <div className="mb-8">
              <h3 className="font-bold text-gray-800 mb-4">Information:</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-3 border-b border-slate-600">
                  <span className="text-gray-600">Gender:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {patientData?.Sex === "Male"
                        ? "♂️"
                        : patientData?.Sex === "Female"
                        ? "♀️"
                        : "♂️"}
                    </span>
                    <span className="font-medium text-gray-800">
                      {patientData?.Sex || "Male"}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-600">
                  <span className="text-gray-600">Diseases:</span>
                  <span className="font-medium text-gray-800">
                    {patientData?.Diagnosis || "-"}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-600">
                  <span className="text-gray-600">Patient ID:</span>
                  <span className="font-medium text-gray-800">
                    {patientData?.HN || "204896786"}
                  </span>
                </div>
              </div>
            </div>

            {/* Physical Information */}
            <div className="mb-8">
              <h3 className="font-bold text-gray-800 mb-4">
                Physical Information:
              </h3>

              {/* Height & Weight */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center">
                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-center h-24 flex flex-col justify-center">
                    <div className="text-gray-600 text-sm mb-1">Height</div>
                    <div className="text-xl font-bold text-gray-800">
                      {patientData?.Height || "178"}cm
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-center h-24 flex flex-col justify-center">
                    <div className="text-gray-600 text-sm mb-1">Weight</div>
                    <div className="text-xl font-bold text-gray-800">
                      {patientData?.Weight || "65"} kg
                    </div>
                  </div>
                </div>
              </div>

              {/* BMI Section with Circle */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-center h-32 w-full flex flex-col justify-center">
                    <div className="text-3xl font-bold text-orange-500 mb-2">
                      {patientData?.BMI || "-"}
                    </div>
                    <div className="text-gray-600 text-sm">BMI Value</div>
                  </div>
                </div>
                <div className="text-center">
                  <BMICircle
                    bmiValue={parseFloat(patientData?.BMI || "-")}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content Area (2/3 width) */}
        <div className="w-2/3 flex flex-col bg-white br-10 rounded-lg">
          {/* Header with Dr. Info */}
          <div className="flex justify-end items-center p-6 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-500"></div>
              <span className="font-medium text-gray-800">{patientData?.Doctor_name}</span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("patient-info")}
              className={`px-6 py-4 font-medium transition-colors relative ${
                activeTab === "patient-info"
                  ? "text-teal-600 bg-teal-50"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Patient Information
              {activeTab === "patient-info" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab("vital-signs")}
              className={`px-6 py-4 font-medium transition-colors relative ${
                activeTab === "vital-signs"
                  ? "text-teal-600 bg-teal-50"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Vital signs
              {activeTab === "vital-signs" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab("medical-history")}
              className={`px-6 py-4 font-medium transition-colors relative ${
                activeTab === "medical-history"
                  ? "text-teal-600 bg-teal-50"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Medical history
              {activeTab === "medical-history" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600"></div>
              )}
            </button>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {renderMainContent()}
          </div>
        </div>
      </div>

      {/* Update Modal */}
      <UpdateModal />
    </div>
  );
};

export default PatientDetail;
// PatientDetail.jsx
"use client";
import { useEffect, useState } from "react";
import { query, ref, onValue } from "firebase/database";
import { db } from "../../firebase";
import { useParams } from "next/navigation";
import Prediction from "@/components/Prediction";
import TrueRealtimeVitalSign from "@/components/VitalSign";
import Link from "next/link";
import OverviewSignals from "@/components/OverViewSignal";

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
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("patient-info");
  console.log("id : ",id)

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
            {/* Timestamp - Top Right */}
            

            {/* Prediction Component */}
            <div className="mb-6">
              <Prediction />
            </div>

            {/* Vital Signs Grid - 3 Columns */}
            

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
          <div className="p-8 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-96">
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
          </div>
        );

      case "medical-history":
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Medical History Timeline
              </h2>

              <div className="space-y-4">
                {[
                  {
                    date: "12/05/2023",
                    doctor: "Dr. Rukories",
                    specialty: "Internal Medicine",
                    diagnosis: "Chronic Bronchitis",
                    color: "border-red-500",
                  },
                  {
                    date: "07/10/2022",
                    doctor: "Dr. Joe",
                    specialty: "Neurology",
                    diagnosis: "Chronic Migraine",
                    color: "border-yellow-500",
                  },
                  {
                    date: "05/12/2022",
                    doctor: "Dr. John",
                    specialty: "Internal Medicine",
                    diagnosis: "Asthma",
                    color: "border-green-500",
                  },
                ].map((record, index) => (
                  <div
                    key={index}
                    className={`bg-white border-l-4 ${record.color} rounded-r-lg p-4 shadow-sm`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg text-gray-800">
                          {record.diagnosis}
                        </h3>
                        <p className="text-sm text-gray-600 mb-1">
                          {record.doctor} - {record.specialty}
                        </p>
                        <div className="inline-block border border-gray-300 rounded px-2 py-1 text-xs text-gray-600">
                          {record.date}
                        </div>
                      </div>
                      <div className="text-2xl">
                        {index === 0 ? "🫁" : index === 1 ? "🧠" : "💊"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <div className="bg-gray-100 rounded-lg p-4 text-center">
                  <div className="text-gray-600 text-sm mb-1">Total Visits</div>
                  <div className="text-2xl font-bold text-blue-600">8</div>
                  <div className="text-xs text-gray-500">
                    Medical consultations
                  </div>
                </div>
                <div className="bg-gray-100 rounded-lg p-4 text-center">
                  <div className="text-gray-600 text-sm mb-1">Avg Duration</div>
                  <div className="text-2xl font-bold text-purple-600">45</div>
                  <div className="text-xs text-gray-500">Minutes per visit</div>
                </div>
                <div className="bg-gray-100 rounded-lg p-4 text-center">
                  <div className="text-gray-600 text-sm mb-1">Last Visit</div>
                  <div className="text-2xl font-bold text-orange-600">Dec</div>
                  <div className="text-xs text-gray-500">2022</div>
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
                {patientData?.First_name?.charAt(0) || "R"}
                {patientData?.Last_name?.charAt(0) || "C"}
              </div>

              <h2 className="text-xl font-bold text-gray-800 mb-1">
                {patientData?.First_name || "Roger"}{" "}
                {patientData?.Last_name || "Curtis"}
              </h2>
              <p className="text-gray-600 text-sm mb-4">
                Age: {patientData?.Age || "35"}
              </p>

              <button className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-full text-sm font-medium transition-colors">
                Update
              </button>
            </div>

            {/* Device Information */}
            <div className="mb-8">
              <h3 className="font-bold text-gray-800 mb-4">
                Device Information:
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-3 border-b border-slate-600">
                  <span className="text-gray-600">Device ID:</span>
                  <span className="font-medium text-gray-800">
                    {patientData?.DeviceID || "MD-V5-000804"}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-600">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium text-gray-800">Active</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-600">
                  <span className="text-gray-600">Battery:</span>
                  <span className="font-medium text-gray-800">85%</span>
                </div>
              </div>
            </div>

            {/* Information Section */}
            <div className="mb-8">
              <h3 className="font-bold text-gray-800 mb-4">Information:</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-3 border-b border-slate-600">
                  <span className="text-gray-600">Gender:</span>
                  <div className="flex items-center  gap-2">
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
        <div className="w-2/3 flex flex-col bg-white br-10 rounded-lg  ">
          {/* Header with Dr. Info */}
          <div className="flex justify-end items-center p-6 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-500"></div>
              <span className="font-medium text-gray-800">{patientData.Doctor_name}</span>
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
    </div>
  );
};

export default PatientDetail;

"use client";
import { useEffect, useState } from "react";
import { query, ref, onValue } from "firebase/database";
import { db } from "../../firebase";
import { useParams } from "next/navigation";
import Prediction from "@/components/Prediction";
import VitalSign from "@/components/VitalSign";
import { HeartRate, SkinTemp, EDA } from "@/components/VitalSign";
import MedicalHistory from "@/components/MedicalHistory";
import OverviewSignals from "@/components/OverViewSignal";
import { FaUser } from "react-icons/fa";
import OverviewComfortLevel from "@/components/OverViewComfort";
import PatientCard from "../../../components/PersonalCard";

const PatientDetail = () => {
  const { id } = useParams();
  const [patientData, setPatientData] = useState();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("patient-info");

  useEffect(() => {
    const firebase_patients_db = query(ref(db, `Patients/Data/002`));
    
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
      <div className="flex justify-center items-center min-h-screen text-gray-600">
        Loading...
      </div>
    );
  }

  const tabs = [
    {
      id: "patient-info",
      label: "Patient Information",
      activeColor: "bg-blue-500 text-white",
      inactiveColor: "bg-gray-200 text-gray-700 hover:bg-gray-300"
    },
    {
      id: "vital-signs",
      label: "Vital signs",
      activeColor: "bg-blue-500 text-white",
      inactiveColor: "bg-gray-200 text-gray-700 hover:bg-gray-300"
    },
    {
      id: "medical-history",
      label: "Medical history",
      activeColor: "bg-blue-500 text-white",
      inactiveColor: "bg-gray-200 text-gray-700 hover:bg-gray-300"
    }
  ];

  const renderMainContent = () => {
    switch (activeTab) {
      case "patient-info":
        return (
          <div className="bg-white p-6 rounded-lg shadow-lg h-full">
            {/* Critical Condition Alert */}
            <div className="bg-red-100 border border-red-300 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-red-800">Critical Condition Alert</h3>
                <div className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                  !
                </div>
              </div>
              <div className="bg-red-200 rounded-md p-3">
                <h4 className="font-semibold text-red-800 mb-2">Additional Information</h4>
                <div className="text-sm text-red-700 space-y-1">
                  <p>Patient is on anticoagulants : Monitor for recurrent bleeding</p>
                  <p>BMI 28.7 (Overweight) : May affect drug response and metabolism</p>
                  <p>Age 70 : Exercise caution regarding pain medication and antidepressant side effects</p>
                </div>
              </div>
            </div>

            {/* Comfort Status */}
            <div className="mb-6">
            <Prediction/>
            </div>

            {/* Vital Statistics Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-100 p-4 rounded-lg">
                <div className="font-semibold text-gray-700">EDA</div>
                <div className="text-lg font-bold">0.7 μS</div>
              </div>
              <div className="bg-gray-100 p-4 rounded-lg">
                <div className="font-semibold text-gray-700">Heart rate</div>
                <div className="text-lg font-bold">70 bpm</div>
              </div>
              <div className="bg-gray-100 p-4 rounded-lg">
                <div className="font-semibold text-gray-700">Skin Temperature</div>
                <div className="text-lg font-bold">34.0 °C</div>
              </div>
              <div className="bg-gray-100 p-4 rounded-lg">
                <div className="font-semibold text-gray-700">Timestamp</div>
                <div className="text-lg font-bold">2025-05-13 14:32:00</div>
              </div>
            </div>
          </div>
        );

      case "vital-signs":
        return (
          <div className="bg-white p-6 rounded-lg shadow-lg h-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Physical signals</h2>
            
            {/* Heart Rate and Skin Temperature */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="bg-white border rounded-lg p-4">
                <div className="bg-red-400 text-white text-center py-2 rounded-md font-semibold mb-3">
                  Heart rate
                </div>
                <div className="text-center text-xl font-bold mb-3">70 bpm</div>
                {/* Chart placeholder */}
                <div className="h-32 bg-gray-100 rounded-md flex items-center justify-center">
                  <VitalSign
                    title=""
                    dataPath="Device/Inpatient/MD-V5-0000804/1s/PPG"
                    sdPath="Device/Inpatient/MD-V5-0000804/1s/SD-PPG"
                    unit="BPM"
                    yMin={60}
                    yMax={200}
                    bdColor="#FF6666"
                    bgColor="#FF6666"
                  />
                </div>
              </div>

              <div className="bg-white border rounded-lg p-4">
                <div className="bg-orange-400 text-white text-center py-2 rounded-md font-semibold mb-3">
                  Skin Temperature
                </div>
                <div className="text-center text-xl font-bold mb-3">34°C</div>
                {/* Chart placeholder */}
                <div className="h-32 bg-gray-100 rounded-md flex items-center justify-center">
                  <VitalSign
                    title=""
                    dataPath="Device/Inpatient/MD-V5-0000804/1s/ST"
                    sdPath="Device/Inpatient/MD-V5-0000804/1s/SD-ST"
                    unit="°C"
                    yMin={25}
                    yMax={40}
                    bdColor="#FF9966"
                    bgColor="#FF9966"
                  />
                </div>
              </div>
            </div>

            {/* Electrodermal Activity */}
            <div className="bg-white border rounded-lg p-4">
              <div className="bg-blue-400 text-white text-center py-2 rounded-md font-semibold mb-3">
                Electrodermal Activity
              </div>
              <div className="text-center text-xl font-bold mb-3">0.7 μS</div>
              {/* Chart placeholder */}
              <div className="h-32 bg-gray-100 rounded-md flex items-center justify-center">
                <VitalSign
                  title=""
                  dataPath="Device/Inpatient/MD-V5-0000804/1s/EDA"
                  sdPath="Device/Inpatient/MD-V5-0000804/1s/SD-EDA"
                  unit="µS"
                  yMin={0}
                  yMax={10}
                  bdColor="#87CEFA"
                  bgColor="#87CEFA"
                />
              </div>
            </div>
          </div>
        );

      case "medical-history":
        return (
          <div className="bg-white p-6 rounded-lg shadow-lg h-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Medical history</h2>
            
            {/* Medical History Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">Date</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">Doctor</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">Expertise</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">Diagnosis</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3">12/05/2023</td>
                    <td className="border border-gray-300 px-4 py-3">Dr. Rukories</td>
                    <td className="border border-gray-300 px-4 py-3">Internal Medicine</td>
                    <td className="border border-gray-300 px-4 py-3">Chronic Bronchitis</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3">07/10/2022</td>
                    <td className="border border-gray-300 px-4 py-3">Dr. Joe</td>
                    <td className="border border-gray-300 px-4 py-3">Neurology</td>
                    <td className="border border-gray-300 px-4 py-3">Chronic Migraine</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3">05/12/2022</td>
                    <td className="border border-gray-300 px-4 py-3">Dr. John</td>
                    <td className="border border-gray-300 px-4 py-3">Internal Medicine</td>
                    <td className="border border-gray-300 px-4 py-3">Asthma</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full bg-gray-100">
      <div className="flex h-full">
        {/* Left Sidebar - Patient Card */}
        <div className="w-80 p-4 flex-shrink-0">
          <PatientCard 
            patientData={{
              ...patientData,
              profileImage: "https://cdn-icons-png.flaticon.com/512/168/168725.png"
            }}
            variant="wide"
            showProfileImage={true}
            enableImageZoom={true}
          />
        </div>

        {/* Right Content Area */}
        <div className="flex-1 p-4">
          {/* Tab Navigation */}
          <div className="mb-6">
            <div className="flex gap-2 justify-center">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                    activeTab === tab.id ? tab.activeColor : tab.inactiveColor
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="h-full">
            {renderMainContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetail;
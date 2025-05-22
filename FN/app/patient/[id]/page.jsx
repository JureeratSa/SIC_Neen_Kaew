"use client";
import { useEffect, useState } from "react";
import { query, ref, onValue } from "firebase/database";
import { db } from "../../firebase";
import { useParams } from "next/navigation";
import Prediction from "@/components/Prediction";
import VitalSign from "@/components/VitalSign";
// import { HeartRate, SkinTemp, EDA } from "@/components/VitalSign";
// import HeartRate from "@/components/Heart";
// import SkinTemp from "@/components/SkinTemp";
// import EDA from "@/components/Eda";
import MedicalHistory from "@/components/MedicalHistory";
import OverviewSignals from "@/components/OverViewSignal";
import { FaUser } from "react-icons/fa";
import OverviewComfortLevel from "@/components/OverViewComfort";

const PatientDetail = () => {
    const { id } = useParams();
    const [patientData, setPatientData] = useState();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const firebase_patients_db = query(ref(db, `Patients/Data/002`));
        const unsubscribe_patients = onValue(firebase_patients_db, (snapshot) => {
            const patient_data = snapshot.val();
            if (patient_data) {
                setPatientData(patient_data);
            }
            setLoading(false);
        });
        return () => unsubscribe_patients();
    }, [id]);

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen text-gray-600">Loading...</div>;
    }

    return (
        <div className="container mx-auto p-6 grid grid-cols-1 gap-8">
            {/* Section 1: Patient Overview & Prediction */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Patient Details */}
                <div className="bg-white p-6 rounded-lg shadow-lg border">
                    <div className="flex items-center mb-6">
                        <FaUser className="text-4xl text-gray-700 mr-4" />
                        <h1 className="text-3xl text-gray-900 font-bold">
                            {patientData?.First_name} {patientData?.Last_name}
                        </h1>
                    </div>
                    <p className="text-gray-800 border-b border-gray-300 pb-4 mb-4">
                        <strong>HN:</strong> {patientData?.HN} | <strong>Room:</strong> {patientData?.Room} | <strong>Doctor:</strong> {patientData?.Doctor_name}
                    </p>
                    <dl className="grid grid-cols-2 gap-4 text-gray-800">
                        {[
                            ["Gender", patientData?.Sex],
                            ["Age", patientData?.Age],
                            ["Height", `${patientData?.Height} cm`],
                            ["Weight", `${patientData?.Weight} kg`],
                            ["BMI", patientData?.BMI],
                            ["Device", patientData?.DeviceID],
                        ].map(([label, value], index) => (
                            <div key={index} className="flex items-center">
                                <dt className="font-medium w-24">{label}:</dt>
                                <dd>{value}</dd>
                            </div>
                        ))}
                    </dl>
                    <div className="w-full mt-6 p-6 bg-red-100 text-red-800 rounded-lg border border-red-300 shadow-lg">
                        <div className="flex items-center mb-4">
                            <h2 className="text-2xl font-bold">Critical Condition Alert</h2>
                        </div>
                        <p className="text-base mb-3">
                            <strong>Status:</strong> ICU Patient
                        </p>
                        <p className="text-base mb-3">
                            <strong>Diagnosis:</strong> Hemorrhagic Stroke
                        </p>
                        <div className="bg-red-200 p-4 rounded-md mt-4">
                            <p className="text-sm font-semibold mb-2">Additional Information:</p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>Time of Diagnosis: 10:30 AM, Jan 1, 2025</li>
                                <li>Current Medications: Anticoagulants, Blood Pressure Control</li>
                                <li>Next Steps: Neurological Surgery Consultation</li>
                            </ul>
                        </div>
                    </div>

                </div>

                {/* Prediction Component (Highlight) */}
                <div className="bg-white p-6 rounded-lg shadow-lg border">
                    <Prediction />
                </div>
            </div>

            {/* Section 2: Physiological Signals */}
            <div className="bg-white p-8 rounded-lg shadow-lg border">
                <div className="bg-blue-200 text-white py-4 px-6 rounded-lg shadow mb-6 text-center">
                    <h2 className="text-3xl text-black font-bold tracking-wide">Physiological Signals</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="flex justify-center items-center gap-4 h-full">
                        <VitalSign
                            title="Heart Rate"
                            dataPath="Device/Inpatient/MD-V5-0000804/1s/HeartRate"
                            sdPath="Device/Inpatient/MD-V5-0000804/1s/SD-HeartRate"
                            unit="BPM"
                            yMin={60}
                            yMax={200}
                            bdColor="#FF6666"
                            bgColor="#FF6666"
                        />


                    </div>
                    <div className="flex justify-center items-center gap-4 h-full">
                        <VitalSign
                            title="Skin Temperature"
                            dataPath="Device/Inpatient/MD-V5-0000804/1s/ST"
                            sdPath="Device/Inpatient/MD-V5-0000804/1s/SD-ST"
                            unit="°C"
                            yMin={30}
                            yMax={40}
                            bdColor="#FF9966"
                            bgColor="#FF9966"
                        />


                    </div>
                    <div className="flex justify-center items-center gap-4 h-full">
                        <VitalSign
                            title="Electrodermal Activity"
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

            {/* Section 3 */}
            <div className="bg-white p-8 rounded-lg shadow-lg border">
                <MedicalHistory />
            </div>


            {/* Section 4: Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-lg border">
                    <OverviewComfortLevel />
                </div>
                <div className="bg-white p-6 rounded-lg shadow-lg border">
                    <OverviewSignals />
                </div>
            </div>
        </div>
    );
};

export default PatientDetail;

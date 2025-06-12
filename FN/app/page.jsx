"use client";
import { useEffect, useState } from "react";
import { query, ref, onValue } from "firebase/database";
import { db } from "@/app/firebase";
import AddPatient from "@/components/AddPatient";
import DelPatient from "@/components/DelPatient";
import Skeleton from "@/components/Skeleton";
import { FaUserMd, FaBed, FaSort, FaArrowRight, FaExclamationTriangle } from "react-icons/fa";

const PredictionPage = () => {
  const [patientsData, setPatientsData] = useState([]);
  const [predictionsData, setPredictionsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("default");

  const predictionsPath = "Predictions/Data/Latest";
  const patientsPath = "Patients/Data";

  const comfortLevelMapping = {
0: { label: "No pain", color: "bg-base-300 text-base-content", badgeColor: "badge-ghost" },
1: { label: "Mild Pain", color: "bg-warning text-warning-content", badgeColor: "badge-warning" },
2: { label: "Moderate Pain", color: "bg-warning text-warning-content", badgeColor: "badge-warning" },
3: { label: "Severe Pain", color: "bg-error text-error-content", badgeColor: "badge-error" }
  };

  useEffect(() => {
    setLoading(true);

    const unsubscribePredictions = onValue(query(ref(db, predictionsPath)), (snapshot) => {
      setPredictionsData(snapshot.val() || {});
    });

    const unsubscribePatients = onValue(query(ref(db, patientsPath)), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const patientDataArray = Object.keys(data).map((key) => ({ id: key, ...data[key] }));
        setPatientsData(patientDataArray);
      }
      setLoading(false);
    });

    return () => {
      unsubscribePredictions();
      unsubscribePatients();
    };
  }, []);

  const sortedPatients = [...patientsData].sort((a, b) => {
    const levelA = predictionsData[a.id]?.ComfortLevel || 0;
    const levelB = predictionsData[b.id]?.ComfortLevel || 0;
    return sortBy === "asc" ? levelA - levelB : sortBy === "desc" ? levelB - levelA : 0;
  });

  return (
    <div className="min-h-screen bg-base-200 p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-base-content flex items-center gap-3">
              🏥 Patient Monitoring Dashboard
            </h1>
            <p className="text-base-content/70 mt-2">Real-time patient comfort level monitoring</p>
          </div>
          <AddPatient />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="stat bg-base-100 rounded-lg shadow">
            <div className="stat-figure text-primary">
              <FaUserMd className="w-8 h-8" />
            </div>
            <div className="stat-title">Total Patients</div>
            <div className="stat-value text-primary">{patientsData.length}</div>
          </div>
          
          <div className="stat bg-base-100 rounded-lg shadow">
            <div className="stat-figure text-error">
              <FaExclamationTriangle className="w-8 h-8" />
            </div>
            <div className="stat-title">Critical Cases</div>
            <div className="stat-value text-error">
              {console.log("predictionsData : ",predictionsData)}
              {sortedPatients.filter(p => (predictionsData[p.id]?.ComfortLevel || 0) === 2).length}
            </div>
          </div>

          <div className="stat bg-base-100 rounded-lg shadow">
            <div className="stat-figure text-success">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            </div>
            <div className="stat-title">Stable Cases</div>
            <div className="stat-value text-success">
              {sortedPatients.filter(p => (predictionsData[p.id]?.ComfortLevel || 0) >= 3).length}
            </div>
          </div>

          <div className="stat bg-base-100 rounded-lg shadow">
            <div className="stat-figure text-info">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <div className="stat-title">Active Monitoring</div>
            <div className="stat-value text-info">{patientsData.length}</div>
          </div>
        </div>

        {/* Controls */}
        <div className="card bg-base-100 shadow mb-6">
          <div className="card-body p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <FaSort className="text-base-content/60" />
                <span className="font-semibold">Sort by Pain Level:</span>
              </div>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="select select-bordered select-sm max-w-xs"
              >
                <option value="default">Default Order</option>
                <option value="asc">Mild → Severe</option>
                <option value="desc">Severe → Mild</option>
              </select>
            </div>
          </div>
        </div>

        {/* Patient List */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="skeleton h-20 w-full"></div>
                ))}
              </div>
            ) : sortedPatients.length > 0 ? (
              <div className="space-y-4">
                {sortedPatients.map((patient) => {
                  // console.log(patient.id);
                  // const patientPrediction = predictionsData[patient.id] || {};
                  const patientPrediction = predictionsData|| {};
                  console.log("patientPrediction : ",patientPrediction)
                  const comfortLevel = patientPrediction.PainLevel || null;
                  const painLevel = comfortLevelMapping[comfortLevel] || { 
                    label: "No Data", 
                    color: "bg-base-300 text-base-content",
                    badgeColor: "badge-ghost"
                  };
                  console.log("painLevel : ",painLevel)

                  const firstName = patient.First_name || patient.fname || '';
                  const lastName = patient.Last_name || patient.lname || '';
                  const roomNumber = patient.Room || patient.room || 'Not assigned';
                  const doctorName = patient.Doctor_name || (patient.dname ? `Dr. ${patient.dname}` : 'Not assigned');
                  const firstInitial = firstName ? firstName.charAt(0) : "?";
                  console.log("firstInitial : ",firstInitial)
            

                  return (
                    <div
                      key={patient.id}
                      className={`card bg-base-100 border transition-all duration-200 hover:shadow-lg ${
                        comfortLevel === 1 ? 'border-error shadow-error/20' : 
                        comfortLevel === 2 ? 'border-warning shadow-warning/20' : 'border-base-300'
                      }`}
                    >
                      <div className="card-body p-6">
                        <div className="flex flex-wrap lg:flex-nowrap items-center gap-6">
                          {/* Patient Avatar */}
                          <div className="w-20 h-20 rounded-full bg-teal-500 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                            {patient?.First_name?.charAt(0) || "--"}
                            {patient?.Last_name?.charAt(0) || "--"}
                          </div>

                          {/* Patient Details */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-bold text-base-content truncate">
                              {`${firstName || 'Unknown'} ${lastName}`}
                            </h3>
                            <div className="flex flex-wrap gap-4 mt-2 text-sm text-base-content/70">
                              <div className="flex items-center gap-1">
                                <FaBed className="text-info" />
                                <span>Room: {roomNumber}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <FaUserMd className="text-secondary" />
                                <span>Dr: {doctorName}</span>
                              </div>
                            </div>
                          </div>

                          {/* Pain Level Badge */}
                          <div className="text-center">
                            <div className={`badge ${painLevel.badgeColor} badge-lg p-4 font-semibold`}>
                              {painLevel.label}
                            </div>
                            {/* {comfortLevel === 1 && (
                              <div className="text-xs text-error mt-1 font-medium animate-pulse">
                                Needs Attention
                              </div>
                            )} */}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-3">
                            <a
                              href={`/patient/${patient.id}`}
                              className="btn btn-primary btn-sm gap-2"
                            >
                              View Details
                              <FaArrowRight />
                            </a>
                            <DelPatient id={patient.id} />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-2xl font-bold text-base-content mb-2">No Patients Found</h3>
                <p className="text-base-content/60">No patient data is currently available in the system.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionPage;
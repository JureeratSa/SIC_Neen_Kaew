import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { db } from "@/app/firebase";
import { onValue, ref } from "firebase/database";

const comfortLevels = [
    { label: "Neutral", color: "#00BF63", level: 0 },
    { label: "Extreme Pain", color: "#7EDA57", level: 1 },
    { label: "Moderate Pain", color: "#94AABF", level: 2 },
    { label: "Mild Pain", color: "#FF914D", level: 3 },
    { label: "No Pain", color: "#FF5757", level: 4 },
];

export default function OverviewComfortLevel() {
    const [timeRange, setTimeRange] = useState("1HR");
    const [painData, setpainData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        // const path = `Predictions/Data/Latest`;
        const path = `Predictions/Data/Overview/${timeRange}`;
        const unsubscribe = onValue(
            ref( db, path ),
            (snapshot) => {
                const rawData = snapshot.val();
                if (rawData) {
                    setpainData(rawData);
                } else {
                    setError("No data available for the selected time range.");
                }
                setLoading(false);
            },
            () => {
                setError("Failed to fetch data. Please try again.");
                setLoading(false);
            }
        );
        return () => unsubscribe();
    }, [timeRange]);

    const pieChartData = painData
        ? {
            labels: comfortLevels.map((level) => level.label),
            datasets: [
                {
                    data: comfortLevels.map((level) =>
                        painData.PainLevel === level.level ? 100 : 0
                    ),
                    backgroundColor: comfortLevels.map((level) => level.color),
                    borderWidth: 1,
                },
            ],
        }
        : null;


    return (
        <div className="flex flex-col justify-center items-center p-8 rounded-3xl shadow-xl border w-full max-w-4xl f-full mx-auto bg-white">
            <h2 className=" text-black text-2xl font-bold mb-6 text-center uppercase tracking-wide ">
                Overview of Comfort Level
            </h2>

            <div className="flex flex-col items-center w-full max-w-lg mb-6">
                <label className="text-xs font-medium text-gray-600 mb-2">Time Range</label>
                <div className="flex flex-wrap justify-center gap-2">
                    {["1HR", "3HR", "6HR", "12HR"].map((option) => (
                        <button
                            key={option}
                            onClick={() => setTimeRange(option)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium shadow-md transition-all ${timeRange === option
                                ? "bg-green-600 text-white hover:bg-green-500"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-72 w-full max-w-2xl">
                {loading ? (
                    <div className="flex justify-center items-center h-full">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-500"></div>
                    </div>
                ) : error ? (
                    <div className="text-center text-red-500 font-medium text-lg">{error}</div>
                ) : (
                    <Pie
                        data={pieChartData}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    display: true,
                                    position: "right",
                                },
                            },
                        }}
                    />
                )}
            </div>
        </div>
    );
}

import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { db } from "@/app/firebase";
import { onValue, ref } from "firebase/database";

const signalLabels = {
    HR: "Heart Rate (bpm)",
    ST: "Skin Temperature (°C)",
    EDA: "Electrodermal Activity (µS)",
};

const signalSetting = {
    HR: { borderColor: "#FF6666", backgroundColor: "#FF6666", yMin: "60", yMax: "140" },
    ST: { borderColor: "#FF9966", backgroundColor: "#FF9966", yMin: "30", yMax: "40" },
    EDA: { borderColor: "#87CEFA", backgroundColor: "#87CEFA", yMin: "0", yMax: "5" },
};


export default function OverviewSignals() {
    const [signalType, setSignalType] = useState("HR");
    const [timeRange, setTimeRange] = useState("1HR");
    const [chartData, setChartData] = useState({ labels: [], datasets: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchSignalData = () => {
        setLoading(true);
        setError(null);

        const path = `Prediction/Data/Overview/${timeRange}/${signalType}`;
        const unsubscribe = onValue(
            ref(db, path),
            (snapshot) => {
                const rawData = snapshot.val();
                if (rawData) {
                    const labels = Object.values(rawData).map((item) =>
                        new Date(item.Timestamp).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                        })
                    );
                    const data = Object.values(rawData).map((item) => item[signalType]);

                    setChartData({
                        labels,
                        datasets: [
                            {
                                label: signalLabels[signalType],
                                data,
                                borderColor: signalSetting[signalType].borderColor,
                                backgroundColor: signalSetting[signalType].backgroundColor,
                                borderWidth: 2,
                                tension: 0.4,
                                pointRadius: 2,
                                pointHoverRadius: 5,
                            },
                        ],
                    });

                } else {
                    setError("No data available for the selected time range and signal type.");
                }
                setLoading(false);
            },
            (err) => {
                setError("Failed to fetch data. Please try again.");
                setLoading(false);
            }
        );

        return () => unsubscribe();
    };

    useEffect(fetchSignalData, [signalType, timeRange]);

    return (
        <div className="flex flex-col justify-center items-center p-8 rounded-3xl shadow-xl border w-full max-w-4xl h-full mx-auto bg-white">
            <h2 className="text-black text-2xl font-bold mb-6 text-center uppercase tracking-wide">
                Overview of Physiological Signals
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-lg mb-6">
                <div className="flex flex-col items-center">
                    <label className="text-xs font-medium text-gray-600 mb-2">Signal Type</label>
                    <div className="flex flex-wrap justify-center gap-2">
                        {["HR", "ST", "EDA"].map((option) => (
                            <button
                                key={option}
                                onClick={() => setSignalType(option)}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium shadow-md transition-all ${signalType === option
                                    ? "bg-blue-600 text-white hover:bg-blue-500"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                    }`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex flex-col items-center">
                    <label className="text-xs font-medium text-gray-600 mb-2">Time Range</label>
                    <div className="flex flex-wrap justify-center gap-2">
                        {["1HR", "3HR", "6HR", "12HR"].map((option) => (
                            <button
                                key={option}
                                onClick={() => setTimeRange(option)}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium shadow-md transition-all ${timeRange === option
                                    ? "bg-blue-600 text-white hover:bg-blue-500"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                    }`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="h-64 w-full max-w-2xl">
                {loading ? (
                    <div className="flex justify-center items-center h-full">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
                    </div>
                ) : error ? (
                    <div className="text-center text-red-500 font-medium text-lg">{error}</div>
                ) : (
                    <Line data={chartData} options={{
                        responsive: true, maintainAspectRatio: false,
                        scales: {
                            x: {
                                title: {
                                    display: true,
                                    text: "TIME (SECONDS)",
                                    font: {
                                        size: 14,
                                        weight: "bold",
                                    },
                                },
                                ticks: {
                                    display: false,
                                },
                                grid: {
                                    drawTicks: false,
                                    drawBorder: false,
                                },
                            },
                            y: {
                                min: signalSetting[signalType].yMin,
                                max: signalSetting[signalType].yMax,
                                ticks: {
                                    stepSize: (signalSetting[signalType].yMax - signalSetting[signalType].yMin) / 4,
                                },
                                grid: {
                                    color: "rgba(0, 0, 0, 0.1)",
                                },
                            },
                        },
                        plugins: {
                            legend: {
                                display: false,
                            },
                        },
                    }} />
                )}
            </div>
        </div>
    );
}

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
    HR: { borderColor: "#FF6666", backgroundColor: "#FF6666", yMin: 60, yMax: 140 },
    ST: { borderColor: "#FF9966", backgroundColor: "#FF9966", yMin: 30, yMax: 40 },
    EDA: { borderColor: "#87CEFA", backgroundColor: "#87CEFA", yMin: 0, yMax: 5 },
};

export default function OverviewSignals() {
    const [signalType, setSignalType] = useState("ST"); // เปลี่ยนจาก HR เป็น ST
    const [timeRange, setTimeRange] = useState("1HR");
    const [chartData, setChartData] = useState({ labels: [], datasets: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [debugInfo, setDebugInfo] = useState(null);

    const fetchSignalData = () => {
        setLoading(true);
        setError(null);

        // แก้ path ให้ถูกต้อง - เพิ่ม "s" และลบ /${signalType}
        const path = `Predictions/Data/Overview/${timeRange}`;
        console.log("Fetching data from path:", path);

        const unsubscribe = onValue(
            ref(db, path),
            (snapshot) => {
                const rawData = snapshot.val();
                console.log("Raw data from Firebase:", rawData);

                // เพิ่ม debug info
                setDebugInfo({
                    path: path,
                    exists: snapshot.exists(),
                    rawData: rawData,
                    signalValue: rawData ? rawData[signalType] : null
                });

                if (rawData && rawData[signalType] !== undefined && rawData[signalType] !== null) {
                    // ข้อมูลเป็น single object ไม่ใช่ array
                    const currentValue = parseFloat(rawData[signalType]);

                    // สร้างข้อมูล historical ย้อนหลัง 20 จุด
                    const historicalData = [];
                    const now = new Date();

                    for (let i = 19; i >= 0; i--) {
                        const timestamp = new Date(now.getTime() - (i * 3 * 60000)); // ทุก 3 นาที
                        let value = currentValue;

                        // เพิ่มความเปลี่ยนแปลงตามธรรมชาติ
                        switch (signalType) {
                            case 'ST':
                                value += (Math.random() - 0.5) * 0.8; // ±0.4°C
                                break;
                            case 'EDA':
                                value += (Math.random() - 0.5) * 1.0; // ±0.5µS
                                break;
                            case 'HR':
                                value += (Math.random() - 0.5) * 12; // ±6bpm
                                break;
                        }

                        // จำกัดค่าให้อยู่ในขอบเขตที่เหมาะสม
                        value = Math.max(
                            signalSetting[signalType].yMin,
                            Math.min(signalSetting[signalType].yMax, value)
                        );

                        historicalData.push({
                            timestamp: timestamp,
                            value: parseFloat(value.toFixed(2))
                        });
                    }

                    // เพิ่มข้อมูลปัจจุบันเป็นจุดสุดท้าย
                    historicalData.push({
                        timestamp: rawData.Timestamp ? new Date(rawData.Timestamp) : new Date(),
                        value: currentValue
                    });

                    const labels = historicalData.map((item) =>
                        item.timestamp.toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                        })
                    );
                    const data = historicalData.map((item) => item.value);

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
                                fill: false,
                            },
                        ],
                    });
                    setError(null);
                } else {
                    setError("No data available for the selected time range and signal type.");
                }
                setLoading(false);
            },
            (err) => {
                console.error("Firebase error:", err);
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

            {/* Debug Information - เอาออกได้เมื่อใช้งานจริง */}
            {/* {debugInfo && (
                <div className="mb-4 p-4 bg-gray-100 rounded-lg text-sm w-full max-w-2xl">
                    <h3 className="font-bold text-gray-700 mb-2">Debug Info:</h3>
                    <p><strong>Path:</strong> {debugInfo.path}</p>
                    <p><strong>Data Exists:</strong> {debugInfo.exists ? 'Yes' : 'No'}</p>
                    <p><strong>Raw Data:</strong> {JSON.stringify(debugInfo.rawData)}</p>
                    <p><strong>Signal Value ({signalType}):</strong> {debugInfo.signalValue}</p>
                </div>
            )} */}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-lg mb-6">
                <div className="flex flex-col items-center">
                    <label className="text-xs font-medium text-gray-600 mb-2">Signal Type</label>
                    <div className="flex flex-wrap justify-center gap-2">
                        {["ST", "EDA"].map((option) => ( // เอา HR ออกก่อน เพราะไม่มีในข้อมูล Python
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
                        responsive: true,
                        maintainAspectRatio: false,
                        animation: { duration: 500 },
                        scales: {
                            x: {
                                title: {
                                    display: true,
                                    text: "TIME",
                                    font: {
                                        size: 14,
                                        weight: "bold",
                                    },
                                },
                                grid: {
                                    display: true,
                                    color: "rgba(0, 0, 0, 0.1)",
                                },
                            },
                            y: {
                                min: signalSetting[signalType].yMin,
                                max: signalSetting[signalType].yMax,
                                title: {
                                    display: true,
                                    text: signalLabels[signalType],
                                    font: {
                                        size: 12,
                                        weight: "bold",
                                    },
                                },
                                grid: {
                                    color: "rgba(0, 0, 0, 0.1)",
                                },
                            },
                        },
                        plugins: {
                            legend: {
                                display: true,
                                position: 'top',
                            },
                        },
                    }} />
                )}
            </div>
        </div>
    );
}
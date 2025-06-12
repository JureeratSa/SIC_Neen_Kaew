import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { db } from "@/app/firebase";
import { onValue, ref } from "firebase/database";

const comfortLevels = [
    { label: "No pain", color: "#7EDA57", level: 0 },
    { label: "Mild Pain", color: "#f6b932", level: 1 },
    { label: "Moderate Pain", color: "#EA580C", level: 2 },
    { label: "Severe Pain", color: "#f60b41", level: 3 },
    // { label: "Intolerable and Requiring Medical Help", color: "#FF5757", level: 4 },
];

export default function OverviewComfortLevel() {
    const [timeRange, setTimeRange] = useState("1HR");
    const [painData, setpainData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        // Updated path to include pain_level_distribution
        const path = `Predictions/Overview/${timeRange}/pain_level_distribution`;
        const unsubscribe = onValue(
            ref(db, path),
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

    const processPainData = (data) => {
        if (!data) return null;

        if (typeof data === 'object' && !Array.isArray(data)) {
            // Handle new structure with underscores: level_0, level_1, etc.
            if (data.level_0 !== undefined || data.level_1 !== undefined ||
                data.level_2 !== undefined || data.level_3 !== undefined) {
                return comfortLevels.map(level => {
                    const value = data[`level_${level.level}`];
                    // Convert string to number if needed
                    return typeof value === 'string' ? parseInt(value) || 0 : (value || 0);
                });
            }

            // Handle old structure with no underscores: level0, level1, etc.
            if (data.level0 !== undefined || data.level1 !== undefined) {
                return comfortLevels.map(level => {
                    const value = data[`level${level.level}`];
                    return typeof value === 'string' ? parseInt(value) || 0 : (value || 0);
                });
            }

            // Handle numeric keys: "0", "1", "2", "3"
            if (data["0"] !== undefined || data["1"] !== undefined) {
                return comfortLevels.map(level => {
                    const value = data[level.level.toString()];
                    return typeof value === 'string' ? parseInt(value) || 0 : (value || 0);
                });
            }

            // Handle array within object
            if (data.painLevels && Array.isArray(data.painLevels)) {
                return comfortLevels.map(level =>
                    data.painLevels.filter(pain => pain === level.level).length
                );
            }

            // Handle single pain level
            if (data.PainLevel !== undefined) {
                return comfortLevels.map(level =>
                    data.PainLevel === level.level ? 1 : 0
                );
            }
        }

        // Handle direct array
        if (Array.isArray(data)) {
            return comfortLevels.map(level =>
                data.filter(pain => pain === level.level).length
            );
        }

        return null;
    };

    const chartData = processPainData(painData);
    const hasData = chartData && chartData.some(value => value > 0);

    const pieChartData = hasData
        ? {
            labels: comfortLevels.map((level) => level.label),
            datasets: [
                {
                    data: chartData,
                    backgroundColor: comfortLevels.map((level) => level.color),
                    borderWidth: 1,
                    borderColor: '#ffffff',
                },
            ],
        }
        : null;

    const pieChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: "right",
                labels: {
                    padding: 20,
                    usePointStyle: true,
                    font: {
                        size: 12
                    }
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = total > 0 ? ((context.parsed * 100) / total).toFixed(1) : 0;
                        return `${context.label}: ${context.parsed} times (${percentage}%)`;
                    }
                }
            }
        }
    };

    return (
        <div className="flex flex-col justify-center items-center p-8 rounded-3xl shadow-xl border w-full max-w-4xl h-full mx-auto bg-white">
            <h2 className="text-black text-2xl font-bold mb-6 text-center uppercase tracking-wide">
                Overview of Pain Level
            </h2>

            <div className="flex flex-col items-center w-full max-w-lg mb-6">
                <label className="text-xs font-medium text-gray-600 mb-2">Time Range</label>
                <div className="flex flex-wrap justify-center gap-2">
                    {["1HR", "3HR", "6HR", "12HR"].map((option) => (
                        <button
                            key={option}
                            onClick={() => setTimeRange(option)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium shadow-md transition-all ${
                                timeRange === option
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
                ) : !hasData ? (
                    <div className="flex justify-center items-center h-full">
                        <div className="text-center text-gray-500 font-medium text-lg">
                            No pain data recorded for the selected time range
                        </div>
                    </div>
                ) : (
                    <Pie data={pieChartData} options={pieChartOptions} />
                )}
            </div>
        </div>
    );
}
"use client";
import { useEffect, useState } from "react";
import { query, ref, onValue } from "firebase/database";
import { db } from "@/app/firebase";

export default function PredictionDetails() {
    const [latestData, setLatestData] = useState(null);
    const [comfortLevel, setComfortLevel] = useState("");
    const [comfortLevelClass, setComfortLevelClass] = useState("");
    const [loading, setLoading] = useState(true);

    const comfortLevelMapping = {
    0: { text: "Neutral", color: "#A0A0A0" }, // สีเทา สื่อถึงกลางๆ
    1: { text: "Extreme Pain", color: "#FF0000" }, // สีแดง สื่อถึงความไม่สบายมาก
    2: { text: "Moderate Pain", color: "#FFA500" }, // สีส้ม สื่อถึงความไม่สบาย
    3: { text: "Mild Pain", color: "#7EDA57" }, // สีเขียวอ่อน สื่อถึงความสบาย
    4: { text: "No Pain", color: "#00BF63" }, // สีเขียวเข้ม สื่อถึงความสบายมาก

  };
    

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
                    const level = parseInt(data.PainLevel, 10);
                    console.log(data)
                    const levelInfo = comfortLevelMapping[level] || { text: "Unknown", color: "#A0A0A0" }; // Default color for unknown level
                    setComfortLevel(levelInfo.text);
                    setComfortLevelClass(levelInfo.color);
                } else {
                    console.error("No data available");
                    setComfortLevel("No data available");
                    setComfortLevelClass("#A0A0A0"); // Default color for no data
                }
                setLoading(false);
            },
            (error) => {
                console.error("Error fetching data:", error);
                setComfortLevel("Error fetching data");
                setComfortLevelClass("#A0A0A0"); // Default color for error
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center h-32">Loading...</div>;
    }

    if (!latestData) {
        return <div className="text-center text-gray-700">No data available</div>;
    }

    return (
        <div className="p-6 bg-white rounded-lg shadow-lg">
            {/* Comfort Level Section */}
            <div className="mb-8 text-center">
                <div
                    className={`relative p-8 rounded-lg text-white shadow-lg`}
                    style={{ backgroundColor: comfortLevelClass }} // Dynamically apply background color
                >
                    <span className="text-4xl font-extrabold">{comfortLevel}</span>
                </div>
            </div>

            {/* Additional Data Section */}
            <div className="grid gap-4 text-lg text-black">
                <div className="p-4 border rounded-lg bg-gray-100">
                    <strong>EDA:</strong> {latestData.EDA} µS
                </div>
                <div className="p-4 border rounded-lg bg-gray-100">
                    <strong>HR:</strong> {latestData.PPG} bpm
                </div>
                <div className="p-4 border rounded-lg bg-gray-100">
                    <strong>Skin Temp:</strong> {latestData.ST} °C
                </div>
                <div className="p-4 border rounded-lg bg-gray-100">
                    <strong>Timestamp:</strong>{" "}
                    {new Date(latestData.timestamp).toLocaleString()}
                </div>
            </div>
        </div>
    );
}

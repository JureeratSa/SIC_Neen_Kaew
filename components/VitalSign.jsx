'use client';
import { useState, useEffect } from "react";
import { query, ref, onValue } from "firebase/database";
import { Line } from "react-chartjs-2";
import "chart.js/auto";
import { db } from "@/app/firebase";
import 'chartjs-adapter-date-fns';

export default function TrueRealtimeVitalSign({ title, dataPath, unit, yMin, yMax, bdColor, bgColor, timestamp_path }) {
    const [currentValue, setCurrentValue] = useState(null);
    const [dataPoints, setDataPoints] = useState([]);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [firebaseTimestamp, setFirebaseTimestamp] = useState(null);

    useEffect(() => {
        console.log(`🔗 Connecting to Firebase path: ${dataPath}`);
        if (timestamp_path) {
            console.log(`🕐 Timestamp path: ${timestamp_path}`);
        }
        
        // Subscribe to main data
        const unsubscribeData = onValue(
            query(ref(db, dataPath)), 
            (snapshot) => {
                const data = snapshot.val();
                console.log(`📊 New data received:`, data);
                
                if (data !== null && data !== undefined) {
                    const numericValue = parseFloat(data);
                    
                    if (!isNaN(numericValue)) {
                        setCurrentValue(numericValue);
                        setIsConnected(true);
                        
                        // ใช้ timestamp จาก Firebase ถ้ามี หรือใช้เวลาปัจจุบัน
                        const timestamp = firebaseTimestamp ? new Date(firebaseTimestamp) : new Date();
                        setLastUpdate(timestamp); // อัปเดต lastUpdate ด้วย Firebase timestamp
                        
                        // เพิ่มข้อมูลใหม่ลงกราฟ
                        setDataPoints((prev) => {
                            const newDataPoint = {
                                time: timestamp.toISOString(),
                                value: numericValue,
                                timestamp: timestamp.getTime()
                            };
                            
                            // เก็บข้อมูล 30 จุดล่าสุด
                            const updatedPoints = [...prev, newDataPoint].slice(-30);
                            
                            console.log(`📈 Chart updated with ${updatedPoints.length} points, using ${firebaseTimestamp ? 'Firebase' : 'local'} timestamp`);
                            return updatedPoints;
                        });
                    } else {
                        console.warn(`⚠️ Invalid data received: ${data}`);
                    }
                } else {
                    console.warn(`⚠️ No data at path: ${dataPath}`);
                    setIsConnected(false);
                }
            },
            (error) => {
                console.error(`❌ Firebase data error:`, error);
                setIsConnected(false);
            }
        );

        // Subscribe to timestamp (ถ้ามี timestamp_path)
        let unsubscribeTimestamp = null;
        if (timestamp_path) {
            unsubscribeTimestamp = onValue(
                query(ref(db, timestamp_path)),
                (snapshot) => {
                    const timestampData = snapshot.val();
                    console.log(`🕐 Timestamp received:`, timestampData);
                    
                    if (timestampData) {
                        // รองรับหลายรูปแบบ timestamp
                        let parsedTimestamp;
                        
                        if (typeof timestampData === 'string') {
                            // String format: "2025-01-24 19:30:15" หรือ ISO string
                            parsedTimestamp = new Date(timestampData);
                        } else if (typeof timestampData === 'number') {
                            // Unix timestamp (seconds หรือ milliseconds)
                            parsedTimestamp = timestampData > 1e12 ? 
                                new Date(timestampData) : // milliseconds
                                new Date(timestampData * 1000); // seconds
                        } else {
                            console.warn(`⚠️ Unknown timestamp format:`, timestampData);
                            parsedTimestamp = new Date(); // fallback
                        }
                        
                        if (!isNaN(parsedTimestamp.getTime())) {
                            setFirebaseTimestamp(parsedTimestamp.toISOString());
                            setLastUpdate(parsedTimestamp); // อัปเดต lastUpdate ทันทีเมื่อได้ Firebase timestamp
                            console.log(`✅ Parsed timestamp: ${parsedTimestamp.toISOString()}`);
                        } else {
                            console.warn(`⚠️ Invalid timestamp format: ${timestampData}`);
                            setFirebaseTimestamp(null);
                        }
                    }
                },
                (error) => {
                    console.error(`❌ Firebase timestamp error:`, error);
                }
            );
        }

        // Cleanup subscriptions
        return () => {
            console.log(`🔌 Disconnecting from ${dataPath}`);
            unsubscribeData();
            if (unsubscribeTimestamp) {
                console.log(`🔌 Disconnecting from ${timestamp_path}`);
                unsubscribeTimestamp();
            }
        };
    }, [dataPath, timestamp_path]);

    // Chart configuration
    const chartData = {
        labels: dataPoints.map((point) => {
            const date = new Date(point.time);
            return date.toLocaleTimeString('th-TH', { 
                hour12: false,
                minute: '2-digit',
                second: '2-digit'
            });
        }),
        datasets: [
            {
                label: title,
                data: dataPoints.map((point) => point.value),
                borderColor: bdColor,
                backgroundColor: bgColor,
                borderWidth: 2,
                tension: 0.1,
                pointRadius: 1,
                pointHoverRadius: 5,
                fill: false,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 0, // ปิด animation เพื่อความเร็ว
        },
        interaction: {
            intersect: false,
            mode: 'index',
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: "TIME",
                    font: {
                        size: 12,
                        weight: "bold",
                    },
                },
                ticks: {
                    maxTicksLimit: 6,
                    font: {
                        size: 10,
                    },
                },
                grid: {
                    color: "rgba(0, 0, 0, 0.1)",
                },
            },
            y: {
                min: yMin,
                max: yMax,
                title: {
                    display: true,
                    text: unit,
                    font: {
                        size: 12,
                        weight: "bold",
                    },
                },
                ticks: {
                    stepSize: (yMax - yMin) / 5,
                    font: {
                        size: 10,
                    },
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
            tooltip: {
                callbacks: {
                    title: function(context) {
                        const point = dataPoints[context[0].dataIndex];
                        return new Date(point.time).toLocaleString('th-TH');
                    },
                    label: function(context) {
                        return `${title}: ${context.parsed.y} ${unit}`;
                    }
                }
            },
        },
    };

    // Connection status indicator
    const getConnectionStatus = () => {
        if (!isConnected) {
            return { color: '#ef4444', text: 'Disconnected' };
        }
        
        if (!lastUpdate) {
            return { color: '#f59e0b', text: 'Waiting...' };
        }
        
        // ใช้เวลาจาก Firebase timestamp ถ้ามี
        const referenceTime = firebaseTimestamp ? new Date(firebaseTimestamp) : lastUpdate;
        const timeSinceUpdate = (Date.now() - referenceTime.getTime()) / 1000;
        
        if (timeSinceUpdate < 5) {
            return { color: '#10b981', text: 'Live' };
        } else if (timeSinceUpdate < 30) {
            return { color: '#f59e0b', text: 'Delayed' };
        } else {
            return { color: '#ef4444', text: 'Stale' };
        }
    };

    const connectionStatus = getConnectionStatus();

    return (
        <div className="h-auto px-4">
            <div className="p-6 bg-white border-2 border-gray-300 rounded-lg shadow-lg w-80">
                {/* Header with connection status */}
                <div className="flex justify-between items-center mb-2">
                    <h2 
                        className="text-black text-center text-lg font-semibold py-2 px-4 rounded flex-1" 
                        style={{ backgroundColor: bgColor }}
                    >
                        {title}
                    </h2>
                    <div 
                        className="ml-2 px-2 py-1 rounded text-xs font-bold text-white"
                        style={{ backgroundColor: connectionStatus.color }}
                    >
                        {connectionStatus.text}
                    </div>
                </div>

                {/* Current Value Display */}
                <div className="text-center">
                    <h1 className="text-4xl font-bold my-4">
                        {currentValue !== null ? (
                            <span>
                                {typeof currentValue === 'number' ? currentValue.toFixed(2) : currentValue}
                                <span className="text-lg font-normal ml-2">{unit}</span>
                            </span>
                        ) : (
                            <span className="text-gray-400">Loading...</span>
                        )}
                    </h1>
                    
                    {/* Last Update Time */}
                    {lastUpdate && (
                        <p className="text-xs text-gray-500 mb-4">
                            Last update: {lastUpdate.toLocaleTimeString('th-TH')}{firebaseTimestamp ? ' (Firebase)' : ' (Local)'}
                        </p>
                    )}
                </div>

                {/* Real-time Chart */}
                <div className="h-52 mb-4">
                    {dataPoints.length > 0 ? (
                        <Line data={chartData} options={chartOptions} />
                    ) : (
                        <div className="flex items-center justify-center h-full bg-gray-50 rounded">
                            <p className="text-gray-400">Waiting for data...</p>
                        </div>
                    )}
                </div>

                {/* Data Info */}
                {/* <div className="text-xs text-gray-500 text-center">
                    <p>Data points: {dataPoints.length}/30</p>
                    <p>Source: {dataPath}</p>
                    {timestamp_path && (
                        <p>Timestamp: {timestamp_path}</p>
                    )}
                    {firebaseTimestamp && (
                        <p className="text-green-600">
                            Firebase time: {new Date(firebaseTimestamp).toLocaleTimeString('th-TH')}
                        </p>
                    )}
                    {!firebaseTimestamp && timestamp_path && (
                        <p className="text-orange-500">Using local time (Firebase timestamp not available)</p>
                    )}
                </div> */}
            </div>
        </div>
    );
}
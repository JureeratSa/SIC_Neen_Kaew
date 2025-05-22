"use client";
import { useState } from "react";
import Swal from 'sweetalert2';

const DelPatient = ({ id, onDeleted }) => {
    const [loading, setLoading] = useState(false);

    const showAlertFiled = (message) => {
        Swal.fire({
            icon: "error",
            title: message || "เกิดข้อผิดพลาด!!",
        });
    };

    const showAlertSuccess = async () => {
        const result = await Swal.fire({
            title: "คุณต้องการลบข้อมูลใช่มั้ย?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#B7B7B7",
            confirmButtonText: "ลบข้อมูล",
            cancelButtonText: "ยกเลิก"
        });

        if (result.isConfirmed) {
            return true;
        }
        return false;
    };
    

    const handleDelete = async () => {
        if (!id) {
            console.log("Not found ID");
            return;
            
        }
    
        try {
            const isConfirmed = await showAlertSuccess();
            if (!isConfirmed) {
                return; 
            }
    
            setLoading(true);
    
            const response = await fetch(`http://127.0.0.1:8000/del/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
            });
    
            if (response.ok) {
                // const result = await response.json();
                Swal.fire({
                    title: "ลบข้อมูลสำเร็จ!",
                    icon: "success",
                    showConfirmButton: false,
                    timer: 1500
                });
                if (onDeleted) onDeleted(id);
            } else {
                showAlertFiled();
            }
        } catch (error) {
            console.error("Error:", error);
            showAlertFiled();
        } finally {
            setLoading(false);
        }
    };
    

    return (
        <button
            onClick={() => handleDelete(id)}
            disabled={loading}
            className="delete-button"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-8 text-red-500 hover:text-red-800"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                />
            </svg>
        </button>
    );
};

export default DelPatient;
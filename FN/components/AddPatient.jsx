"use client"
import { useState } from "react"
import Swal from "sweetalert2";

const AddPatient = () => {

    const [device, setDevice] = useState("");
    const [hnNumber, setHnNumber] = useState("");
    const [ipdRoom, setIpdRoom] = useState("");
    const [doctorName, setDoctorName] = useState("");
    const [allergic, setAllergic] = useState(false);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [age, setAge] = useState("");
    const [gender, setGender] = useState("");
    const [height, setHeight] = useState("");
    const [weight, setWeight] = useState("");
    const [bmi, setBmi] = useState(null);
    const [loading, setLoading] = useState(false);

    const resetForm = () => {
        setDevice("");
        setHnNumber("");
        setIpdRoom("");
        setDoctorName("");
        setAllergic(false);
        setFirstName("");
        setLastName("");
        setAge("");
        setGender("");
        setHeight("");
        setWeight("");
        setBmi(null);
    }

    const showAlertFiled = () => {
        Swal.fire({
            icon: 'error',
            title: 'error!!',
        })
    }

    const showAlertNotComplete = () => {
        Swal.fire({
            icon: 'error',
            title: 'Please fill out information!!',
        })
    }

    const showAlertSuccess = () => {
        Swal.fire({
            position: 'center',
            icon: 'success',
            title: 'saved success!!',
            showConfirmButton: false,
            timer: 1000
        })
    }

    const calculateBMI = (weight, height) => {
        const heightM = height / 100;
        const bmi_data = weight / (heightM ** 2);
        return bmi_data.toFixed(2);
    };

    const handleSubmitBMI = async (e) => {
        e.preventDefault();

        if (!device || !hnNumber || !ipdRoom || !doctorName || !firstName || !lastName || !age || !gender || !height || !weight ||!allergic) { 
            document.getElementById('functionmodal').close();
            showAlertNotComplete();
            resetForm();
            return;
        } else {
            const bmi_data = calculateBMI(weight, height);
            setBmi(bmi_data);

            try {
                setLoading(true);
                const response = await fetch("http://127.0.0.1:8000/patientData", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        device: device,
                        hn: hnNumber,
                        room: ipdRoom,
                        dname: doctorName,
                        fname: firstName,
                        lname: lastName,
                        age: age,
                        gender: gender,
                        height: height,
                        weight: weight,
                        bmi: parseFloat(bmi_data),
                        allergic: allergic
                    })
                });

                if (response.ok) {
                    const result = await response.json();
                    console.log(result);
                    document.getElementById('functionmodal').close();
                    showAlertSuccess();
                } else {
                    document.getElementById('functionmodal').close();
                    showAlertFiled();
                }
            } catch (error) {
                console.error("Error:", error);
            } finally {
                setLoading(false);
                resetForm();
            }
        }
    };

    const handleCloseModal = () => {
        resetForm();
        document.getElementById('functionmodal').close();
    };

    return (
        <>
            <button className="btn bg-navy text-base-100" onClick={() => document.getElementById('functionmodal').showModal()}>Add patient information</button>
            <dialog id="functionmodal" className="modal">
                <div className="modal-box bg-base-100">
                    <div className="modal-middle">
                        <h1 className="font-bold text-black">Enter patient information.</h1>
                        <form method="dialog" className="grid grid-cols-2 gap-4 mt-8 justify-center items-center">
                            <input
                                type="text"
                                placeholder="Please enter HN"
                                className="input input-bordered w-full max-w-xs bg-base-100 shadow-lg text-black"
                                value={hnNumber}
                                onChange={(e) => setHnNumber(e.target.value)}
                            />

                            <input
                                type="text"
                                placeholder="Please enter device"
                                className="input input-bordered w-full max-w-xs bg-base-100 shadow-lg text-black"
                                value={device}
                                onChange={(e) => setDevice(e.target.value)}
                            />

                            <input
                                type="text"
                                placeholder="Please enter first name"
                                className="input input-bordered w-full max-w-xs bg-base-100 shadow-lg text-black"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                            />

                            <input
                                type="text"
                                placeholder="Please enter last name"
                                className="input input-bordered w-full max-w-xs bg-base-100 shadow-lg text-black"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                            />

                            <input
                                type="text"
                                placeholder="Please enter IPD room "
                                className="input input-bordered w-full max-w-xs bg-base-100 shadow-lg text-black"
                                value={ipdRoom}
                                onChange={(e) => setIpdRoom(e.target.value)}
                            />

                            <input
                                type="text"
                                placeholder="Please enter doctor name"
                                className="input input-bordered w-full max-w-xs bg-base-100 shadow-lg text-black"
                                value={doctorName}
                                onChange={(e) => setDoctorName(e.target.value)}
                            />

                            <input
                                type="number"
                                placeholder="Please enter age"
                                className="input input-bordered w-full max-w-xs bg-base-100 shadow-lg text-black"
                                value={age}
                                onChange={(e) => setAge(e.target.value)}
                            />

                            <select
                                className={`input input-bordered w-full max-w-xs bg-base-100 shadow-lg ${
                                    gender ? "text-black" : ""
                                }`}
                                value={gender}
                                onChange={(e) => setGender(e.target.value)}
                            >
                                <option value="">Please select gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>

                            <input
                                type="number"
                                placeholder="Please enter height"
                                className="input input-bordered w-full max-w-xs bg-base-100 shadow-lg text-black"
                                value={height}
                                onChange={(e) => setHeight(e.target.value)}
                            />

                            <input
                                type="number"
                                placeholder="Please enter weight"
                                className="input input-bordered w-full max-w-xs bg-base-100 shadow-lg text-black"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                            />

                            <select
                                className={`input input-bordered w-full max-w-xs bg-base-100 shadow-lg ${
                                    allergic ? "text-black" : ""
                                }`}
                                value={allergic}
                                onChange={(e) => setAllergic(e.target.value)}
                            >
                                <option value="">Please select type</option>
                                <option value="1">Is Allergic</option>
                                <option value="0">Not allergic</option>
                            </select>

                        </form>
                        <div className="flex gap-4 justify-center mt-8">
                            <button onClick={handleSubmitBMI} className="btn bg-navy hover:bg-blue-950 text-base-100 w-full max-w-xs">Save</button>
                            <button type="button" onClick={handleCloseModal} className="btn bg-gray-400 hover:bg-gray-500 text-base-100 border-none w-full max-w-xs">Close</button>
                        </div>
                    </div>
                </div>
            </dialog>
        </>
    );
}

export default AddPatient

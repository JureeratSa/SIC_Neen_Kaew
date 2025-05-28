from fastapi import APIRouter, HTTPException
from models import PatientData
from firebase.firebases import save_patient_data

router = APIRouter()


@router.post("/patient_data", response_model=PatientData)
async def patient_data(data: PatientData):
    try:
        save_patient_data(
            device=data.device,
            hn=data.hn,
            room=data.room,
            dname=data.dname,
            fname=data.fname,
            lname=data.lname,
            age=data.age,
            sex=data.sex,
            height=data.height,
            weight=data.weight,
            bmi=data.bmi
        )
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save Patient Data: {str(e)}")


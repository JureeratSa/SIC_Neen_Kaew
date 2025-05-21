from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from firebase_admin import db

router = APIRouter()

Patient_path = "/Patients/Data"
Predict_path = "/Predictions/Data"


@router.get("/readAll")
async def get_all_predictions():
    try:
        firebase = db.reference(Patient_path)
        data = firebase.get()

        if not data:
            raise HTTPException(status_code=404, detail="No data found")

        return JSONResponse(content=data, status_code=200)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/readBy/{prediction_id}")
async def get_prediction_by_id(prediction_id: str):
    try:
        firebase = db.reference(f"{Patient_path}/{prediction_id}")
        data = firebase.get()

        if not data:
            raise HTTPException(status_code=404, detail="Data not found")

        return JSONResponse(content=data, status_code=200)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/del/{id}")
async def delete_prediction(id: str):
    try:

        firebase_patient = db.reference(f"{Patient_path}/{id}")
        patient_data = firebase_patient.get()

        if not patient_data:
            raise HTTPException(status_code=404, detail="Data not found in Patient")

        firebase_patient.delete()

        firebase_prediction = db.reference(f"{Predict_path}/{id}")
        prediction_data = firebase_prediction.get()

        if prediction_data:
            firebase_prediction.delete()

        return JSONResponse(content=prediction_data, status_code=200)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# -------------------------------------------------------- code dech --------------------------------------------------------#
from fastapi import APIRouter
from firebase.firebases import start_schedule_database
from firebase.EDA_Preprocessing import start_schedule_preprocessing_eda
from firebase.HRV_Preprocessing import start_schedule_preprocessing_hrv

router = APIRouter()


@router.get("/start_schedule")
async def start_schedule():
    try:
        await start_schedule_database()
        return {"message": "Started scheduling updates for the default patient"}
    except Exception as e:
        return {"error": str(e)}


@router.get("/start_preprocessing_eda")
async def start_preprocessing():
    try:
        await start_schedule_preprocessing_eda()
        return {"message": "Started scheduling preprocessing"}
    except Exception as e:
        return {"error": str(e)}


@router.get("/start_preprocessing_hrv")
async def start_preprocessing():
    try:
        await start_schedule_preprocessing_hrv()
        return {"message": "Started scheduling preprocessing"}
    except Exception as e:
        return {"error": str(e)}
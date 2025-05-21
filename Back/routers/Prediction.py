from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse
from models import Prediction
from datetime import datetime
import numpy as np
from firebase_admin import db
from model_dumb import model_dumb
from firebase.firebases import predict, predict_data_AVG1M, save_predict_AVG1M_to_firebase
from apscheduler.schedulers.background import BackgroundScheduler

router = APIRouter()
scheduler = BackgroundScheduler()


@scheduler.scheduled_job('interval', minutes=5)
def predict_AVG1M_from_firebase():
    try:
        input_data = predict_data_AVG1M()  # predict

        if not input_data:
            return JSONResponse(content={"error": "No data found in Firebase"}, status_code=404)

        EDA_data = round(float(input_data["EDA"]), 2)
        PPG_data = round(float(input_data["PPG"]), 2)
        ST_data = round(float(input_data["ST"]), 2)
        BMI_data = float(input_data["BMI"])

        input_data_array = np.array([[
            EDA_data,
            PPG_data,
            ST_data,
            BMI_data
        ]])

        Predicted_data = int(model_dumb.predict(input_data_array)[0])
        timestamp_data = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        result_to_JSON = {
            "Predicted_class": Predicted_data,
            "EDA": EDA_data,
            "PPG": PPG_data,
            "ST": ST_data,
            "BMI": BMI_data,
            "timestamp": timestamp_data
        }

        save_predict_AVG1M_to_firebase(Predicted_data, EDA_data, PPG_data, ST_data, BMI_data, timestamp_data)
        print(
            f"PainLevel: {Predicted_data} | EDA: {EDA_data} | PPG: {PPG_data} | ST: {ST_data} | BMI: {BMI_data} | Timestamp: {timestamp_data}")
        return JSONResponse(content=result_to_JSON)

    except Exception as e:
        print(f"Error: {str(e)}")
        return JSONResponse(content={"error": str(e)}, status_code=500)


scheduler.start()


@router.get("/prediction_AVG5M", response_model=Prediction)
def predict_AVG1M():
    predict_AVG1M_from_firebase()
    return JSONResponse(content={"message": "Data predicted 5M successfully"})

# @scheduler.scheduled_job('interval', minutes=1)
# def predict_from_firebase(patient_id: str = Query(None), device_id: str = Query(None)):
#     try:
#
#         if patient_id:
#             input_data = predict_data_AVG5M(patient_id=patient_id)
#         elif device_id:
#             input_data = predict_data_AVG5M(device_id=device_id)
#         else:
#             return JSONResponse(content={"error": "Either patient_id or device_id must be provided."}, status_code=400)
#
#         if not input_data:
#             return JSONResponse(content={"error": "No data found in Firebase"}, status_code=404)
#
#         EDA_data = round(float(input_data["EDA"]), 2)
#         PPG_data = round(float(input_data["PPG"]), 2)
#         ST_data = round(float(input_data["ST"]), 2)
#         BMI_data = float(input_data["BMI"])
#         Device_data = input_data["DeviceID"]
#
#         if None in [EDA_data, PPG_data, ST_data, BMI_data]:
#             return JSONResponse(content={"error": "Incomplete data from Firebase"}, status_code=400)
#
#         input_data_array = np.array([[
#             EDA_data,
#             PPG_data,
#             ST_data,
#             BMI_data
#         ]])
#
#         Predicted_data = int(model_dumb.predict(input_data_array)[0])
#         timestamp_data = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
#
#         result_to_JSON = {
#                 "Predicted_class": Predicted_data,
#                 "EDA": EDA_data,
#                 "PPG": PPG_data,
#                 "ST": ST_data,
#                 "BMI": BMI_data,
#                 "timestamp": timestamp_data,
#                 "DeviceID": Device_data
#         }
#
#         save_predict_to_firebase(Predicted_data, EDA_data, PPG_data, ST_data, BMI_data, timestamp_data, Device_data)
#
#         return JSONResponse(content=result_to_JSON)
#
#     except Exception as e:
#         print(f"Error: {str(e)}")
#         return JSONResponse(content={"error": str(e)}, status_code=500)
#
# scheduler.start()
#
#
# @router.get("/prediction_AVG5M", response_model=Prediction)
# async def predict_AVG5M(patient_id: str = Query(None), device_id: str = Query(None)):
#     predict_from_firebase(patient_id=patient_id, device_id=device_id)
#     return JSONResponse(content={"message": "Data predicted 5M successfully"})
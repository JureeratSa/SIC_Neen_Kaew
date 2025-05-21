from config import initialize_firebase
from firebase_admin import db
from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler

initialize_firebase()
scheduler = BackgroundScheduler()


# --------------------------------- GET ---------------------------------#
def predict_data_AVG1M():  # real

    firebase_data = db.reference("/Device/Inpatient/MD-V5-0000804/1min")
    input_data = firebase_data.get()

    if not input_data:
        EDA_value = None
    else:
        EDA_value = float(input_data["EDA"])

    if not input_data:
        PPG_value = None
    else:
        PPG_value = float(input_data["PPG"])

    if not input_data:
        ST_value = None
    else:
        ST_value = float(input_data["ST"])

    firebase_BMI = db.reference("/Patients/Data")
    input_data_BMI = firebase_BMI.get()

    if not input_data_BMI:
        BMI_value = None
    else:
        latest_key_BMI = max(input_data_BMI.keys())
        BMI_value = float(input_data_BMI[latest_key_BMI]["BMI"])

    return {
        "EDA": EDA_value,
        "PPG": PPG_value,
        "ST": ST_value,
        "BMI": BMI_value
    }


def predict():
    firebase_EDA_data = db.reference("/Preprocessing/EDA")
    input_EDA_data = firebase_EDA_data.get()

    if not input_EDA_data:
        EDA_value = None
    else:
        EDA_value = float(input_EDA_data["EDA_Phasic"])

    firebase_HRV_data = db.reference("/Preprocessing/HRV")
    input_HRV_data = firebase_HRV_data.get()

    if not input_HRV_data:
        PPG_value = None
    else:
        PPG_value = float(input_HRV_data["LFHF"])

    firebase_ST_data = db.reference("/Device/Inpatient/MD-V5-0000804/1min")
    input_ST_data = firebase_ST_data.get()

    if not input_ST_data:
        ST_value = None
    else:
        ST_value = float(input_ST_data["ST"])

    firebase_BMI = db.reference("/Patients/Data")
    input_data_BMI = firebase_BMI.get()

    if not input_data_BMI:
        BMI_value = None
    else:
        latest_key_BMI = max(input_data_BMI.keys())
        BMI_value = float(input_data_BMI[latest_key_BMI]["BMI"])

    return {
        "EDA": EDA_value,
        "PPG": PPG_value,
        "ST": ST_value,
        "BMI": BMI_value
    }


# def predict_data_AVG5M(patient_id):

#     firebase_patient_path = f"/Patients/Data/{patient_id}"
#     patient_data = db.reference(firebase_patient_path).get()

#     if not patient_data or "DeviceID" not in patient_data:
#         return {"error": "DeviceID not found"}

#     device_id = patient_data["DeviceID"]

#     firebase_data_path = f"/Device/Inpatient/{device_id}/5min"
#     firebase_data = db.reference(firebase_data_path).get()

#     if not firebase_data:
#         EDA_value = None
#         PPG_value = None
#         ST_value = None
#     else:
#         EDA_value = float(firebase_data.get("EDA", None))
#         PPG_value = float(firebase_data.get("PPG", None))
#         ST_value = float(firebase_data.get("ST", None))

#     firebase_BMI_path = f"/Patients/Data/{patient_id}"
#     patient_data = db.reference(firebase_BMI_path).get()

#     if not patient_data:
#         BMI_value = None
#     else:
#         BMI_value = float(patient_data["BMI"]) if "BMI" in patient_data else None

#     return {
#         "EDA": EDA_value,
#         "PPG": PPG_value,
#         "ST": ST_value,
#         "BMI": BMI_value,
#         "DeviceID": device_id
#     }

# --------------------------------- SAVE ---------------------------------#

def save_patient_data(device, hn, room, dname, fname, lname, age, sex, height, weight, bmi):
    firebase = db.reference("Patients/Data")
    data = firebase.get()

    if data:
        last_id = max(int(item) for item in data.keys())
        new_id = f"{last_id + 1:03d}"
    else:
        new_id = "001"

    patient_data = {
        "DeviceID": device,
        "HN": hn,
        "Room": room,
        "Doctor_name": dname,
        "First_name": fname,
        "Last_name": lname,
        "Age": age,
        "Sex": sex,
        "Height": height,
        "Weight": weight,
        "BMI": bmi,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

    firebase.child(new_id).set(patient_data)


def save_predict_AVG1M_to_firebase(Predicted_data, EDA_data, PPG_data, ST_data, BMI_data, timestamp_data):
    firebase = db.reference('/Predictions/Data')
    data = firebase.get()

    if data:
        existing_id = list(data.keys())[0]
    else:
        existing_id = "Latest"

    firebase.child(existing_id).update({
        "PainLevel": Predicted_data,
        "EDA": EDA_data,
        "PPG": PPG_data,
        "ST": ST_data,
        "BMI": BMI_data,
        "timestamp": timestamp_data
    })

    print("------------------------------------------------------------------------------------------------")
    print("Data updated for |5M| successfully in Firebase Realtime Database")
    print("------------------------------------------------------------------------------------------------")


# def save_predict_to_firebase(Predicted_data, EDA_data, PPG_data, ST_data, BMI_data, timestamp_data, Device_data):
#     firebase = db.reference('/Predictions/Data')
#     data = firebase.get()

#     #เช็ค id ที่มี DeviceID ตรงกับข้อมูลที่ส่งมา
#     existing_id = None
#     if data:
#         for key, value in data.items():
#             if value.get("DeviceID") == Device_data:
#                 existing_id = key
#                 break

#     if existing_id:

#         firebase.child(existing_id).update({
#             "Predicted_class": Predicted_data,
#             "EDA": EDA_data,
#             "PPG": PPG_data,
#             "ST": ST_data,
#             "BMI": BMI_data,
#             "timestamp": timestamp_data,
#             "DeviceID": Device_data
#         })
#     else:

#         if data:
#             last_id = max(int(item) for item in data.keys())
#             new_id = f"{last_id + 1:03d}"
#         else:
#             new_id = "001"

#         firebase.child(new_id).set({
#             "Predicted_class": Predicted_data,
#             "EDA": EDA_data,
#             "PPG": PPG_data,
#             "ST": ST_data,
#             "BMI": BMI_data,
#             "timestamp": timestamp_data,
#             "DeviceID": Device_data
#         })

# ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------

def scheduler_update_database_prediction_1HR():
    try:
        latest_prediction_firebase_data = db.reference('Predictions/Data/Latest')
        latest_prediction_data = latest_prediction_firebase_data.get()

        # latest_hr_data = connect_firebase.child('Device/Inpatient/MD-V5-0000804/1min').get()

        # if latest_hr_data:
        #     hr_value = latest_hr_data.get('HeartRate', None)
        #     hr_value = float(hr_value) if hr_value not in [None, 'N/A'] else None
        # else:
        #     hr_value = None

        if latest_prediction_data:

            eda_value = latest_prediction_data.get('EDA', None)
            ppg_value = latest_prediction_data.get('PPG', None)
            st_value = latest_prediction_data.get('ST', None)
            painLevel_value = latest_prediction_data.get('PainLevel', None)

            eda_value = float(eda_value) if eda_value not in [None, 'N/A'] else None
            st_value = float(st_value) if st_value not in [None, 'N/A'] else None
            painLevel_value = int(painLevel_value) if painLevel_value not in [None, 'N/A'] else None

            current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            predictions_ref = db.reference('Predictions/Data/Overview').child('1HR')

            predictions_ref.update({
                'PainLevel': painLevel_value,
                'EDA': eda_value,
                'PPG': ppg_value,
                'ST': st_value,
                # 'HR': hr_value,
                'Timestamp': current_time
            })
            print("--------------------------------------------------------------------------------------------------")
            print("Data updated for |1HR| successfully in Firebase Realtime Database")
            print("--------------------------------------------------------------------------------------------------")
            print(
                f"PainLevel: {painLevel_value} | EDA: {eda_value} | PPG: {ppg_value} | ST: {st_value} | Timestamp: {current_time}")
        else:
            raise ValueError("No prediction data found at Predictions/Data/Latest in Firebase")

    except Exception as e:
        print(f"Error updating Realtime Database: {e}")


# ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------

def scheduler_update_database_prediction_3HR():
    try:
        latest_prediction_firebase_data = db.reference('Predictions/Data/Latest')
        latest_prediction_data = latest_prediction_firebase_data.get()

        # latest_hr_data = connect_firebase.child('Device/Inpatient/MD-V5-0000804/1min').get()

        # if latest_hr_data:
        #     hr_value = latest_hr_data.get('HeartRate', None)
        #     hr_value = float(hr_value) if hr_value not in [None, 'N/A'] else None
        # else:
        #     hr_value = None

        if latest_prediction_data:

            eda_value = latest_prediction_data.get('EDA', None)
            ppg_value = latest_prediction_data.get('PPG', None)
            st_value = latest_prediction_data.get('ST', None)
            painLevel_value = latest_prediction_data.get('PainLevel', None)

            eda_value = float(eda_value) if eda_value not in [None, 'N/A'] else None
            st_value = float(st_value) if st_value not in [None, 'N/A'] else None
            painLevel_value = int(painLevel_value) if painLevel_value not in [None, 'N/A'] else None

            current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            predictions_ref = db.reference('Predictions/Data/Overview').child('3HR')

            predictions_ref.update({
                'PainLevel': painLevel_value,
                'EDA': eda_value,
                'PPG': ppg_value,
                'ST': st_value,
                # 'HR': hr_value,
                'Timestamp': current_time
            })
            print("--------------------------------------------------------------------------------------------------")
            print("Data updated for |3HR| successfully in Firebase Realtime Database")
            print("--------------------------------------------------------------------------------------------------")
            print(
                f"PainLevel: {painLevel_value} | EDA: {eda_value} | PPG: {ppg_value} | ST: {st_value} | Timestamp: {current_time}")
        else:
            raise ValueError("No prediction data found at Predictions/Data/Latest in Firebase")

    except Exception as e:
        print(f"Error updating Realtime Database: {e}")


# ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------

def scheduler_update_database_prediction_6HR():
    try:
        latest_prediction_firebase_data = db.reference('Predictions/Data/Latest')
        latest_prediction_data = latest_prediction_firebase_data.get()

        # latest_hr_data = connect_firebase.child('Device/Inpatient/MD-V5-0000804/1min').get()

        # if latest_hr_data:
        #     hr_value = latest_hr_data.get('HeartRate', None)
        #     hr_value = float(hr_value) if hr_value not in [None, 'N/A'] else None
        # else:
        #     hr_value = None

        if latest_prediction_data:

            eda_value = latest_prediction_data.get('EDA', None)
            ppg_value = latest_prediction_data.get('PPG', None)
            st_value = latest_prediction_data.get('ST', None)
            painLevel_value = latest_prediction_data.get('PainLevel', None)

            eda_value = float(eda_value) if eda_value not in [None, 'N/A'] else None
            st_value = float(st_value) if st_value not in [None, 'N/A'] else None
            painLevel_value = int(painLevel_value) if painLevel_value not in [None, 'N/A'] else None

            current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            predictions_ref = db.reference('Predictions/Data/Overview').child('6HR')

            predictions_ref.update({
                'PainLevel': painLevel_value,
                'EDA': eda_value,
                'PPG': ppg_value,
                'ST': st_value,
                # 'HR': hr_value,
                'Timestamp': current_time
            })
            print("--------------------------------------------------------------------------------------------------")
            print("Data updated for |6HR| successfully in Firebase Realtime Database")
            print("--------------------------------------------------------------------------------------------------")
            print(
                f"PainLevel: {painLevel_value} | EDA: {eda_value} | PPG: {ppg_value} | ST: {st_value} | Timestamp: {current_time}")
        else:
            raise ValueError("No prediction data found at Predictions/Data/Latest in Firebase")

    except Exception as e:
        print(f"Error updating Realtime Database: {e}")


# ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------

def scheduler_update_database_prediction_12HR():
    try:
        latest_prediction_firebase_data = db.reference('Predictions/Data/Latest')
        latest_prediction_data = latest_prediction_firebase_data.get()

        # latest_hr_data = connect_firebase.child('Device/Inpatient/MD-V5-0000804/1min').get()

        # if latest_hr_data:
        #     hr_value = latest_hr_data.get('HeartRate', None)
        #     hr_value = float(hr_value) if hr_value not in [None, 'N/A'] else None
        # else:
        #     hr_value = None

        if latest_prediction_data:

            eda_value = latest_prediction_data.get('EDA', None)
            ppg_value = latest_prediction_data.get('PPG', None)
            st_value = latest_prediction_data.get('ST', None)
            painLevel_value = latest_prediction_data.get('PainLevel', None)

            eda_value = float(eda_value) if eda_value not in [None, 'N/A'] else None
            st_value = float(st_value) if st_value not in [None, 'N/A'] else None
            painLevel_value = int(painLevel_value) if painLevel_value not in [None, 'N/A'] else None

            current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            predictions_ref = db.reference('Predictions/Data/Overview').child('12HR')

            predictions_ref.update({
                'PainLevel': painLevel_value,
                'EDA': eda_value,
                'PPG': ppg_value,
                'ST': st_value,
                # 'HR': hr_value,
                'Timestamp': current_time
            })
            print("---------------------------------------------------------------------------------------------------")
            print("Data updated for |12HR| successfully in Firebase Realtime Database")
            print("---------------------------------------------------------------------------------------------------")
            print(
                f"PainLevel: {painLevel_value} | EDA: {eda_value} | PPG: {ppg_value} | ST: {st_value} | Timestamp: {current_time}")
        else:
            raise ValueError("No prediction data found at Prediction/Data/Latest in Firebase")

    except Exception as e:
        print(f"Error updating Realtime Database: {e}")


# ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------

def schedule_update_interval():
    scheduler.add_job(
        scheduler_update_database_prediction_1HR,
        trigger='interval',
        hours=1
    )

    scheduler.add_job(
        scheduler_update_database_prediction_3HR,
        trigger='interval',
        hours=3
    )

    scheduler.add_job(
        scheduler_update_database_prediction_6HR,
        trigger='interval',
        hours=6
    )

    scheduler.add_job(
        scheduler_update_database_prediction_12HR,
        trigger='interval',
        hours=12
    )

    scheduler.start()


async def start_schedule_database():
    try:
        schedule_update_interval()
        return {"message": "Started scheduling updates for the default patient"}
    except Exception as e:
        return {"error": str(e)}


def save_predict_AVG5M_to_firebase(Predicted_data, EDA_data, PPG_data, ST_data, BMI_data, timestamp_data):
    firebase = db.reference('/Predictions/Data/AVG5M')
    data = firebase.get()

    # เพิ่ม ID
    # if data:
    #     last_id = max(int(item) for item in data.keys())
    #     new_id = f"{last_id + 1:03d}"
    # else:
    #     new_id = "001"

    if data:
        last_id = max(data.keys(), key=int)
    else:
        last_id = "001"

    firebase.child(last_id).update({
        "Predicted_class": Predicted_data,
        "EDA": EDA_data,
        "PPG": PPG_data,
        "ST": ST_data,
        "BMI": BMI_data,
        "timestamp": timestamp_data
    })

import firebase_admin
from firebase_admin import credentials

def initialize_firebase():
    cred = credentials.Certificate("/Users/kaew/Desktop/ngebakadfl/test-firebase-fee55-firebase-adminsdk-fbsvc-4a4a20bc05.json")
    firebase_admin.initialize_app(cred, {
        "databaseURL": "https://test-firebase-fee55-default-rtdb.asia-southeast1.firebasedatabase.app/"
    })
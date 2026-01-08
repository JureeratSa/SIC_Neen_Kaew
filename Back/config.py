import firebase_admin
from firebase_admin import credentials
import os

def initialize_firebase():
    base_path = os.path.dirname(os.path.abspath(__file__))
    cred_path = os.path.join(base_path, "painproject-419f0-firebase-adminsdk-fbsvc-15c1537a76.json")
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred, {
        "databaseURL": "https://painproject-419f0-default-rtdb.asia-southeast1.firebasedatabase.app/"
    })

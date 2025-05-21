from pydantic import BaseModel
    
class PatientData(BaseModel):
    device: str
    hn: str
    room: str
    dname: str
    fname: str
    lname: str
    age: int
    sex: str
    height: int
    weight: float
    bmi: float
    
class Prediction(BaseModel):
    Predicted_class: int
    EDA: float
    PPG: float
    ST: float
    BMI: float
    timestamp: str
    
class Dashboard(BaseModel):
    painLevel: int
    timestamp: str
import joblib
from sklearn.ensemble import RandomForestClassifier
model_dumb = joblib.load(rf"/Users/kaew/Downloads/SIC_Neen_Kaew-main/Back/RF-2.pkl")

#"D:\Work\Project\Model_Dumb\Model_Dumbxgb_model_['EDA_Phasic_EmotiBit', 'EDA_Tonic_EmotiBit', 'BMI', 'SkinTemp_Emo'].pkl"

if isinstance(model_dumb, RandomForestClassifier):
    print("RF model loaded successfully!")
else:
    raise ValueError("Loaded model is not an RF. Please check the file path.")

import joblib
import xgboost as xgb

model_dumb = joblib.load(rf"/Users/kaew/Desktop/ngebakadfl/Model_Dumbxgb_model_[_EDA_Phasic_EmotiBit_, _EDA_Tonic_EmotiBit_, _BMI_, _SkinTemp_Emo_].pkl")

#"D:\Work\Project\Model_Dumb\Model_Dumbxgb_model_['EDA_Phasic_EmotiBit', 'EDA_Tonic_EmotiBit', 'BMI', 'SkinTemp_Emo'].pkl"

if isinstance(model_dumb, xgb.XGBClassifier):
    print("XGBoost model loaded successfully!")
else:
    raise ValueError("Loaded model is not an XGBClassifier. Please check the file path.")
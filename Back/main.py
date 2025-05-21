from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import Prediction,DataFromFront,Operation,Overview

app = FastAPI()

# origins = ["http://127.0.0.1:5500"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(Prediction.router)
app.include_router(DataFromFront.router)
app.include_router(Operation.router)
app.include_router(Overview.router)

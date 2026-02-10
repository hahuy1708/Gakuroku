# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(
    title="Gakuroku API",
    description="Backend API for Japanese Flashcard App",
    version="0.1.0"
)

origins = [
    "http://localhost:3000", # Next.js port 
    "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # dev environment 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "message": "Welcome to Gakuroku API",
        "status": "running",
        "db_host": os.getenv("DB_HOST") # Test .env 
    }
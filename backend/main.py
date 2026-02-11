# backend/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from db_config import setup_database
from dotenv import load_dotenv
import os

import mysql.connector

from schemas import WordSchema
from search import search_entries

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting up... Setting up database.")
    setup_database()
    yield
    print("Shutting down...")

app = FastAPI(
    title="Gakuroku API",
    description="Backend API for Japanese Flashcard App",
    version="0.1.0",
    lifespan=lifespan,
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


@app.get("/api/search", response_model=list[WordSchema])
def api_search(keyword: str):
    try:
        return search_entries(keyword)
    except mysql.connector.Error:
        raise HTTPException(status_code=503, detail="Database connection error")
    except Exception:
        raise HTTPException(status_code=500, detail="Internal server error")
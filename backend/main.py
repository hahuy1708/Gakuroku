# backend/main.py
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from db_config import setup_database
from dotenv import load_dotenv
import os

from routers.search import router as search_router
from routers.lists import router as lists_router
from routers.flashcards import router as flashcards_router
from routers.stats import router as stats_router

load_dotenv()

logger = logging.getLogger("gakuroku")
logging.basicConfig(level=logging.INFO)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up... setting up database")
    setup_database()
    yield
    logger.info("Shutting down...")

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

app.include_router(search_router)
app.include_router(lists_router)
app.include_router(flashcards_router)
app.include_router(stats_router)

@app.get("/")
def read_root():
    return {
        "message": "Welcome to Gakuroku API",
        "status": "running",
        "db_host": os.getenv("DB_HOST") # Test .env 
    }

# backend/main.py
import logging

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from db_config import setup_database
from dotenv import load_dotenv
import os

import mysql.connector
from datetime import date, timedelta

from schemas import (
    FlashcardCreateSchema,
    FlashcardResponseSchema,
    FlashcardUpdateSchema,
    HeatmapDaySchema,
    ListCreateSchema,
    ListResponseSchema,
    ListUpdateSchema,
    OverviewStatsSchema,
    WordSchema,
)
from services.search import search_entries
from services.flashcard_service import (
    create_flashcard,
    delete_flashcard,
    get_flashcards_by_list,
    update_flashcard,
)
from db_config import get_connection, increment_study_log
from services.list_service import create_list, delete_list, get_lists, update_list

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
    except mysql.connector.Error as e:
        logger.exception("Database error in /api/search: %s", e)
        raise HTTPException(status_code=503, detail="Database connection error")
    except Exception:
        raise HTTPException(status_code=500, detail="Internal server error")


@app.get("/api/lists", response_model=list[ListResponseSchema])
def api_get_lists():
    try:
        return get_lists()
    except mysql.connector.Error as e:
        logger.exception("Database error in GET /api/lists: %s", e)
        raise HTTPException(status_code=503, detail="Database connection error")


@app.post("/api/lists", response_model=ListResponseSchema)
def api_create_list(payload: ListCreateSchema):
    try:
        return create_list(payload.name)
    except mysql.connector.Error as e:
        logger.exception("Database error in POST /api/lists: %s", e)
        raise HTTPException(status_code=503, detail="Database connection error")

@app.patch("/api/lists/{list_id}", response_model=ListResponseSchema)
def api_update_list(list_id: int, payload: ListUpdateSchema):
    try:
        updated = update_list(list_id, payload.name, payload.description)
        if updated is None:
            raise HTTPException(status_code=404, detail="List not found")
        return updated
    except mysql.connector.Error as e:
        logger.exception("Database error in PATCH /api/lists/%s: %s", list_id, e)
        raise HTTPException(status_code=503, detail="Database connection error")


@app.delete("/api/lists/{list_id}")
def api_delete_list(list_id: int):
    try:
        deleted = delete_list(list_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="List not found")
        return {"deleted": True}
    except mysql.connector.Error as e:
        logger.exception("Database error in DELETE /api/lists/%s: %s", list_id, e)
        raise HTTPException(status_code=503, detail="Database connection error")


@app.get("/api/lists/{list_id}/flashcards", response_model=list[FlashcardResponseSchema])
def api_get_flashcards(list_id: int):
    try:
        return get_flashcards_by_list(list_id)
    except mysql.connector.Error as e:
        logger.exception("Database error in GET /api/lists/%s/flashcards: %s", list_id, e)
        raise HTTPException(status_code=503, detail="Database connection error")


@app.post("/api/flashcards", response_model=FlashcardResponseSchema)
def api_create_flashcard(payload: FlashcardCreateSchema):
    try:
        return create_flashcard(payload.list_id, payload.entry_id, payload.note)
    except mysql.connector.IntegrityError as e:
        # Duplicate card in a list OR invalid foreign key
        msg = str(e).lower()
        if "unique" in msg or "duplicate" in msg:
            raise HTTPException(status_code=409, detail="Flashcard already exists in this list")
        raise HTTPException(status_code=400, detail="Invalid list_id or entry_id")
    except mysql.connector.Error as e:
        logger.exception("Database error in POST /api/flashcards: %s", e)
        raise HTTPException(status_code=503, detail="Database connection error")


@app.patch("/api/flashcards/{flashcard_id}", response_model=FlashcardResponseSchema)
def api_update_flashcard(flashcard_id: int, payload: FlashcardUpdateSchema):
    try:
        updated = update_flashcard(flashcard_id, payload.is_memorized, payload.note)
        if updated is None:
            raise HTTPException(status_code=404, detail="Flashcard not found")
        try:
            increment_study_log(date.today())
        except Exception as e:
            logger.warning("Failed to increment study log: %s", e)
        return updated
    except mysql.connector.Error as e:
        logger.exception("Database error in PATCH /api/flashcards/%s: %s", flashcard_id, e)
        raise HTTPException(status_code=503, detail="Database connection error")


@app.delete("/api/flashcards/{flashcard_id}")
def api_delete_flashcard(flashcard_id: int):
    try:
        deleted = delete_flashcard(flashcard_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Flashcard not found")
        return {"deleted": True}
    except mysql.connector.Error as e:
        logger.exception("Database error in DELETE /api/flashcards/%s: %s", flashcard_id, e)
        raise HTTPException(status_code=503, detail="Database connection error")


@app.get("/api/stats/heatmap", response_model=list[HeatmapDaySchema])
def api_get_heatmap_stats():
    """Return study activity for last 365 days (including today)."""
    start_date = date.today() - timedelta(days=364)
    end_date = date.today()
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """
            SELECT `date`, `count`
            FROM study_logs
            WHERE `date` >= %s AND `date` <= %s
            ORDER BY `date` ASC
            """,
            (start_date, end_date),
        )

        out: list[dict] = []
        for row in cursor.fetchall() or []:
            d = row[0]
            c = row[1]
            out.append({"date": d.isoformat() if hasattr(d, "isoformat") else str(d), "count": int(c)})
        return out
    except mysql.connector.Error as e:
        logger.exception("Database error in GET /api/stats/heatmap: %s", e)
        raise HTTPException(status_code=503, detail="Database connection error")
    finally:
        cursor.close()
        conn.close()


def _compute_streaks(study_dates: list[date]) -> tuple[int, int]:
    """Compute (current_streak, longest_streak) from sorted unique dates."""
    if not study_dates:
        return 0, 0

    unique_sorted = sorted(set(study_dates))
    date_set = set(unique_sorted)

    today = date.today()
    start = today if today in date_set else (today - timedelta(days=1) if (today - timedelta(days=1)) in date_set else None)
    current_streak = 0
    if start is not None:
        d = start
        while d in date_set:
            current_streak += 1
            d = d - timedelta(days=1)

    longest_streak = 1
    run = 1
    for i in range(1, len(unique_sorted)):
        if (unique_sorted[i] - unique_sorted[i - 1]).days == 1:
            run += 1
        else:
            longest_streak = max(longest_streak, run)
            run = 1
    longest_streak = max(longest_streak, run)

    return current_streak, longest_streak


@app.get("/api/stats/overview", response_model=OverviewStatsSchema)
def api_get_overview_stats():
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT COALESCE(SUM(`count`), 0) FROM study_logs")
        total_reviews = int((cursor.fetchone() or [0])[0] or 0)

        cursor.execute("SELECT COUNT(*) FROM flashcards WHERE is_memorized = 1")
        mastered_words = int((cursor.fetchone() or [0])[0] or 0)

        cursor.execute("SELECT `date` FROM study_logs WHERE `count` > 0 ORDER BY `date` ASC")
        study_dates = [row[0] for row in (cursor.fetchall() or [])]
        current_streak, longest_streak = _compute_streaks(study_dates)

        return {
            "total_reviews": total_reviews,
            "mastered_words": mastered_words,
            "current_streak": current_streak,
            "longest_streak": longest_streak,
        }
    except mysql.connector.Error as e:
        logger.exception("Database error in GET /api/stats/overview: %s", e)
        raise HTTPException(status_code=503, detail="Database connection error")
    finally:
        cursor.close()
        conn.close()
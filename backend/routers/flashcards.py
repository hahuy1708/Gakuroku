import logging
from datetime import date

import mysql.connector
from fastapi import APIRouter, HTTPException

from db_config import increment_study_log
from schemas import FlashcardCreateSchema, FlashcardResponseSchema, FlashcardUpdateSchema
from services.flashcard_service import create_flashcard, delete_flashcard, update_flashcard

logger = logging.getLogger("gakuroku")

router = APIRouter(prefix="/api/flashcards", tags=["Flashcards"])


@router.post("", response_model=FlashcardResponseSchema)
def api_create_flashcard(payload: FlashcardCreateSchema):
    try:
        return create_flashcard(payload.list_id, payload.entry_id, payload.note)
    except mysql.connector.IntegrityError as e:
        msg = str(e).lower()
        if "unique" in msg or "duplicate" in msg:
            raise HTTPException(status_code=409, detail="Flashcard already exists in this list")
        raise HTTPException(status_code=400, detail="Invalid list_id or entry_id")
    except mysql.connector.Error as e:
        logger.exception("Database error in POST /api/flashcards: %s", e)
        raise HTTPException(status_code=503, detail="Database connection error")


@router.patch("/{flashcard_id}", response_model=FlashcardResponseSchema)
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


@router.delete("/{flashcard_id}")
def api_delete_flashcard(flashcard_id: int):
    try:
        deleted = delete_flashcard(flashcard_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Flashcard not found")
        return {"deleted": True}
    except mysql.connector.Error as e:
        logger.exception("Database error in DELETE /api/flashcards/%s: %s", flashcard_id, e)
        raise HTTPException(status_code=503, detail="Database connection error")

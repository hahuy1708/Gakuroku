import logging

import mysql.connector
from fastapi import APIRouter, HTTPException

from schemas import FlashcardResponseSchema, ListCreateSchema, ListResponseSchema, ListUpdateSchema
from services.flashcard_service import get_flashcards_by_list
from services.list_service import create_list, delete_list, get_lists, update_list

logger = logging.getLogger("gakuroku")

router = APIRouter(prefix="/api/lists", tags=["Lists"])


@router.get("", response_model=list[ListResponseSchema])
def api_get_lists():
    try:
        return get_lists()
    except mysql.connector.Error as e:
        logger.exception("Database error in GET /api/lists: %s", e)
        raise HTTPException(status_code=503, detail="Database connection error")


@router.post("", response_model=ListResponseSchema)
def api_create_list(payload: ListCreateSchema):
    try:
        return create_list(payload.name)
    except mysql.connector.Error as e:
        logger.exception("Database error in POST /api/lists: %s", e)
        raise HTTPException(status_code=503, detail="Database connection error")


@router.patch("/{list_id}", response_model=ListResponseSchema)
def api_update_list(list_id: int, payload: ListUpdateSchema):
    try:
        updated = update_list(list_id, payload.name, payload.description)
        if updated is None:
            raise HTTPException(status_code=404, detail="List not found")
        return updated
    except mysql.connector.Error as e:
        logger.exception("Database error in PATCH /api/lists/%s: %s", list_id, e)
        raise HTTPException(status_code=503, detail="Database connection error")


@router.delete("/{list_id}")
def api_delete_list(list_id: int):
    try:
        deleted = delete_list(list_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="List not found")
        return {"deleted": True}
    except mysql.connector.Error as e:
        logger.exception("Database error in DELETE /api/lists/%s: %s", list_id, e)
        raise HTTPException(status_code=503, detail="Database connection error")


@router.get("/{list_id}/flashcards", response_model=list[FlashcardResponseSchema])
def api_get_flashcards(list_id: int):
    try:
        return get_flashcards_by_list(list_id)
    except mysql.connector.Error as e:
        logger.exception("Database error in GET /api/lists/%s/flashcards: %s", list_id, e)
        raise HTTPException(status_code=503, detail="Database connection error")

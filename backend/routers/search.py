import logging

import mysql.connector
from fastapi import APIRouter, HTTPException

from schemas import WordSchema
from services.search import search_entries

logger = logging.getLogger("gakuroku")

router = APIRouter(prefix="/api/search", tags=["Search"])


@router.get("", response_model=list[WordSchema])
def api_search(keyword: str):
    try:
        return search_entries(keyword)
    except mysql.connector.Error as e:
        logger.exception("Database error in /api/search: %s", e)
        raise HTTPException(status_code=503, detail="Database connection error")
    except Exception:
        raise HTTPException(status_code=500, detail="Internal server error")

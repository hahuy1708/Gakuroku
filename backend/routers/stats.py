import logging

import mysql.connector
from fastapi import APIRouter, HTTPException

from schemas import HeatmapDaySchema, OverviewStatsSchema
from services.stat_service import get_heatmap_stats_last_365_days, get_overview_stats

logger = logging.getLogger("gakuroku")

router = APIRouter(prefix="/api/stats", tags=["Stats"])


@router.get("/heatmap", response_model=list[HeatmapDaySchema])
def api_get_heatmap_stats():
    try:
        return get_heatmap_stats_last_365_days()
    except mysql.connector.Error as e:
        logger.exception("Database error in GET /api/stats/heatmap: %s", e)
        raise HTTPException(status_code=503, detail="Database connection error")


@router.get("/overview", response_model=OverviewStatsSchema)
def api_get_overview_stats():
    try:
        return get_overview_stats()
    except mysql.connector.Error as e:
        logger.exception("Database error in GET /api/stats/overview: %s", e)
        raise HTTPException(status_code=503, detail="Database connection error")

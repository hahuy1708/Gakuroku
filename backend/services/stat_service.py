# backend/services/stat_service.py
from __future__ import annotations

from datetime import date, timedelta

from db_config import get_connection


def compute_streaks(study_dates: list[date]) -> tuple[int, int]:
	"""Compute (current_streak, longest_streak) from a list of study dates.

	A day counts as studied if it exists in study_dates (already filtered to count>0).
	Current streak starts from today if studied today, otherwise from yesterday if studied yesterday.
	"""
	if not study_dates:
		return 0, 0

	unique_sorted = sorted(set(study_dates))
	date_set = set(unique_sorted)

	today = date.today()
	yesterday = today - timedelta(days=1)
	start = today if today in date_set else (yesterday if yesterday in date_set else None)

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


def get_heatmap_stats_last_365_days() -> list[dict]:
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
	finally:
		cursor.close()
		conn.close()


def get_overview_stats() -> dict:
	"""Return overview stats.

	- total_reviews: SUM(study_logs.count)
	- mastered_words: COUNT(flashcards where is_memorized=1)
	- current_streak / longest_streak: derived from study_logs days with count>0
	"""
	conn = get_connection()
	cursor = conn.cursor()
	try:
		cursor.execute("SELECT COALESCE(SUM(`count`), 0) FROM study_logs")
		total_reviews = int((cursor.fetchone() or [0])[0] or 0)

		cursor.execute("SELECT COUNT(*) FROM flashcards WHERE is_memorized = 1")
		mastered_words = int((cursor.fetchone() or [0])[0] or 0)

		cursor.execute("SELECT `date` FROM study_logs WHERE `count` > 0 ORDER BY `date` ASC")
		study_dates = [row[0] for row in (cursor.fetchall() or [])]
		current_streak, longest_streak = compute_streaks(study_dates)

		return {
			"total_reviews": total_reviews,
			"mastered_words": mastered_words,
			"current_streak": current_streak,
			"longest_streak": longest_streak,
		}
	finally:
		cursor.close()
		conn.close()

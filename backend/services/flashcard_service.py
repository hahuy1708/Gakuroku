from __future__ import annotations

import json
from typing import List, Optional

import mysql.connector

from db_config import get_connection
from services.search import _extract_word_schema_dict, _parse_word_json


def create_flashcard(list_id: int, entry_id: str, note: Optional[str] = None) -> dict:
	conn = get_connection()
	cursor = conn.cursor()
	try:
		cursor.execute(
			"""
			INSERT INTO flashcards (list_id, entry_id, note)
			VALUES (%s, %s, %s)
			""",
			(list_id, entry_id, note),
		)
		conn.commit()
		flashcard_id = int(cursor.lastrowid)
	finally:
		cursor.close()
		conn.close()

	# Return enriched object with word_data
	card = get_flashcard(flashcard_id)
	if card is None:
		raise RuntimeError("Failed to load created flashcard")
	return card


def get_flashcard(flashcard_id: int) -> Optional[dict]:
	conn = get_connection()
	cursor = conn.cursor()
	try:
		cursor.execute(
			"""
			SELECT
				f.id,
				f.list_id,
				f.entry_id,
				f.note,
				f.is_memorized,
				e.raw_json
			FROM flashcards f
			JOIN entries e ON e.id = f.entry_id
			WHERE f.id = %s
			""",
			(flashcard_id,),
		)
		row = cursor.fetchone()
		if not row:
			return None

		raw_json = row[5]
		word_obj = _parse_word_json(raw_json) or {}
		entry_id = str(row[2])
		word_data = _extract_word_schema_dict(word_obj, entry_id=entry_id) if word_obj else {
			"kanji": None,
			"kana": "",
			"is_common": False,
			"senses": [],
		}

		return {
			"id": int(row[0]),
			"list_id": int(row[1]),
			"entry_id": str(row[2]),
			"note": row[3],
			"is_memorized": bool(row[4]),
			"word_data": word_data,
		}
	finally:
		cursor.close()
		conn.close()


def get_flashcards_by_list(list_id: int) -> List[dict]:
	conn = get_connection()
	cursor = conn.cursor()
	try:
		cursor.execute(
			"""
			SELECT
				f.id,
				f.list_id,
				f.entry_id,
				f.note,
				f.is_memorized,
				e.raw_json
			FROM flashcards f
			JOIN entries e ON e.id = f.entry_id
			WHERE f.list_id = %s
			ORDER BY f.created_at DESC, f.id DESC
			""",
			(list_id,),
		)

		results: List[dict] = []
		for row in cursor.fetchall() or []:
			word_obj = _parse_word_json(row[5])
			if not word_obj:
				continue
			entry_id = str(row[2])
			results.append(
				{
					"id": int(row[0]),
					"list_id": int(row[1]),
					"entry_id": str(row[2]),
					"note": row[3],
					"is_memorized": bool(row[4]),
					"word_data": _extract_word_schema_dict(word_obj, entry_id=entry_id),
				}
			)
		return results
	finally:
		cursor.close()
		conn.close()


def update_flashcard(flashcard_id: int, is_memorized: bool, note: Optional[str]) -> Optional[dict]:
	conn = get_connection()
	cursor = conn.cursor()
	try:
		cursor.execute(
			"""
			UPDATE flashcards
			SET is_memorized = %s,
				note = %s
			WHERE id = %s
			""",
			(1 if is_memorized else 0, note, flashcard_id),
		)
		conn.commit()
	finally:
		cursor.close()
		conn.close()

	return get_flashcard(flashcard_id)


def delete_flashcard(flashcard_id: int) -> bool:
	conn = get_connection()
	cursor = conn.cursor()
	try:
		cursor.execute("DELETE FROM flashcards WHERE id = %s", (flashcard_id,))
		conn.commit()
		return cursor.rowcount > 0
	finally:
		cursor.close()
		conn.close()

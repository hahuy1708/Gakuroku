from __future__ import annotations

from typing import List, Optional

import mysql.connector

from db_config import get_connection


def create_list(name: str) -> dict:
	conn = get_connection()
	cursor = conn.cursor()
	try:
		cursor.execute(
			"INSERT INTO vocab_lists (name) VALUES (%s)",
			(name,),
		)
		conn.commit()
		list_id = int(cursor.lastrowid)
		return {"id": list_id, "name": name, "count": 0}
	finally:
		cursor.close()
		conn.close()


def get_lists() -> List[dict]:
	conn = get_connection()
	cursor = conn.cursor(dictionary=True)
	try:
		cursor.execute(
			"""
			SELECT
				l.id,
				l.name,
				COALESCE(COUNT(f.id), 0) AS count
			FROM vocab_lists l
			LEFT JOIN flashcards f ON f.list_id = l.id
			GROUP BY l.id, l.name
			ORDER BY l.created_at DESC, l.id DESC
			"""
		)
		rows = cursor.fetchall() or []
		for row in rows:
			row["id"] = int(row["id"])
			row["count"] = int(row["count"]) if row.get("count") is not None else 0
		return rows
	finally:
		cursor.close()
		conn.close()


def delete_list(list_id: int) -> bool:
	conn = get_connection()
	cursor = conn.cursor()
	try:
		cursor.execute("DELETE FROM vocab_lists WHERE id = %s", (list_id,))
		conn.commit()
		return cursor.rowcount > 0
	finally:
		cursor.close()
		conn.close()

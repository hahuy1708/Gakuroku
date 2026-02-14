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
				l.description,
				COALESCE(COUNT(f.id), 0) AS count
			FROM vocab_lists l
			LEFT JOIN flashcards f ON f.list_id = l.id
			GROUP BY l.id, l.name, l.description
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

def update_list(list_id: int, name: str, description: str = None) -> Optional[dict]:
	conn = get_connection()
	cursor = conn.cursor(dictionary=True)
	try:
		cursor.execute(
			"UPDATE vocab_lists SET name = %s, description = %s WHERE id = %s",
			(name, description, list_id)
		)
		conn.commit()
		if cursor.rowcount == 0:
			return None
		cursor.execute("SELECT * FROM vocab_lists WHERE id = %s", (list_id,))
		row = cursor.fetchone()
		if row:
			row["id"] = int(row["id"])
			return row
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

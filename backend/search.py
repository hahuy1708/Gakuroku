# backend/search.py
from __future__ import annotations

import json
import re
from typing import Any, Dict, List, Optional

from db_config import get_connection


def _parse_word_json(raw_json: Any) -> Optional[dict]:
    if raw_json is None:
        return None
    if isinstance(raw_json, dict):
        return raw_json
    if isinstance(raw_json, (bytes, bytearray)):
        raw_json = raw_json.decode("utf-8")
    if isinstance(raw_json, str):
        try:
            return json.loads(raw_json)
        except json.JSONDecodeError:
            return None
    return None


def _extract_word_schema_dict(word_obj: dict) -> Dict[str, Any]:
    kanji_list = word_obj.get("kanji") or []
    kana_list = word_obj.get("kana") or []

    kanji_text = None
    if kanji_list:
        first = kanji_list[0] or {}
        if isinstance(first, dict):
            kanji_text = first.get("text")

    kana_text = ""
    if kana_list:
        first = kana_list[0] or {}
        if isinstance(first, dict):
            kana_text = first.get("text") or ""

    is_common = any(
        isinstance(item, dict) and item.get("common")
        for item in (kanji_list + kana_list)
    )

    senses: List[Dict[str, Any]] = []
    for sense in word_obj.get("sense") or []:
        if not isinstance(sense, dict):
            continue

        parts_of_speech = sense.get("partOfSpeech") or []
        if not isinstance(parts_of_speech, list):
            parts_of_speech = []

        glosses: List[str] = []
        for gloss in sense.get("gloss") or []:
            if isinstance(gloss, dict):
                # JMdict JSON uses: {"lang":"eng", "text":"..."}
                if gloss.get("lang") and gloss.get("lang") != "eng":
                    continue
                text = gloss.get("text")
                if text:
                    glosses.append(str(text))
            elif isinstance(gloss, str):
                glosses.append(gloss)

        senses.append(
            {
                "parts_of_speech": [str(p) for p in parts_of_speech if p],
                "glosses": glosses,
            }
        )

    return {
        "kanji": str(kanji_text) if kanji_text else None,
        "kana": str(kana_text),
        "is_common": bool(is_common),
        "senses": senses,
    }


def search_entries(keyword: str) -> List[dict]:
    """Search entries and return a list of WordSchema-shaped dicts."""
    conn = None
    cursor = None
    output: List[dict] = []
    
    try:
        conn = get_connection()
        cursor = conn.cursor()

        # Search priority:
        # 1) Exact Kanji (any spelling)
        # 2) Exact Reading (any reading)
        # 3) Prefix Kanji / Reading
        # 4) Common flag (from any Kanji form)
        # 5) Exact English word in gloss_text (word boundary)
        # 6) Prefix gloss
        # 7) Full-text score (English gloss_text)
        # 8) LIKE fallback
        
        sql_search = """
            SELECT
                e.raw_json,
                e.primary_headword,

                EXISTS(
                    SELECT 1 FROM entry_kanji k
                    WHERE k.entry_id = e.id AND k.kanji_text = %s
                ) AS exact_kj,
                EXISTS(
                    SELECT 1 FROM entry_reading r
                    WHERE r.entry_id = e.id AND r.reading_text = %s
                ) AS exact_rd,
                EXISTS(
                    SELECT 1 FROM entry_kanji k
                    WHERE k.entry_id = e.id AND k.kanji_text LIKE %s
                ) AS prefix_kj,
                EXISTS(
                    SELECT 1 FROM entry_reading r
                    WHERE r.entry_id = e.id AND r.reading_text LIKE %s
                ) AS prefix_rd,

                COALESCE((SELECT MAX(k.is_common) FROM entry_kanji k WHERE k.entry_id = e.id), 0) AS is_common,

                (LOWER(d.gloss_text) REGEXP CONCAT('(^|[^0-9a-z])', %s, '([^0-9a-z]|$)')) AS exact_gloss_word,
                (LOWER(d.gloss_text) LIKE CONCAT(%s, '%')) AS prefix_gloss,
                (d.gloss_text LIKE %s) AS like_gloss,
                MATCH(d.gloss_text) AGAINST (%s IN NATURAL LANGUAGE MODE) AS ft_score,

                CHAR_LENGTH(e.primary_headword) AS hw_len

            FROM entries e
            LEFT JOIN entry_definitions d ON d.entry_id = e.id
            JOIN (
                SELECT entry_id FROM entry_kanji
                 WHERE kanji_text = %s OR kanji_text LIKE %s
                UNION
                SELECT entry_id FROM entry_reading
                 WHERE reading_text = %s OR reading_text LIKE %s
                UNION
                SELECT entry_id FROM entry_definitions
                 WHERE gloss_text LIKE %s OR MATCH(gloss_text) AGAINST (%s IN NATURAL LANGUAGE MODE)
            ) m ON m.entry_id = e.id

            ORDER BY
                exact_kj DESC,
                exact_rd DESC,
                prefix_kj DESC,
                prefix_rd DESC,
                is_common DESC,
                exact_gloss_word DESC,
                prefix_gloss DESC,
                ft_score DESC,
                like_gloss DESC,
                hw_len ASC,
                e.primary_headword ASC

            LIMIT 10;
        """

        prefix = f"{keyword}%"
        like = f"%{keyword}%"

        # For regex ranking in English gloss: treat keyword as a literal string.
        keyword_lower = str(keyword).lower()
        regex_literal = re.escape(keyword_lower)
        
        params = (
            # ranking flags
            keyword,
            keyword,
            prefix,
            prefix,
            regex_literal,
            keyword_lower,
            like,
            keyword,
            # candidate set
            keyword,
            prefix,
            keyword,
            prefix,
            like,
            keyword,
        )

        cursor.execute(sql_search, params)
        results = cursor.fetchall()
        
        for row in results or []:
            raw_json = row[0]
            word_obj = _parse_word_json(raw_json)
            if not word_obj:
                continue
            output.append(_extract_word_schema_dict(word_obj))
            

    except Exception as e:
        print(f"Error searching entries: {e}")
        # Return empty list on error instead of None/Crash
    finally:
        if cursor is not None:
            cursor.close()
        if conn is not None:
            conn.close()

    return output 
# backend/import_task.py
import json
import os
import time
from db_config import get_connection

INPUT_FILE = 'jmdict-eng-common-3.6.1.json'


def _extract_primary_headword(word: dict) -> str:
    kanji_list = word.get('kanji') or []
    kana_list = word.get('kana') or []
    if kanji_list:
        return (kanji_list[0] or {}).get('text') or ''
    if kana_list:
        return (kana_list[0] or {}).get('text') or ''
    return ''


def _extract_gloss_text(word: dict) -> str:
    """Flatten English gloss into a single text field for search."""
    glosses: list[str] = []
    for sense in word.get('sense') or []:
        for gloss in sense.get('gloss') or []:
            # JMdict JSON uses objects like: {"lang":"eng", "text":"..."}
            if isinstance(gloss, dict):
                if gloss.get('lang') and gloss.get('lang') != 'eng':
                    continue
                text = gloss.get('text')
                if text:
                    glosses.append(str(text))
            elif isinstance(gloss, str):
                # fallback if dataset shape differs
                glosses.append(gloss)

    # de-dup while preserving order
    seen: set[str] = set()
    unique: list[str] = []
    for g in glosses:
        if g not in seen:
            seen.add(g)
            unique.append(g)
    return '; '.join(unique)


def _clear_old_entry_data(cursor) -> None:
    """Clear entry-related tables before reimport.
    """
    cursor.execute("SET FOREIGN_KEY_CHECKS = 0")
    cursor.execute("TRUNCATE TABLE flashcards")
    cursor.execute("TRUNCATE TABLE entry_definitions")
    cursor.execute("TRUNCATE TABLE entry_reading")
    cursor.execute("TRUNCATE TABLE entry_kanji")
    cursor.execute("TRUNCATE TABLE entries")
    cursor.execute("SET FOREIGN_KEY_CHECKS = 1")

def run_import():
    if not os.path.exists(INPUT_FILE):
        print(f"Không tìm thấy file '{INPUT_FILE}' trong thư mục.")
        return

    conn = get_connection()
    cursor = conn.cursor()

    print("Clearing old data (entries / kanji / reading / definitions / flashcards)...")
    _clear_old_entry_data(cursor)
    conn.commit()

    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)

    words_list = data.get('words', [])
    total_words = len(words_list)
    print(f"Found {total_words} words. Starting import...")

    sql_entries = """
        INSERT INTO entries (id, primary_headword, raw_json)
        VALUES (%s, %s, %s)
    """
    sql_kanji = """
        INSERT IGNORE INTO entry_kanji (entry_id, kanji_text, is_common)
        VALUES (%s, %s, %s)
    """
    sql_reading = """
        INSERT IGNORE INTO entry_reading (entry_id, reading_text)
        VALUES (%s, %s)
    """
    sql_defs = """
        INSERT INTO entry_definitions (entry_id, gloss_text)
        VALUES (%s, %s)
        ON DUPLICATE KEY UPDATE gloss_text = VALUES(gloss_text)
    """

    batch_entries: list[tuple] = []
    batch_kanji: list[tuple] = []
    batch_reading: list[tuple] = []
    batch_defs: list[tuple] = []
    count = 0
    start_time = time.time()

    BATCH_SIZE = 2000

    for word in words_list:
        w_id = word.get('id')

        primary_headword = _extract_primary_headword(word)
        raw_json = json.dumps(word, ensure_ascii=False)
        batch_entries.append((w_id, primary_headword, raw_json))

        # Kanji spellings (all)
        kanji_seen: set[str] = set()
        for k in word.get('kanji') or []:
            txt = (k or {}).get('text')
            if not txt or txt in kanji_seen:
                continue
            kanji_seen.add(txt)
            common = 1 if (k or {}).get('common') else 0
            batch_kanji.append((w_id, txt, common))

        # Readings (all)
        reading_seen: set[str] = set()
        for r in word.get('kana') or []:
            txt = (r or {}).get('text')
            if not txt or txt in reading_seen:
                continue
            reading_seen.add(txt)
            batch_reading.append((w_id, txt))

        # Definitions (flattened English gloss)
        gloss_text = _extract_gloss_text(word)
        batch_defs.append((w_id, gloss_text))

        count += 1

        if len(batch_entries) >= BATCH_SIZE:
            cursor.executemany(sql_entries, batch_entries)
            if batch_kanji:
                cursor.executemany(sql_kanji, batch_kanji)
            if batch_reading:
                cursor.executemany(sql_reading, batch_reading)
            if batch_defs:
                cursor.executemany(sql_defs, batch_defs)
            conn.commit()

            batch_entries, batch_kanji, batch_reading, batch_defs = [], [], [], []
            print(f"   -> Imported {count}/{total_words} entries...")

    if batch_entries:
        cursor.executemany(sql_entries, batch_entries)
        if batch_kanji:
            cursor.executemany(sql_kanji, batch_kanji)
        if batch_reading:
            cursor.executemany(sql_reading, batch_reading)
        if batch_defs:
            cursor.executemany(sql_defs, batch_defs)
        conn.commit()

    cursor.execute("SELECT COUNT(*) FROM entries")
    imported_count = cursor.fetchone()[0]

    duration = time.time() - start_time
    rate = (count / duration) if duration > 0 else 0
    print(f"Imported {count} words in {duration:.2f} seconds (~{rate:,.0f} words/second).")
    print(f"Check in DB: {imported_count}/{total_words} records.")
    if imported_count != total_words:
        print(" Warning: number of records in DB does not match number of words in file.")
    
    cursor.close()
    conn.close()
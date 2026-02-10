# search.py
import json
import re
from db_config import get_connection

def perform_search(keyword):
    conn = get_connection()
    cursor = conn.cursor()

    print(f"\n🔍 Searching: '{keyword}'...")

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
    # (If the user types characters like '.', '+', '?', etc. we don't want them to act as regex operators.)
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
    
    if not results:
        print(" Cant found a result for your query.")
    else:
        print(f" Results:\n")

        for row in results:
            raw_json = row[0]
            if isinstance(raw_json, (bytes, bytearray)):
                raw_json = raw_json.decode('utf-8')
            word_obj = raw_json if isinstance(raw_json, dict) else json.loads(raw_json)
            display_pretty_word(word_obj)
            
    cursor.close()
    conn.close()

def display_pretty_word(word_obj):
    kanjis = [k.get('text') for k in word_obj.get('kanji', [])]
    kanas = [k.get('text') for k in word_obj.get('kana', [])]
    
    is_common = any(k.get('common') for k in word_obj.get('kanji', []) + word_obj.get('kana', []))
    common_label = "⭐ [COMMON]" if is_common else ""

    print(f"┏" + "━"*50)
    
    # Line 1: Main text (Prefer Kanji, if not available then use Kana)
    main_text = kanjis[0] if kanjis else kanas[0]
    reading = f"({kanas[0]})" if kanjis else ""
    print(f"┃ 🔤 WORD: {main_text} {reading} {common_label}")
    
    if len(kanjis) > 1 or (kanjis and len(kanas) > 1):
        others = ", ".join(kanjis[1:] + kanas[1:])
        print(f"┃  Others: {others}")
    print(f"┣" + "┄"*50)

    for i, sense in enumerate(word_obj.get('sense', []), 1):
        pos_list = sense.get('partOfSpeech', [])
        pos_text = f"[{', '.join(pos_list)}]" if pos_list else ""

        gloss_items = sense.get('gloss', [])
        gloss_texts = []
        for g in gloss_items:
            if isinstance(g, dict):
                if g.get('lang') and g.get('lang') != 'eng':
                    continue
                t = g.get('text')
                if t:
                    gloss_texts.append(str(t))
            elif isinstance(g, str):
                gloss_texts.append(g)

        glosses = ", ".join(gloss_texts)

        print(f"┃  {i}. {pos_text} {glosses}")
        if i >= 3: break 

    print(f"┗" + "━"*50)
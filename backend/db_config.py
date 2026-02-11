# backend/db_config.py
import mysql.connector
from dotenv import load_dotenv 
import os
load_dotenv()

DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),       
    'password': os.getenv('DB_PASSWORD'),       
    'database': os.getenv('DB_NAME'),
    'port': int(os.getenv('DB_PORT')),
    'charset': 'utf8mb4', 
    'collation': 'utf8mb4_unicode_ci'
}

def get_connection():
    return mysql.connector.connect(**DB_CONFIG)

def setup_database():
    conn = get_connection()
    cursor = conn.cursor()

    statements = [
        # Main entry table: keep raw_json for display (no heavy JOIN needed to print).
        """
        CREATE TABLE IF NOT EXISTS entries (
            id VARCHAR(20) PRIMARY KEY,
            primary_headword VARCHAR(100) NOT NULL,
            raw_json JSON NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

            INDEX idx_primary_headword (primary_headword)
        ) ENGINE=InnoDB
          DEFAULT CHARSET=utf8mb4
          COLLATE=utf8mb4_unicode_ci;
        """,
        # Store ALL kanji spellings per entry for accurate search.
        """
        CREATE TABLE IF NOT EXISTS entry_kanji (
            entry_id VARCHAR(20) NOT NULL,
            kanji_text VARCHAR(100) NOT NULL,
            is_common TINYINT(1) NOT NULL DEFAULT 0,

            PRIMARY KEY (entry_id, kanji_text),
            INDEX idx_kanji (kanji_text),
            INDEX idx_entry_kanji_entry (entry_id),
            INDEX idx_entry_kanji_common (is_common),
            CONSTRAINT fk_entry_kanji_entry
                FOREIGN KEY (entry_id) REFERENCES entries(id)
                ON DELETE CASCADE
        ) ENGINE=InnoDB
          DEFAULT CHARSET=utf8mb4
          COLLATE=utf8mb4_unicode_ci;
        """,
        # Store ALL readings per entry for accurate search.
        """
        CREATE TABLE IF NOT EXISTS entry_reading (
            entry_id VARCHAR(20) NOT NULL,
            reading_text VARCHAR(100) NOT NULL,

            PRIMARY KEY (entry_id, reading_text),
            INDEX idx_reading (reading_text),
            INDEX idx_entry_reading_entry (entry_id),
            CONSTRAINT fk_entry_reading_entry
                FOREIGN KEY (entry_id) REFERENCES entries(id)
                ON DELETE CASCADE
        ) ENGINE=InnoDB
          DEFAULT CHARSET=utf8mb4
          COLLATE=utf8mb4_unicode_ci;
        """,
        # Flatten gloss text into a single row per entry for fast English full-text search.
        """
        CREATE TABLE IF NOT EXISTS entry_definitions (
            entry_id VARCHAR(20) PRIMARY KEY,
            gloss_text TEXT NOT NULL,

            FULLTEXT INDEX ft_gloss (gloss_text),
            CONSTRAINT fk_entry_definitions_entry
                FOREIGN KEY (entry_id) REFERENCES entries(id)
                ON DELETE CASCADE
        ) ENGINE=InnoDB
          DEFAULT CHARSET=utf8mb4
          COLLATE=utf8mb4_unicode_ci;
        """,
        # --- List & Flashcard ---
        """
        CREATE TABLE IF NOT EXISTS vocab_lists (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB
          DEFAULT CHARSET=utf8mb4
          COLLATE=utf8mb4_unicode_ci;
        """,
        """
        CREATE TABLE IF NOT EXISTS flashcards (
            id INT AUTO_INCREMENT PRIMARY KEY,
            list_id INT NOT NULL,
            entry_id VARCHAR(20) NOT NULL,
            note TEXT NULL,
            is_memorized TINYINT(1) NOT NULL DEFAULT 0,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

            UNIQUE KEY unique_card (list_id, entry_id),
            INDEX idx_flashcards_list (list_id),
            INDEX idx_flashcards_entry (entry_id),
            CONSTRAINT fk_flashcards_list
                FOREIGN KEY (list_id) REFERENCES vocab_lists(id)
                ON DELETE CASCADE,
            CONSTRAINT fk_flashcards_entry
                FOREIGN KEY (entry_id) REFERENCES entries(id)
                ON DELETE CASCADE
        ) ENGINE=InnoDB
          DEFAULT CHARSET=utf8mb4
          COLLATE=utf8mb4_unicode_ci;
        """,
    ]

    for stmt in statements:
        cursor.execute(stmt)

    conn.commit()
    cursor.close()
    conn.close()
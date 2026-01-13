# JMdict Console Dictionary (JP → EN)

A console-based Japanese–English dictionary application built with Python. It uses the dataset `jmdict-eng-common-3.6.1.json` and stores data in MySQL for fast searching.

## Requirements

* Python 3.10+
* MySQL 8.x

## Installation & Run (Windows)

### 1. Clone the project

```bash
git clone <YOUR_REPOSITORY_URL>
cd jmdict
```

### 2. Create virtual environment & install dependencies

```bash
python -m venv .venv
.venv\Scripts\activate

python -m pip install --upgrade pip
pip install mysql-connector-python python-dotenv
```

### 3. Create MySQL database

Open MySQL and create a database (for example, named `jmdict`):

```sql
CREATE DATABASE jmdict CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

You may use the `root` user or create a separate user and grant permissions to this database.

### 4. Configure `.env` file

Create a `.env` file in the project root (same level as `main.py`) with the following example content:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=jmdict
```

### 5. Run the application

```bash
python main.py
```

Menu options:

* **1. Import Data**: Import data from `jmdict-eng-common-3.6.1.json` into MySQL (usually run once at the beginning).
* **2. Search**: Search by English, Kanji, or Hiragana.
* **3. Exit**: Exit the application.
## Notes

* On the first run, the application will automatically create the `dictionary` table if it does not exist.
* If you import data multiple times, you may encounter duplicate `PRIMARY KEY (id)` errors.

  * Quick fix: clear or drop the table and import again:

    * `TRUNCATE TABLE dictionary;` or `DROP TABLE dictionary;` (then run the program again).

## Troubleshooting

* If you encounter database connection errors: ensure MySQL is running, `.env` credentials are correct, and the user has access rights to the database.
* If English search results are inaccurate or missing: make sure MySQL supports `FULLTEXT` indexes (already created in `setup_datab

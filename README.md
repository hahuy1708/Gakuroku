# Gakuroku

Gakuroku is a simple Japanese learning platform combining a robust dictionary with spaced repetition flashcards and GitHub-style daily progress tracking.

## Introduction
As a developer, I find the "GitHub Heatmap" to be a powerful motivator. This project applies that same logic to language learning. It also enables fast flashcard creation directly from dictionary search results. Transitions from a personal simple console-based dictionary to a full-stack web application, allowing for easier access, better UI, and scalable data management.

## Tech Stack

- Frontend: Next.js (React, App Router), TailwindCSS.

- Backend: FastAPI (Python).

- Database: MySQL.

- Data Source: JMdict


## Features

- **Core Functionality**:
    - Search dictionary entries by English, Kanji, or Hiragana.
    - Create and manage vocabulary lists.
    - Spaced repetition flashcards with GitHub-style daily progress tracking.

- **Data Management**:
    - Import  JMdict data into MySQL. [Link to source](https://github.com/yomidevs/jmdict-yomitan/releases)
    - Efficient data retrieval with optimized queries and indexing.


## Installation & Run (Windows)

### Prerequisites

- Python: 3.10+

- Node.js: 18+ (LTS recommended)

- MySQL: 8.x running locally or on cloud.

### 1. Clone the project

```bash
git clone <YOUR_REPOSITORY_URL>
cd Gakuroku
```

### 2. Create virtual environment & install dependencies

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate

python -m pip install --upgrade pip
pip install -r requirements.txt
```


### 3. Configure `.env` file

Create a `.env` file in the project root (same level as `main.py`) with the following example content:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=jmdict

SECRET_KEY=your_secret_key

```

### 5. Initialize DB & Import JMdict

Open MySQL and create a database (for example, named `jmdict`):

```sql
CREATE DATABASE jmdict CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- Note: utf8mb4 is required for Kanji support
```

```python
# Assumes you have jmdict-eng-common-3.6.1.json downloaded and placed in the project root
python import_task.py
```

### 6. Run the application

```bash
cd backend
uvicorn main:app --reload
```

```bash
cd frontend
npm run dev
```

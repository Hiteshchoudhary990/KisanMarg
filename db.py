"""
Database connection and query utilities for KisanMarg
Supports SQLite on local disk and portable in-memory querying.
"""

import sqlite3
import os
from typing import List, Dict, Any, Optional

DB_PATH = os.path.join(os.path.dirname(__file__), "mandi_data.sqlite")
SCHEMA_PATH = os.path.join(os.path.dirname(__file__), "schema.sql")

def get_connection():
    """Returns a SQLite connection with Row factory enabled."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initializes the database schema if not present."""
    if not os.path.exists(SCHEMA_PATH):
        raise FileNotFoundError(f"Schema not found at {SCHEMA_PATH}")
    
    with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
        schema_sql = f.read()
    
    with get_connection() as conn:
        conn.executescript(schema_sql)
        conn.commit()

def query_all(query: str, params: tuple = ()) -> List[Dict[str, Any]]:
    """Executes a SELECT query and returns list of dictionaries."""
    with get_connection() as conn:
        cur = conn.cursor()
        cur.execute(query, params)
        rows = cur.fetchall()
        return [dict(row) for row in rows]

def query_one(query: str, params: tuple = ()) -> Optional[Dict[str, Any]]:
    """Executes a SELECT query and returns a single row dict or None."""
    with get_connection() as conn:
        cur = conn.cursor()
        cur.execute(query, params)
        row = cur.fetchone()
        return dict(row) if row else None

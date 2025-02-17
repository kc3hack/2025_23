import os
import sys

import psycopg
from dotenv import load_dotenv


load_dotenv()

PG_HOST = os.getenv("PG_HOST", "localhost")
PG_PORT = os.getenv("PG_PORT", 5432)
PG_USER = os.getenv("PG_USER", "postgres")
PG_PASSWORD = os.getenv("PG_PASSWORD", "password")
PG_DATABASE = os.getenv("PG_DATABASE", "postgres")


def get_database_url():
    """データベース接続用のURLを返す"""
    return f"postgresql+psycopg://{PG_USER}:{PG_PASSWORD}@{PG_HOST}:{PG_PORT}/{PG_DATABASE}"


DATABASE_URL = get_database_url()


def init_database():
    """データベース接続を初期化して返す"""
    try:
        conn = psycopg.connect(
            host=PG_HOST,
            port=PG_PORT,
            user=PG_USER,
            password=PG_PASSWORD,
            dbname=PG_DATABASE,
        )
    except Exception as e:
        print(f"PSQLへの接続エラー: {e}")
        sys.exit(1)

    return conn


def close_connection(conn):
    """データベース接続を閉じる"""
    conn.close()

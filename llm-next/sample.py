import sys
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.chat_models import ChatOpenAI
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.vectorstores import Chroma
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferMemory

import os
from dotenv import load_dotenv 
load_dotenv()

# PostgreSQLに接続するための設定
import psycopg2
PG_HOST = os.getenv("PG_HOST")
PG_PORT = os.getenv("PG_PORT")
PG_USER = os.getenv("PG_USER")
PG_PASSWORD = os.getenv("PG_PASSWORD")
PG_DATABASE = os.getenv("PG_DATABASE")

# セッションIDに基づいてテーブル名を作成 (テーブルがまだ存在しない場合は作成)
session_id = sys.argv[1]
table_name = f"chat_history_{session_id}"

try:
    conn = psycopg2.connect(host=PG_HOST, port=PG_PORT, user=PG_USER, password=PG_PASSWORD, dbname=PG_DATABASE)
    cur = conn.cursor()
    cur.execute(f"""
        CREATE TABLE IF NOT EXISTS {table_name} (
            id SERIAL PRIMARY KEY,
            role TEXT NOT NULL,
            content TEXT NOT NULL
        );
    """)
    conn.commit()
except Exception as e:
    print(f"PostgreSQLへの接続またはテーブル作成エラー: {e}")
    sys.exit(1)

# メッセージの取得と保存を行う関数
def fetch_messages():
    try:
        cur.execute(f"SELECT role, content FROM {table_name}")
        messages = []
        for role, content in cur:
            messages.append({"role": role, "content": content})
        return messages
    except Exception as e:
        print(f"メッセージ取得エラー: {e}")
        return []

def save_message(role, content):
    try:
        cur.execute(f"INSERT INTO {table_name} (role, content) VALUES (%s, %s)", (role, content))
        conn.commit()
    except Exception as e:
        print(f"メッセージ保存エラー: {e}")


# ユーザーメッセージの追加
user_message = sys.argv[2]
save_message("user", user_message)


# プロンプトテンプレートの作成
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "あなたは役に立つアシスタントです。 すべての質問にできる限り答えてください。"),
        MessagesPlaceholder(variable_name="messages"),
    ]
)


# Llama-2を使用するための設定 (詳細はLlama-cppのドキュメントなどを参照)
# ※ ここは仮の記述です。実際のLlama-2の利用方法に合わせて適宜変更してください。
llm = ChatOpenAI(model_name="gpt-3.5-turbo", temperature=0.2) # Llama-2のラッパーを使用


# メッセージ履歴の取得
messages = fetch_messages()
formatted_messages = [{"role": msg["role"], "content": msg["content"]} for msg in messages]

# Chainの実行
chain = prompt | llm
result = chain.invoke({"messages": formatted_messages})


# AIメッセージの追加
save_message("ai", result.content)

print(result.content)

# PostgreSQL接続のクローズ
cur.close()
conn.close()

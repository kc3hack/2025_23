import sys
import uuid

from dotenv import load_dotenv

from llm_next.chat import chat_with_history
from llm_next.db import close_connection, init_database
from llm_next.embeddings import init_embeddings
from llm_next.llm import init_llm


def main() -> None:
    load_dotenv()
    # session IDの取得と検証
    session_id = sys.argv[1] if len(sys.argv) > 1 else None
    if not session_id:
        print("Error: Please provide a session ID.")
        sys.exit(1)

    # データベースの初期化
    conn = init_database()

    # Embeddingsモデルの初期化
    embeddings = init_embeddings(local=False)

    # LLMの初期化
    llm = init_llm(local=False)
    session_uuid = str(uuid.uuid4())

    # チャットボットとの対話ループ
    while True:
        user_input = input("質問を入力してください (終了するには'exit'と入力): ")
        if user_input.lower() == "exit":
            break
        try:
            response = chat_with_history(
                user_input, session_id, session_uuid, embeddings, llm, conn
            )
            print(f"回答: {response}")
        except Exception as e:
            print(f"エラーが発生しました: {e}")

    close_connection(conn)

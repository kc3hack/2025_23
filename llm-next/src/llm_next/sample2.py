import os
import sys
import uuid

from dotenv import load_dotenv
import psycopg

from langchain.callbacks.manager import CallbackManager
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.vectorstores import PGVector
from langchain_postgres import PostgresChatMessageHistory
from langchain_postgres.chat_message_histories import _create_table_and_index
from langchain.chains import RetrievalQA
from langchain_community.llms.llamacpp import LlamaCpp

# 環境変数の読み込み
load_dotenv()
PG_HOST = os.getenv("PG_HOST", "localhost")
PG_PORT = os.getenv("PG_PORT", 5432)
PG_USER = os.getenv("PG_USER", "postgres")
PG_PASSWORD = os.getenv("PG_PASSWORD", "password")
PG_DATABASE = os.getenv("PG_DATABASE", "postgres")
DATABASE_URL = f"postgresql+psycopg2://{PG_USER}:{PG_PASSWORD}@{PG_HOST}:{PG_PORT}/{PG_DATABASE}"

# Embeddingsモデルの初期化
embeddings = HuggingFaceEmbeddings(model_name="intfloat/multilingual-e5-large")

# Callback Managerの初期化
callback_manager = CallbackManager([StreamingStdOutCallbackHandler()])

def load_model(model_path):
    """LLMモデルをロードする"""
    print(f"############{os.path.abspath(model_path)}#################")

    llm = LlamaCpp(
        model_path=model_path,
        n_gpu_layers=25,  # gpuに処理させるlayerの数
        stop=["Question:", "Answer:"],  # 停止文字列
        streaming=True,  # ストリーミング処理を行うか
        callback_manager=callback_manager,
    )
    return llm

# LLMモデルのロード
chat = load_model("../../models/Meta-Llama-3-8B-Instruct-Q4_K_M.gguf")

# PostgreSQLに接続
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


def chat_with_history(query: str):
    """チャット履歴を検索し、回答を生成する"""
    retriever = db.as_retriever(search_kwargs={"k": 2})  # 検索結果の上位2件を取得
    qa = RetrievalQA.from_chain_type(llm=chat, chain_type="stuff", retriever=retriever)
    answer = qa.run(query)
    history.add_user_message(query)
    #history.add_ai_message(answer)

    return answer

session_id = sys.argv[1]
if not session_id:
    sys.exit(1)
session_uuid = str(uuid.uuid4())  
    
table_name = f"chat_history_{session_id}"

# pgvectorを使ったVectorstoreを初期化。テーブルが存在しない場合は作成
COLLECTION_NAME = "chat_history"  # 好きなコレクション名に変更可能
db = PGVector(
    collection_name=table_name,
    connection_string=DATABASE_URL,
    embedding_function=embeddings,
)
try:
    PostgresChatMessageHistory.create_tables(conn, table_name)
    #with conn.cursor() as c:
    #    create_tables(c, table_name)
    #    print("table created")
except Exception as e:
    print(f"table err: {e}")
    sys.exit(1)
history = PostgresChatMessageHistory(
    table_name,
    session_uuid,
    sync_connection=conn
)


# チャットボットとの対話ループ
while True:
    user_input = input("質問を入力してください (終了するには'exit'と入力): ")
    if user_input.lower() == "exit":
        break
    try:
        response = chat_with_history(user_input)
        print(f"回答: {response}")
    except Exception as e:
        print(f"エラーが発生しました: {e}")

conn.close()

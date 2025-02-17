import os
import sys
import uuid

from dotenv import load_dotenv
import psycopg

from langchain.callbacks.manager import CallbackManager
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from langchain.schema.output_parser import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage


# RAG用
from langchain.schema.runnable import RunnableParallel, RunnablePassthrough
from langchain.vectorstores import PGVector
from langchain_postgres import PostgresChatMessageHistory
from langchain.chains import RetrievalQA

# LocalLLM用
from langchain_community.llms.llamacpp import LlamaCpp
from langchain.embeddings import HuggingFaceEmbeddings

# Gemini用
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_google_vertexai import VertexAI


# 環境変数の読み込み
load_dotenv()
PG_HOST = os.getenv("PG_HOST", "localhost")
PG_PORT = os.getenv("PG_PORT", 5432)
PG_USER = os.getenv("PG_USER", "postgres")
PG_PASSWORD = os.getenv("PG_PASSWORD", "password")
PG_DATABASE = os.getenv("PG_DATABASE", "postgres")
DATABASE_URL = (
    f"postgresql+psycopg2://{PG_USER}:{PG_PASSWORD}@{PG_HOST}:{PG_PORT}/{PG_DATABASE}"
)
GEMINI_API_KEY = os.getenv("GOOGLE_API_KEY", "DEADC0DE")

# Embeddingsモデルの初期化
# embeddings = HuggingFaceEmbeddings(model_name="intfloat/multilingual-e5-large")
embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")


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
# chat = load_model("../../models/Meta-Llama-3-8B-Instruct-Q4_K_M.gguf")
# chat = VertexAI(model_name="gemini-1.5-flash-001", temperature=0, google_api_key=GEMINI_API_KEY)
chat = ChatGoogleGenerativeAI(model="gemini-1.5-flash-001")

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

prompt = ChatPromptTemplate.from_template(
    """
    以下のcontextだけに基づいて回答してください。
    {context}
    
    質問: 
    {question}
    """
)
output_parser = StrOutputParser()


def chat_with_history(query: str):
    """チャット履歴を検索し、回答を生成する"""
    # ユーザの発言をベクトル化してDBに保存
    db.add_texts([query], metadatas=[{"role": "user"}])

    # ベクトル検索で関連する会話履歴を取得
    print("ok")
    docs = db.similarity_search_with_score(query, k=3)  # kは取得する履歴の数

    print(docs)
    # [, Document(metadata={}, page_content='')]
    ctx = "\n".join([doc.page_content for doc, score in docs if score > 0])
    print(ctx)
    rag_chain_with_source = prompt | chat | output_parser

    answer = rag_chain_with_source.invoke({"context": ctx, "question": query})
    print(answer)
    chat_history.add_messages(
        [
            HumanMessage(content=query),
            AIMessage(content=answer),
        ]
    )
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
    # with conn.cursor() as c:
    #    create_tables(c, table_name)
    #    print("table created")
except Exception as e:
    print(f"table err: {e}")
    sys.exit(1)
history = PostgresChatMessageHistory(table_name, session_uuid, sync_connection=conn)


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

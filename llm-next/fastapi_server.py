import sys
import uuid
from typing import Optional

import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query, Request, status
from fastapi.middleware.cors import CORSMiddleware

from llm_next.chat import chat_with_history
from llm_next.db import close_connection, init_database
from llm_next.embeddings import init_embeddings
from llm_next.llm import init_llm


load_dotenv()

# データベースの初期化 (グローバルスコープで行う)
conn = init_database()

# Embeddingsモデルの初期化 (グローバルスコープで行う)
embeddings = init_embeddings(local=False)

# LLMの初期化 (グローバルスコープで行う)
llm = init_llm(local=False)

app = FastAPI()

# CORS設定 (必要に応じて)
allow_origins = ["*"]  # or specific origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.api_route("/chat", methods=["GET", "POST"])
async def chat_endpoint(
    request: Request,
    user_input: str = Query(..., description="ユーザー入力"),
    character_id: int = Query(0, description="キャラID"),
    user_id: int = Query(0, description="ユーザーUUID"),
    user_name: str = Query(None, description="ユーザー名"),
    session_uuid: Optional[str] = Query(None, description="セッションID"),
):
    """チャット履歴付きでLLMと対話します。"""

    if not session_uuid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="session_uuid is required"
        )

    if not session_uuid:
        session_uuid = str(uuid.uuid4())

    try:
        print(user_input)
        # データベース接続を取得 (リクエストごとに取得)
        response = chat_with_history(user_input, user_id, session_uuid, embeddings, llm, conn)
        return {"response": response}  # 辞書形式でレスポンスを返す
    except Exception as e:
        print(f"Error raised: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@app.on_event("shutdown")
def shutdown_event():
    """シャットダウン時にデータベース接続を閉じる"""
    close_connection(conn)


if __name__ == "__main__":
    # コマンドライン引数からポート番号を取得 (オプション)
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    uvicorn.run(app, host="0.0.0.0", port=port)

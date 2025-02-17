import sys

from langchain.schema.output_parser import StrOutputParser
from langchain.schema.runnable import RunnablePassthrough
from langchain_community.vectorstores import PGVector
from langchain_core.prompts import ChatPromptTemplate
from langchain_postgres import PostgresChatMessageHistory

from langchain_core.messages import HumanMessage, SystemMessage, AIMessage


from llm_next.db import DATABASE_URL
from llm_next.prompt import next_gen_prompt

db_dict = {}
history_dict = {}
output_parser = StrOutputParser()


def chat_with_history(
    query: str, session_id: str, session_uuid: str, embeddings, llm, conn
):
    """チャット履歴を検索し、回答を生成する"""
    table_name = f"chat_history_{session_id}"

    if table_name not in db_dict:
        db_dict[table_name] = PGVector(
            collection_name=table_name,
            connection_string=DATABASE_URL,
            embedding_function=embeddings,
        )
    if table_name not in history_dict:
        history_dict[table_name] = PostgresChatMessageHistory(
            table_name, session_uuid, sync_connection=conn
        )
    try:
        PostgresChatMessageHistory.create_tables(conn, table_name)
    except Exception as e:
        print(f"テーブル作成エラー: {e}")
        sys.exit(1)
    db = db_dict[table_name]
    history = history_dict[table_name]

    # ベクトル検索で関連する会話履歴を取得
    docs = db.similarity_search_with_score(query, k=3)  # kは取得する履歴の数
    # [, Document(metadata={}, page_content='')]
    ctx = "\n".join([doc.page_content for doc, score in docs if score > 0])
    print(ctx)
    rag_chain_with_source = next_gen_prompt | llm | output_parser

    answer = rag_chain_with_source.invoke({"context": ctx, "question": query})
    # ユーザの発言をベクトル化してDBに保存
    db.add_texts([query], metadatas=[{"role": "user"}])
    history.add_messages(
        [
            HumanMessage(content=query),
            AIMessage(content=answer),
        ]
    )
    return answer

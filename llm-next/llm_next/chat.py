import sys
import asyncio

from langchain.schema.output_parser import StrOutputParser
from langchain_community.vectorstores import PGVector
from langchain_core.messages import AIMessage, HumanMessage
from langchain_postgres import PostgresChatMessageHistory

from llm_next.db import DATABASE_URL
from llm_next.prompt import next_gen_prompts, emotional_analyzer_prompt


db_dict = {}
history_dict = {}
emotion_dict = {}
output_parser = StrOutputParser()

async def update_sentimental(user_input :str, user_id: int, character_id: int, llm):
    try:
        emotion_score = int(await analyze_emotion(user_input, llm))
    except Exception as E:
        return
    if str(user_id) not in emotion_dict:
        emotion_dict[str(user_id)] = {}
    if str(character_id) not in emotion_dict[str(user_id)]:
        emotion_dict[str(user_id)][str(character_id)] = [5]
    if -100 <= emotion_score and emotion_score <= 100:
        emotion_dict[str(user_id)][str(character_id)].append(emotion_score)
        if len(emotion_dict[str(user_id)][str(character_id)]) > 5:
            emotion_dict[str(user_id)][str(character_id)].pop(0)
        print(f"感情値更新: {emotion_score}")
        return
    else: 
        print(f"感情値範囲外: {emotion_score}")

def get_emotion(user_id: int, character_id: int):
    if not str(user_id) in emotion_dict:
        return 0
    if not str(character_id) in emotion_dict[str(user_id)]:
        return 0
    return sum(emotion_dict[str(user_id)][str(character_id)]) / len(emotion_dict[str(user_id)][str(character_id)])

def chat_with_history(query: str, user_id: str, session_uuid: str, character_id: int, user_name: str,  embeddings, llm, conn):
    """チャット履歴を検索し、回答を生成する"""
    table_name = f"chat_history_{user_id}"
    try: 
        if table_name not in db_dict:
            db_dict[table_name] = PGVector(
                collection_name=table_name,
                connection_string=DATABASE_URL,
                embedding_function=embeddings,
            )
    except Exception as e:
        print(f"ベクトルDB作成エラー: {e}")
    try: 
        if table_name not in history_dict:
            history_dict[table_name] = {}
        if session_uuid not in history_dict[table_name]:
            history_dict[table_name][session_uuid] = PostgresChatMessageHistory(
                table_name, session_uuid, sync_connection=conn
            )
    except Exception as e:
        print(f"履歴テーブル作成エラー: {e}")

    try:
        PostgresChatMessageHistory.create_tables(conn, table_name)
    except Exception as e:
        print(f"psqlテーブル作成エラー: {e}")
        sys.exit(1)
    db = db_dict[table_name]
    history = history_dict[table_name][session_uuid]
    recent = "\n".join([f"{msg.content}" for msg in history.get_messages()][-5:])

    # ベクトル検索で関連する会話履歴を取得
    docs = db.similarity_search_with_score(query, k=3)  # kは取得する履歴の数
    # [, Document(metadata={}, page_content='')]
    ctx = "\n".join([doc.page_content for doc, score in docs if score > 0])
    print(ctx)
    rag_chain_with_source = next_gen_prompts[character_id] | llm | output_parser

    # 感情値を取得
    emotion = 0
    if str(user_id) in emotion_dict:
        if str(character_id) in emotion_dict[str(user_id)]:
            emotion = get_emotion(user_id, character_id)

    print(f"感情値: {emotion}")
    answer = rag_chain_with_source.invoke({
        "context": ctx, 
        "recent": recent, 
        "user_input": query, 
        "emotion_score": emotion
    })
    # ユーザの発言をベクトル化してDBに保存
    db.add_texts([query], metadatas=[{"role": "user"}])
    history.add_messages(
        [
            HumanMessage(content=query),
            AIMessage(content=answer),
        ]
    )
    return answer

async def analyze_emotion(text: str, llm):
    """単一の発話を感情分析し、スコアで返す"""
    chain = emotional_analyzer_prompt | llm | output_parser

    try:
        response = chain.invoke({"text": text})
        score = int(response)
        if -100 <= score <= 100:
            return score
        else:
            print(f"違反スコア{score}")
            return None
    except ValueError:
        print(f"スコア生成失敗: {response}")
        return None


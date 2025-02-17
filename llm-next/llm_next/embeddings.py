# embeddings.py


def init_embeddings(local: bool = False, model_name: str = "intfloat/multilingual-e5-large"):
    """Embeddingsモデルを初期化して返す"""
    # Hugging Face Embeddingsを使う場合
    if local:
        from langchain.embeddings import HuggingFaceEmbeddings

        embeddings = HuggingFaceEmbeddings(model_name=model_name)
    else:
        # Google Generative AI Embeddingsを使う場合
        from langchain_google_genai import GoogleGenerativeAIEmbeddings

        embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
    return embeddings

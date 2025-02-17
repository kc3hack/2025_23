from langchain.callbacks.manager import CallbackManager
from dotenv import load_dotenv
import os

load_dotenv()


def init_llm(
    local: bool = False,
    model_path: str = "../../models/Meta-Llama-3-8B-Instruct-Q4_K_M.gguf",
    model_name: str = "gemini-1.5-flash-001",
):
    """LLMモデルを初期化して返す"""
    if local:
        from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler

        callback_manager = CallbackManager([StreamingStdOutCallbackHandler()])
        from langchain_community.llms.llamacpp import LlamaCpp

        llm = LlamaCpp(
            model_path=model_path,
            n_gpu_layers=25,  # gpuに処理させるlayerの数
            stop=["Question:", "Answer:"],  # 停止文字列
            streaming=True,  # ストリーミング処理を行うか
            callback_manager=callback_manager,
        )
    else:
        GEMINI_API_KEY = os.getenv("GOOGLE_API_KEY", "DEADC0DE")
        from langchain_google_genai import ChatGoogleGenerativeAI

        llm = ChatGoogleGenerativeAI(model=model_name)

    return llm

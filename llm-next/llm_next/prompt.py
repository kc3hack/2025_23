from langchain_core.prompts import ChatPromptTemplate


next_gen_prompt = ChatPromptTemplate.from_template(
    """
    以下のcontextだけに基づいて回答してください。
    {context}
    
    直近の会話:
    {recent}

    質問: 
    {question}
    """
)

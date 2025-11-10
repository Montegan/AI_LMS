from app.services.Moderations import anti_promptInjection
from app.services.chromadab import get_vector_store
from fastapi import HTTPException
from operator import itemgetter
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from app.repository.Rag_data_handler import RagDataHandler


class RagService:
    def __init__(self):
        self.rag_data_handler = RagDataHandler()

    async def rag_endpoint_handler(self,req, llm):
        print(req)
        if not llm:
            raise HTTPException(status_code=500, detail="LLM not initialized")
        # 1. Moderation (using real function)
        moderation_result = await anti_promptInjection(req.get("prompt"))
        if moderation_result == "Y":
            ai_message = "Your input contains potentially malicious content and cannot be processed."
        else:
            # 2. RAG Chain Logic
            system_prompt = """You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. Give a detailed answer. If you don't know the answer, just say you don't know in a respectful manner. The answer should be in language: {language}.
            Context: {context}
            Answer:"""  
            prompt_template = ChatPromptTemplate.from_messages([
                ("system", system_prompt),
                ("user", "{question}")
            ])

            # Use the course ID from the request or default to the persistent collection
            course_id = req.get("courseId", "chroma_db_persistent")
            retriever = get_vector_store(course_id).as_retriever(search_kwargs={"k": 4})

            # Simplified chain for clarity
            rag_chain = (
                {"context": itemgetter("question") | retriever, "question": itemgetter("question"), "language": itemgetter("language")}
                | prompt_template
                | llm
                | StrOutputParser()
            )

            ai_message = await rag_chain.ainvoke({"question": req.get("prompt"), "language": req.get("language")})
            
            # 3. Save to Firebase using service repository architecture.
            # Use courseId if provided in the request
            await self.rag_data_handler.save_message(
                message=ai_message, 
                currentuser=req.get("currentuser"), 
                currentTab=req.get("currentTab"),
                courseId=req.get("courseId")
            )
        return {"ai_message": ai_message}

rag_service = RagService()
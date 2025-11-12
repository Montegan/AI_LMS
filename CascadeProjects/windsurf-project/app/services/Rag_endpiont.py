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

    async def rag_endpoint_handler(self,req,courseId, llm):
        print(req)
        print(courseId)
        if not llm:
            raise HTTPException(status_code=500, detail="LLM not initialized")
        # 1. Moderation (using real function)
        moderation_result = await anti_promptInjection(req.get("prompt"))
        if moderation_result == "Y":
            ai_message = "Your input contains potentially malicious content and cannot be processed."
        else:
            # 2. RAG Chain Logic
            system_prompt = """You are an assistant for question-answering tasks. Use the following pieces of retrieved context only to answer the question. Give a detailed answer. if no context is provided, just say you don't know in a respectful manner. The answer should be in language: {language}.
            Context: {context}
            Answer:"""  
            prompt_template = ChatPromptTemplate.from_messages([
                ("system", system_prompt),
                ("user", "{question}")
            ])

            # Always use the course ID from the request or default to a consistent value
            course_id = courseId
            if not course_id:
                course_id = "default_course"
                print(f"Warning: No courseId provided in request, using default: {course_id}")
            else:
                print(f"Using course ID from request: {course_id}")
                
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
                courseId=course_id
            )
        return {"ai_message": ai_message}

rag_service = RagService()
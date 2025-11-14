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
        try:
            print(f"\n=== RAG PROCESSING STARTED ===")
            print(f"Request: {req}")
            print(f"Received courseId: {courseId}")
            
            # Ensure courseId is never None
            if not courseId or courseId == "None":
                courseId = "default_course"
                print(f"Warning: courseId was None or 'None' string, using default: {courseId}")
                
            if not llm:
                raise HTTPException(status_code=500, detail="LLM not initialized")
                
            # 1. Moderation (using real function)
            print("Starting moderation check...")
            moderation_result = await anti_promptInjection(req.get("prompt"))
            print(f"Moderation result: {moderation_result}")
            
            if moderation_result == "Y":
                ai_message = "Your input contains potentially malicious content and cannot be processed."
                print("Content flagged by moderation")
            else:
                print("Content passed moderation, proceeding with RAG...")
                # 2. RAG Chain Logic
                system_prompt = """You are an assistant for question-answering tasks. Use the following pieces of retrieved context only to answer the question. Give a detailed answer. if no context is provided, just say you don't know in a respectful manner. The answer should be in language: {language}.
                Context: {context}
                Answer:"""  
                prompt_template = ChatPromptTemplate.from_messages([
                    ("system", system_prompt),
                    ("user", "{question}")
                ])

                # Always use the sanitized courseId
                # We've already handled the None case above
                course_id = courseId
                print(f"Using course ID for vector store: {course_id}")
                    
                print("Getting vector store retriever...")
                retriever = get_vector_store(course_id).as_retriever(search_kwargs={"k": 4})

                print("Creating RAG chain...")
                # Simplified chain for clarity
                rag_chain = (
                    {"context": itemgetter("question") | retriever, "question": itemgetter("question"), "language": itemgetter("language")}
                    | prompt_template
                    | llm
                    | StrOutputParser()
                )

                print("Invoking RAG chain...")
                ai_message = await rag_chain.ainvoke({"question": req.get("prompt"), "language": req.get("language")})
                print(f"RAG chain completed. AI message: {ai_message}")
                
            # 3. Save to Firebase using service repository architecture.
            # Use the sanitized courseId
            print(f"Saving AI message to Firestore with courseId: {courseId}")
            await self.rag_data_handler.save_message(
                message=ai_message, 
                currentuser=req.get("currentuser"), 
                currentTab=req.get("currentTab"),
                courseId=courseId  # Use the sanitized courseId directly
            )
            print("Message saved to Firestore successfully")
            print(f"=== RAG PROCESSING COMPLETED ===\n")
            return {"ai_message": ai_message}
            
        except Exception as e:
            print(f"Error in RAG processing: {e}")
            import traceback
            traceback.print_exc()
            # Return a fallback response
            return {"ai_message": "I'm sorry, I encountered an error while processing your request. Please try again."}

rag_service = RagService()
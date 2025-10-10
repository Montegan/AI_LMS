from Moderations import anti_promptInjection
from app.services.chromadab import vector_store
from app.schemas.chatbot import RagRequest
from fastapi import HTTPException
from operator import itemgetter
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from app.repository.Rag_data_handler import RagDataHandler
from app.api.v1.endpoints.deps import get_llm
from app.api.v1.endpoints.deps import get_db
from app.api.v1.endpoints.deps import get_audio_model
from app.api.v1.endpoints.deps import get_mail


class RagService:
    def __init__(self):
        self.rag_data_handler = RagDataHandler()

    async def rag_endpoint_handler(self,req, llm):
        # db = get_db()
        # audio_model = get_audio_model()
        # mail = get_mail()
        print(req)
        if not llm:
            raise HTTPException(status_code=500, detail="LLM not initialized")

        # 1. Moderation (using real function)
        moderation_result = await anti_promptInjection(req.prompt)
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

            retriever = vector_store.as_retriever(search_kwargs={"k": 4})

            # Simplified chain for clarity
            rag_chain = (
                {"context": itemgetter("question") | retriever, "question": itemgetter("question"), "language": itemgetter("language")}
                | prompt_template
                | llm
                | StrOutputParser()
            )

            ai_message = await rag_chain.ainvoke({"question": req.prompt, "language": req.language})
            
            # 3. Save to Firebase using service repository architecture.
            self.rag_data_handler.save_message(ai_message, req.currentuser, req.currentTab)

        # 3. Save to Firebase
        # if db:
        #     try:
        #         doc_ref = (
        #         db.collection("users")
        #           .document(req.currentuser)
        #           .collection("tab_id")
        #           .document(req.currentTab)
        #           .collection("messages")
        #           .document()                # auto-id
        #     )   
        #         doc_ref.set({
        #             "userId": req.currentuser,
        #             "ai_message": ai_message,
        #             "created_at": firestore.SERVER_TIMESTAMP,
        #         })
        #         print(doc_ref)

                
        #         return {"message_id": doc_ref.id, "ai_message": ai_message}
        #     except Exception as e:
        #         raise HTTPException(status_code=500, detail=f"Firebase error: {e}")
        
        return {"ai_message": ai_message, "warning": "Firebase not configured, message not saved."}

rag_service = RagService()
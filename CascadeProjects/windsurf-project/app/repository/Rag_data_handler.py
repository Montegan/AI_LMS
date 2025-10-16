from fastapi import HTTPException
from firebase_admin import firestore
from app.core.firebase_config import firebase_config

class RagDataHandler:
    def __init__(self):
        self.db = firebase_config.get_db()
    
    async def save_message(self, message: str, currentuser: str, currentTab: str):
        try:
            doc_ref = (
                self.db.collection("users")
                .document(currentuser)
                .collection("tab_id")
                .document(currentTab)
                .collection("messages")
                .document()                # auto-id
            )   
            doc_ref.set({
                "userId": currentuser,
                "ai_message": message,
                "created_at": firestore.SERVER_TIMESTAMP,
            })
            return doc_ref.id
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Firebase error: {e}")

    def get_messages(self, currentuser: str, currentTab: str):
        try:
            messages = []
            docs = self.db.collection("users").document(currentuser).collection("tab_id").document(currentTab).collection("messages").get()
            for doc in docs:
                messages.append({"id": doc.id, "message": doc.to_dict()})
            return messages
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Firebase error: {e}")


rag_data_handler = RagDataHandler()
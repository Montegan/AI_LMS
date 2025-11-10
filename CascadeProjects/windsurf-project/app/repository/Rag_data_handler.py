from fastapi import HTTPException
from firebase_admin import firestore
from app.core.firebase_config import firebase_config

class RagDataHandler:
    def __init__(self):
        self.db = firebase_config.get_db()
    
    async def save_message(self, message: str, currentuser: str, currentTab: str, courseId: str = None):
        try:
            # Use the new database structure if courseId is provided
            if courseId:
                doc_ref = (
                    self.db.collection("chat")
                    .document(currentuser)
                    .collection("course")
                    .document(courseId)
                    .collection("tabs")
                    .document(currentTab)
                    .collection("messages")
                    .document()                # auto-id
                )
                doc_ref.set({
                    "userId": currentuser,
                    "courseId": courseId,
                    "ai_message": message,
                    "created_at": firestore.SERVER_TIMESTAMP,
                })
            else:
                # Fall back to old structure if no courseId
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

    def get_messages(self, currentuser: str, currentTab: str, courseId: str = None):
        try:
            messages = []
            
            if courseId:
                # Use new structure with courseId
                docs = self.db.collection("chat").document(currentuser).collection("course").document(courseId).collection("tabs").document(currentTab).collection("messages").get()
            else:
                # Fall back to old structure
                docs = self.db.collection("users").document(currentuser).collection("tab_id").document(currentTab).collection("messages").get()
                
            for doc in docs:
                messages.append({"id": doc.id, "message": doc.to_dict()})
            return messages
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Firebase error: {e}")


rag_data_handler = RagDataHandler()
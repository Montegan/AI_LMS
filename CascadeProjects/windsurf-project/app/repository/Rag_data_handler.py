from fastapi import HTTPException
from firebase_admin import firestore
from app.core.firebase_config import firebase_config

class RagDataHandler:
    def __init__(self):
        self.db = firebase_config.get_db()
    
    async def save_message(self, message: str, currentuser: str, currentTab: str, courseId: str = "default_course"):
        try:
            # Always use the new database structure
            print(f"Saving message to chat/{currentuser}/course/{courseId}/tabs/{currentTab}/messages")
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
            return doc_ref.id
        except Exception as e:
            print(f"Error saving message: {e}")
            raise HTTPException(status_code=500, detail=f"Firebase error: {e}")

    def get_messages(self, currentuser: str, currentTab: str, courseId: str = "default_course"):
        try:
            messages = []
            print(f"Getting messages from chat/{currentuser}/course/{courseId}/tabs/{currentTab}/messages")
            
            # Always use the new structure
            docs = self.db.collection("chat").document(currentuser).collection("course").document(courseId).collection("tabs").document(currentTab).collection("messages").get()
                
            for doc in docs:
                messages.append({"id": doc.id, "message": doc.to_dict()})
            return messages
        except Exception as e:
            print(f"Error getting messages: {e}")
            raise HTTPException(status_code=500, detail=f"Firebase error: {e}")


rag_data_handler = RagDataHandler()
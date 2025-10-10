from firebase_admin import initialize_app
from firebase_admin import credentials
from firebase_admin import firestore
from app.core.config import settings
import os

# Initialize Firebase
if os.getenv("GOOGLE_APPLICATION_CREDENTIALS"):
    cred = credentials.Certificate(settings.GOOGLE_APPLICATION_CREDENTIALS)
    initialize_app(cred)
    db = firestore.client()
else:
    db = None

def get_db():
    return db

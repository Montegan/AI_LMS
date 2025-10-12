# app/core/firebase_config.py
import os
from pathlib import Path
from firebase_admin import credentials, firestore, initialize_app, _apps
from app.core.config import settings
from dotenv import load_dotenv
load_dotenv()

class FirebaseConfig:
    def __init__(self):
        # Load credentials from .env or settings
        self.credentials_path = (
            settings.GOOGLE_APPLICATION_CREDENTIALS or os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
        )
        self.db = None

    def initialize_app(self):
        """Initialize the Firebase app once and setup Firestore client"""
        if not self.credentials_path:
            raise ValueError("GOOGLE_APPLICATION_CREDENTIALS not set")

        if not _apps:  # prevents re-initializing
            cred = credentials.Certificate(self.credentials_path)
            initialize_app(cred)
            print("✅ Firebase app initialized")

        self.db = firestore.client()
        print("✅ Firestore client created")

    def get_db(self):
        """Return Firestore client (auto-init if needed)"""
        if self.db is None:
            self.initialize_app()
        return self.db

# Singleton instance (import this anywhere)
firebase_config = FirebaseConfig()
firebase_config.initialize_app()
from pydantic_settings import BaseSettings
from typing import List
import os
from dotenv import load_dotenv
load_dotenv()

class Settings(BaseSettings):
    # Project
    PROJECT_NAME: str | None = None
    API_V1_STR: str | None = None
    # CORS
    BACKEND_CORS_ORIGINS: List[str] | None = None
    # OpenAI
    OPENAI_API_KEY: str | None = None
    # Firebase (add your Firebase config here when ready)
    GOOGLE_APPLICATION_CREDENTIALS: str = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    # Email Configuration
    MAIL_SERVER: str | None = None
    MAIL_PORT: int | None = None
    MAIL_USE_TLS: bool | None = None
    MAIL_USE_SSL: bool | None = None
    MAIL_USERNAME: str | None = None
    MAIL_PASSWORD: str | None = None
    MAIL_DEFAULT_SENDER: str | None = None
    # Other configurations
    PODCAST_CERTIFICATE: str | None = None
    NOT_TUNED: str | None = None
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()

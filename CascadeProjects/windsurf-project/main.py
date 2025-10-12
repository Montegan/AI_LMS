from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi_mail import ConnectionConfig
from pydantic import BaseModel
from contextlib import asynccontextmanager
import os
import numpy as np
import whisper
import openai
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv
import warnings
from typing import Dict, Any
import uvicorn
from Classification import service_classification
from app.api.v1.endpoints.ragendpoint import router as ragendpoint
from app.core.firebase_config import firebase_config
from app.api.v1.endpoints.fileupload import router as file_upload_router
from app.api.v1.endpoints.email_endpoint import router as email_endpoint
from app.api.v1.endpoints.voice_endpoint import router as voice_endpoint
# --- Suppress Warnings ---
warnings.filterwarnings("ignore", category=UserWarning)
warnings.filterwarnings("ignore", category=FutureWarning)


# --- Pydantic Models for Request/Response Validation ---


class EmailDraftRequest(BaseModel):
    comment: str
    language: str

class ClassifyRequest(BaseModel):
    text: str

def _safe_delattr(obj, name: str):
    if hasattr(obj, name):
        try:
            delattr(obj, name)
        except Exception:
            pass

# --- Lifespan Event Handler (Startup & Shutdown) ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- Startup Logic ---
    print("INFO:     Starting up application...")
    load_dotenv()

    # Load OpenAI API Key
    openai.api_key = os.getenv("OPENAI_API_KEY")
    if not openai.api_key:
        print("FATAL:    OPENAI_API_KEY not found in .env file. Exiting.")
        # In a real app, you might want to exit or handle this more gracefully
        # For now, we'll let it fail on API calls.

    # Initialize LLM
    app.state.llm= ChatOpenAI()
    # "] = ChatOpenAI()
    print("INFO: ChatOpenAI model initialized.")

    # Load Whisper Model
    try:
        app.state.audio_model= whisper.load_model("base")
        # io_model"] = whisper.load_model("base")
        print("INFO:     Whisper model loaded successfully.")
    except Exception as e:
        print(f"ERROR:    Failed to load Whisper model: {e}")
        app.state.audio_model= None
    # Initialize Firebase
    try:
        app.state.db = firebase_config.get_db()
    except Exception as e:
        print(f"ERROR:    Firebase initialization failed: {e}")
        app.state.db = None

    # Configure Email
    mail_config = ConnectionConfig(
        MAIL_USERNAME=os.getenv("MAIL_USERNAME", ""),
        MAIL_PASSWORD=os.getenv("MAIL_PASSWORD", ""),
        MAIL_FROM=os.getenv("MAIL_DEFAULT_SENDER", ""),
        MAIL_PORT=int(os.getenv("MAIL_PORT", 587)),
        MAIL_SERVER=os.getenv("MAIL_SERVER", ""),
        MAIL_STARTTLS=True,
        MAIL_SSL_TLS=False,
    )
    app.state.mail = mail_config
    print("INFO: Mail service configured.")
    print(mail_config)

    try:
        yield
    finally:
        # --- Shutdown (explicit cleanup; no `clear()`) ---
        print("INFO:     Shutting down application...")

        for key in ("llm", "audio_model", "db", "mail"):
            _safe_delattr(app.state, key)

# --- FastAPI App Initialization ---
app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for simplicity, restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


#################### Final Endpoints ###########################################################

app.include_router(ragendpoint)

app.include_router(file_upload_router)

app.include_router(email_endpoint)

app.include_router(voice_endpoint)

# --- API Endpoints ---

@app.get("/")
async def root():
    return {"message": "Welcome to the FastAPI Backend for your AI App"}

@app.post("/transcribe-audio")
async def transcribe_audio_handler(audio_file: UploadFile = File(...)):
    """
    Receives an audio file from the client, transcribes it, and returns the text.
    The client is responsible for recording the audio.
    """
    audio_model = app.state.audio_model
    if not audio_model:
        raise HTTPException(status_code=500, detail="Audio model not loaded.")

    try:
        # Read the audio file content
        audio_bytes = await audio_file.read()
        
        # Convert bytes to a NumPy array that Whisper can process
        audio_np = np.frombuffer(audio_bytes, np.int16).astype(np.float32) / 32768.0

        # Transcribe
        result = audio_model.transcribe(audio_np, language='english')
        transcription = result.get("text", "").strip()
        
        return {"transcription": transcription}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing audio file: {e}")

@app.post("/classify")
async def classify_handler(req: ClassifyRequest):
    """
    Classifies the user's text into 'table' or 'general'.
    """
    classification = await service_classification(req.text)
    return {"classification": classification}

if __name__ == "__main__":
    # This block is for local debugging and is not used by Uvicorn in production.
    uvicorn.run(app, host="127.0.0.1", port=5000, reload=True)

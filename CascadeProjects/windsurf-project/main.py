from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from pydantic import BaseModel, EmailStr, Field
from contextlib import asynccontextmanager
import os
import torch
import numpy as np
import whisper
import openai
from operator import itemgetter
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from dotenv import load_dotenv
import warnings
import firebase_admin
from firebase_admin import credentials, firestore
from typing import List, Dict, Any
import uvicorn
import magic
# --- Local Imports (assuming these files will be created/migrated) ---
from Moderations import anti_promptInjection
from Classification import service_classification
from chromadab import (
    pdf_embed_documents, web_embed_documents, youtube_embed_documents, 
    vector_store, docs_embed_documents, powerpoint_embed_documents, 
    excel_embed_documents, csv_embed_documents, text_embed_documents
)

# --- Suppress Warnings ---
warnings.filterwarnings("ignore", category=UserWarning)
warnings.filterwarnings("ignore", category=FutureWarning)

# --- Application State --- 
# Use a dictionary to hold application state, managed by the lifespan context.
app_state = {}

# --- Pydantic Models for Request/Response Validation ---
class RagRequest(BaseModel):
    prompt: str
    currentuser: str
    currentTab: str
    language: str

class WebRequest(BaseModel):
    webUrl: str

class EmailDraftRequest(BaseModel):
    comment: str
    language: str

class ClassifyRequest(BaseModel):
    text: str

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
    app_state["llm"] = ChatOpenAI()
    print("INFO:     ChatOpenAI model initialized.")

    # Load Whisper Model
    try:
        app_state["audio_model"] = whisper.load_model("base")
        print("INFO:     Whisper model loaded successfully.")
    except Exception as e:
        print(f"ERROR:    Failed to load Whisper model: {e}")
        app_state["audio_model"] = None

    # Initialize Firebase
    try:
        cred_path = os.getenv("certificates")
        if cred_path and os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
            app_state["db"] = firestore.client()
            print("INFO:     Firebase initialized successfully.")
        else:
            print("WARNING:  Firebase credentials not found. Firebase features will be disabled.")
            app_state["db"] = None
    except Exception as e:
        print(f"ERROR:    Firebase initialization failed: {e}")
        app_state["db"] = None

    # Configure Email
    mail_config = ConnectionConfig(
        MAIL_USERNAME=os.getenv("appMAIL_USERNAME", ""),
        MAIL_PASSWORD=os.getenv("appMAIL_PASSWORD", ""),
        MAIL_FROM=os.getenv("appMAIL_DEFAULT_SENDER", ""),
        MAIL_PORT=int(os.getenv("appMAIL_PORT", 587)),
        MAIL_SERVER=os.getenv("appMAIL_SERVER", ""),
        MAIL_STARTTLS=True,
        MAIL_SSL_TLS=False,
    )
    app_state["mail"] = FastMail(mail_config)
    print("INFO:     Mail service configured.")

    yield

    # --- Shutdown Logic ---
    print("INFO:     Shutting down application...")
    app_state.clear()

# --- FastAPI App Initialization ---
app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for simplicity, restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Mock Functions (to be replaced by actual implementations) ---
# These are placeholders until the logic is moved to separate files.

async def compose_email(draft: str, language: str) -> Dict[str, str]:
    # Mock email composition
    return {
        "subject": f"AI Subject for: {draft[:20]}...",
        "body": f"This is an AI-generated email in {language} about: {draft}"
    }

# --- API Endpoints ---

@app.get("/")
async def root():
    return {"message": "Welcome to the FastAPI Backend for your AI App"}

@app.post("/ragEndpoint")
async def rag_endpoint_handler(req: RagRequest):
    db = app_state.get("db")
    llm = app_state.get("llm")

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

    # 3. Save to Firebase
    if db:
        try:
            doc_ref = db.collection("users", req.currentuser, "tab_id", req.currentTab, "messages").document()
            doc_ref.set({
                "userId": req.currentuser,
                "ai_message": ai_message,
                "created_at": firestore.SERVER_TIMESTAMP,
            })
            return {"message_id": doc_ref.id, "ai_message": ai_message}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Firebase error: {e}")
    
    return {"ai_message": ai_message, "warning": "Firebase not configured, message not saved."}


@app.post("/load_db")
async def load_document_handler(file: UploadFile = File(...)):
    """
    Receives a file, detects its type using python-magic, and processes it for RAG.
    """
    # Read the initial part of the file to detect MIME type without loading everything into memory
    try:
        file_content = await file.read()
        await file.seek(0) # Reset file pointer in case it's needed again
        
        # Use python-magic to detect the file type from its content
        mime = magic.Magic(mime=True)
        file_type = mime.from_buffer(file_content)
        print(f"INFO:     Detected file '{file.filename}' as type: {file_type}")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not read or identify file: {e}")

    # Route the file to the appropriate embedding function based on its detected type
    if 'pdf' in file_type:
        message = await pdf_embed_documents(file)
    elif 'msword' in file_type or 'officedocument.wordprocessingml' in file_type:
        message = await docs_embed_documents(file)
    elif 'officedocument.presentationml' in file_type:
        message = await powerpoint_embed_documents(file)
    elif 'officedocument.spreadsheetml' in file_type:
        message = await excel_embed_documents(file)
    elif 'csv' in file_type:
        message = await csv_embed_documents(file)
    elif 'text/plain' in file_type:
        message = await text_embed_documents(file)
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: '{file_type}' for file '{file.filename}'")

    return {"message": message}

@app.post("/composeEmail")
async def create_email_handler(req: EmailDraftRequest):
    # Using mock function
    email_content = await compose_email(req.comment, req.language)
    return email_content

@app.post("/sendmail")
async def send_email_handler(
    final_email: str = Form(...),
    subject: str = Form(...),
    reciver: EmailStr = Form(...),
    file: UploadFile = File(None) # File is optional
):
    mail_service = app_state.get("mail")
    if not mail_service:
        raise HTTPException(status_code=500, detail="Mail service not configured.")

    default_signature = "\n\nBest regards,\nYour App"
    body_with_signature = f"{final_email}{default_signature}"

    message = MessageSchema(
        subject=subject,
        recipients=[reciver],
        body=body_with_signature,
        subtype="html"
    )

    if file:
        message.attachment = [file]

    try:
        await mail_service.send_message(message)
        return {"message": "Email sent successfully!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send email: {e}")

@app.post("/transcribe-audio")
async def transcribe_audio_handler(audio_file: UploadFile = File(...)):
    """
    Receives an audio file from the client, transcribes it, and returns the text.
    The client is responsible for recording the audio.
    """
    audio_model = app_state.get("audio_model")
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

@app.post("/load_web")
async def load_web_handler(req: WebRequest):
    """
    Receives a web URL and processes it for RAG.
    """
    message = await web_embed_documents(req.webUrl)
    return {"message": message}

@app.post("/load_youtube")
async def load_youtube_handler(req: WebRequest):
    """
    Receives a YouTube URL and processes it for RAG.
    """
    message = await youtube_embed_documents(req.webUrl)
    return {"message": message}

if __name__ == "__main__":
    # This block is for local debugging and is not used by Uvicorn in production.
    uvicorn.run(app, host="127.0.0.1", port=5000)

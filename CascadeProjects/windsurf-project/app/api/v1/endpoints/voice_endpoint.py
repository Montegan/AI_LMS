from fastapi import APIRouter,Depends
from app.services.Voice_assistant_service import voice_main
from app.schemas.voice_schema import VoiceRequest
from app.api.v1.endpoints.deps import get_llm,get_audio_model
from langchain_openai import ChatOpenAI

router = APIRouter()

@router.post("/voice")
def voice_endpoint(request: VoiceRequest, llm: ChatOpenAI = Depends(get_llm),audio_model = Depends(get_audio_model)):
    voice_main(request.clicked, llm, audio_model)
    return {"message": "Voice assistant started"}

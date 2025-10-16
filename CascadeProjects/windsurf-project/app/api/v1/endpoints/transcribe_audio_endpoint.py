from fastapi import APIRouter,Depends
from app.schemas.transcribe_audio_schema import TranscribeAudioSchema
from app.api.v1.endpoints.deps import get_audio_model,get_llm
from app.services.transcribe_audio_service import transcribe_audio_service
router = APIRouter()

@router.post("/transcribe_audio")
async def transcribe_audio_endpoint(req:TranscribeAudioSchema,audio_model=Depends(get_audio_model),llm=Depends(get_llm)):
    return await transcribe_audio_service.process_audio(req.model_dump(),audio_model, llm)

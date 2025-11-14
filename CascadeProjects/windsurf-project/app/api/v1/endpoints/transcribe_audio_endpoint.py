from fastapi import APIRouter, Depends
from app.schemas.transcribe_audio_schema import TranscribeAudioSchema
from app.api.v1.endpoints.deps import get_audio_model, get_llm
from app.services.transcribe_audio_service import transcribe_audio_service
router = APIRouter()

# Legacy endpoint for backward compatibility
@router.post("/transcribe_audio/{courseId}")
async def transcribe_audio_endpoint(req:TranscribeAudioSchema, courseId: str, audio_model=Depends(get_audio_model), llm=Depends(get_llm)):
    return await transcribe_audio_service.process_audio(req.model_dump(), courseId, audio_model, llm)

# New endpoints for start/stop recording
@router.post("/start_recording/{courseId}")
async def start_recording_endpoint(req:TranscribeAudioSchema, courseId: str):
    return await transcribe_audio_service.start_recording_handler(req.model_dump(), courseId)

@router.post("/stop_recording/{courseId}")
async def stop_recording_endpoint(req:TranscribeAudioSchema, courseId: str, audio_model=Depends(get_audio_model), llm=Depends(get_llm)):
    return await transcribe_audio_service.stop_recording_handler(req.model_dump(), courseId, audio_model, llm)

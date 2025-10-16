from fastapi import APIRouter
from app.services.podcaster import google_adui
from app.services.podcaster import audio_player
from pydantic import BaseModel

router = APIRouter()

class PodcastRequest(BaseModel):
    question: str

class PlayerRequest(BaseModel):
    status: bool

@router.post("/podcast")
def podcast_endpoint(req: PodcastRequest):
    return google_adui(req.question) 

@router.post("/player")
def player_endpoint(req: PlayerRequest):
    return audio_player(req.status)


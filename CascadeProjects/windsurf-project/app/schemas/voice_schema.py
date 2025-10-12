from pydantic import BaseModel


class VoiceRequest(BaseModel):
    clicked: bool

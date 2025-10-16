from pydantic import BaseModel

class TranscribeAudioSchema(BaseModel):
    currentuser: str
    currentTab: str
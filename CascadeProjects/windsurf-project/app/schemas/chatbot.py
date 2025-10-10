from pydantic import BaseModel

class RagRequest(BaseModel):
    prompt: str
    currentuser: str
    currentTab: str
    language: str
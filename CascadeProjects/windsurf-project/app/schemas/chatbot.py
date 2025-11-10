from pydantic import BaseModel

class RagRequest(BaseModel):
    prompt: str
    courseId: str
    currentuser: str
    currentTab: str
    language: str
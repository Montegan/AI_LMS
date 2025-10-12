from pydantic import BaseModel  

class EmailDraftRequest(BaseModel):
    comment: str
    language: str
    
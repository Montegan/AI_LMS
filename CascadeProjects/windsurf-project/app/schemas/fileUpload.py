from pydantic import BaseModel
from fastapi import UploadFile, File

# class FileUpload(BaseModel):
#     file: UploadFile = File(...)
#     currentuser: str
#     currentTab: str
    

class WebUpload(BaseModel):
    webUrl: str
    currentuser: str
    currentTab: str
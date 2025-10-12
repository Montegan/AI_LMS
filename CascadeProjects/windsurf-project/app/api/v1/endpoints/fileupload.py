from fastapi import APIRouter, UploadFile, File, Form
from app.services.file_upload import file_upload_service
from app.schemas.fileUpload import WebUpload

router =APIRouter()

@router.post("/load_db")
async def upload_documents(file: UploadFile = File(...), currentuser: str = Form(...), currentTab: str = Form(...)):
    currentuser = ""
    currentTab = ""
    return await file_upload_service.load_document_handler(file)

@router.post("/load_web")
async def upload_web(webUrl: WebUpload):
    webcontent= webUrl.model_dump()
    print(webcontent)
    return await file_upload_service.load_web_handler(webcontent.get("webUrl"))
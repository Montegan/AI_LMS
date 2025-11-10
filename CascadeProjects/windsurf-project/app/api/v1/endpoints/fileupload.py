from fastapi import APIRouter, UploadFile, File, Form
from app.services.file_upload import file_upload_service
from app.schemas.fileUpload import WebUpload

router =APIRouter()

@router.post("/load_db")
async def upload_documents(file: UploadFile = File(...), courseId: str = Form(...), weekNumber: str = Form(...), fileName: str = Form(...), role: str = Form(...), uploadedBy: str = Form(...)):    
    return await file_upload_service.load_document_handler(file,courseId,weekNumber,fileName,role,uploadedBy)

@router.post("/load_web")
async def upload_web(webUrl: WebUpload):
    webcontent= webUrl.model_dump()
    print(webcontent)
    return await file_upload_service.load_web_handler(webcontent.get("webUrl"))
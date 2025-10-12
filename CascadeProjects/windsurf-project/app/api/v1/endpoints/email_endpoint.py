from fastapi import APIRouter, Form, File, UploadFile, Depends
from app.schemas.email_schema import EmailDraftRequest
from app.services.email_service import compose_email, send_email_handler
from pydantic import EmailStr
from app.api.v1.endpoints.deps import get_mail
from fastapi_mail import FastMail
router = APIRouter()

@router.post('/composeEmail')
async def compose_email_handler(req: EmailDraftRequest):
    email_content = await compose_email(req.comment, req.language)
    return email_content

@router.post('/sendmail')
async def send_email_endpoint(
    final_email: str = Form(...),
    subject: str = Form(...),
    reciver: EmailStr = Form(...),
    file: UploadFile | None = File(None),
    mail_service= Depends(get_mail)
):
    return await send_email_handler(final_email, subject, reciver, mail_service, file)
from fastapi import HTTPException
from app.services.chromadab import (
    pdf_embed_documents, docs_embed_documents, powerpoint_embed_documents, 
    excel_embed_documents, csv_embed_documents, text_embed_documents, web_embed_documents, youtube_embed_documents
)
from fastapi import UploadFile, File
import magic
from typing import Dict
from app.schemas.fileUpload import WebUpload

class FileUploadService:
    
    def __init__(self):
        pass

    async def load_document_handler(self,file: UploadFile) -> Dict[str, str]:
        """
        Receives a file, detects its type using python-magic, and processes it for RAG.
        """
        # Read the initial part of the file to detect MIME type without loading everything into memory
        try:
            file_content = await file.read()
            await file.seek(0) # Reset file pointer in case it's needed again
            
            # Use python-magic to detect the file type from its content
            mime = magic.Magic(mime=True)
            file_type = mime.from_buffer(file_content)
            print(f"INFO: Detected file '{file.filename}' as type: {file_type}")

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Could not read or identify file: {e}")

        # Route the file to the appropriate embedding function based on its detected type
        if 'pdf' in file_type:
            message = await pdf_embed_documents(file)
        elif 'msword' in file_type or 'officedocument.wordprocessingml' in file_type:
            message = await docs_embed_documents(file)
        elif 'officedocument.presentationml' in file_type:
            message = await powerpoint_embed_documents(file)
        elif 'officedocument.spreadsheetml' in file_type:
            message = await excel_embed_documents(file)
        elif 'csv' in file_type:
            message = await csv_embed_documents(file)
        elif 'text/plain' in file_type:
            message = await text_embed_documents(file)
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported file type: '{file_type}' for file '{file.filename}'")

        return {"message": message}

    
    async def load_web_handler(self, req):
        """
        Receives a web URL and processes it for RAG.
        """
        message = await web_embed_documents(req)
        return {"message": message}

    async def load_youtube_handler(self, req):
        """
        Receives a YouTube URL and processes it for RAG.
        """
        message = await youtube_embed_documents(req.webUrl)
        return {"message": message}

file_upload_service = FileUploadService()

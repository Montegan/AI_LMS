from app.services.Rag_endpiont import RagService
from fastapi import APIRouter, Depends
from typing import List
from app.schemas.chatbot import RagRequest
from app.api.v1.endpoints.deps import get_llm
from langchain_openai import ChatOpenAI

router = APIRouter()

# Initialize RagService instance from services.
rag_service = RagService()

@router.post("/ragEndpoint/{courseId}")
async def rag_endpoint_handler(req: RagRequest, courseId: str, llm: ChatOpenAI = Depends(get_llm)):
   req_dict = req.model_dump()
   return await rag_service.rag_endpoint_handler(req_dict, courseId, llm)
from fastapi import APIRouter
from pydantic import BaseModel
from app.llm_service import ask_llm

router = APIRouter()

class ChatBody(BaseModel):
    session_id: str
    message: str

@router.post("/chat")
async def chat(body: ChatBody):
    reply = ask_llm(body.session_id, body.message)
    return {"reply": reply}

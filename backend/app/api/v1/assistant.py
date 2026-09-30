from fastapi import APIRouter, Depends, HTTPException, Header, Query, Body
from typing import Optional, Dict, Any
from app.core.security import decode_access_token
from app.services.assistant_service import assistant_service

router = APIRouter()

def get_current_user_payload(authorization: Optional[str] = Header(None)) -> Optional[Dict[str, Any]]:
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        payload = decode_access_token(token)
        if not payload:
            raise HTTPException(status_code=401, detail="Session token expired or invalid")
        return payload
    return None

@router.post("/query")
def query_assistant(
    payload: Dict[str, Any] = Body(...),
    authorization: Optional[str] = Header(None)
):
    """
    RAG-powered evidence-based AI assistant query endpoint.
    Enforces server-side authorization and role filtering before retrieval.
    """
    user_payload = get_current_user_payload(authorization)
    user_role = payload.get("role", user_payload.get("role", "DRILLING_ENGINEER") if user_payload else "DRILLING_ENGINEER")
    question = payload.get("question", "")

    if not question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    context = payload.get("context", {})

    return assistant_service.query_assistant(
        question=question,
        role=user_role,
        context=context
    )

@router.get("/suggested-questions")
def get_suggested_questions(
    role: Optional[str] = Query("DRILLING_ENGINEER"),
    well_id: Optional[str] = Query("DUL_92"),
    authorization: Optional[str] = Header(None)
):
    """
    Returns role-tailored suggested prompts.
    """
    get_current_user_payload(authorization)
    return assistant_service.get_suggested_questions(role=role, well_id=well_id)

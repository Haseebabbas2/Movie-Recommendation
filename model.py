from pydantic import BaseModel
from typing import List, Optional

class ChatRequest(BaseModel):
    message: str
    location: Optional[str] = "PK"

class Recommendation(BaseModel):
    title: str
    overview: str
    platform: List[str]

class ChatResponse(BaseModel):
    reply: str
    recommendations: List[Recommendation]
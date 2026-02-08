from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from model import ChatRequest, ChatResponse, Recommendation
from chains import invoke_rag
from utils import get_streaming_availability, get_content_availability, COUNTRY_CODES

app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AvailabilityRequest(BaseModel):
    query: str


class ContentResult(BaseModel):
    id: int
    title: str
    overview: str
    type: str
    media_type: str
    release_date: str
    availability: Dict[str, Any]
    available_regions: List[str]
    total_regions: int
    seasons: Optional[List[Dict]] = None
    total_seasons: Optional[int] = None


class AvailabilityResponse(BaseModel):
    results: List[ContentResult]
    total_found: int


@app.get("/countries")
async def get_countries():
    """Get list of supported countries."""
    return {"countries": COUNTRY_CODES}


@app.post("/availability")
async def check_availability(request: AvailabilityRequest):
    """Check movie/TV show availability across regions."""
    result = get_content_availability(request.query)
    
    if "error" in result:
        return {
            "results": [],
            "total_found": 0,
            "error": result["error"]
        }
    
    return result


@app.post("/recommend", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    # 1. Retrieve & Generate with LangChain
    result = invoke_rag(request.message)
    
    # 2. Add Live Streaming Filter
    final_recs = []
    for doc in result["context"]:
        available_on = get_streaming_availability(doc.metadata["tmdb_id"], request.location)
        final_recs.append(Recommendation(
            title=doc.metadata["title"],
            overview=doc.metadata["overview"],
            platform=available_on
        ))

    return ChatResponse(
        reply=result["answer"],
        recommendations=final_recs
    )
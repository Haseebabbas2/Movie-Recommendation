from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.models import ChatRequest, ChatResponse, Recommendation
from app.chains import rag_chain
from app.utils import get_streaming_availability

app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/recommend", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    # 1. Retrieve & Generate with LangChain
    result = rag_chain.invoke({"input": request.message})
    
    # 2. Add Live Streaming Filter
    final_recs = []
    for doc in result["context"]:
        available_on = get_streaming_availability(doc.metadata["tmdb_id"], request.location)
        final_recs.append(Recommendation(
            title=doc.metadata["title"],
            overview=doc.metadata["overview"],
            platforms=available_on
        ))

    return ChatResponse(
        reply=result["answer"],
        recommendations=final_recs
    )
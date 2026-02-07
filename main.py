from fastapi import FastAPI
from app.models import ChatRequest, ChatResponse, Recommendation
from app.chains import rag_chain
from app.utils import get_streaming_availability

app = FastAPI()

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
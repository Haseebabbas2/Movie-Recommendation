import os
import requests
from dotenv import load_dotenv
from langchain_pinecone import PineconeVectorStore
from langchain_huggingface import HuggingFaceEmbeddings

load_dotenv()

def index_movies():
    TMDB_KEY = os.getenv("TMDB_KEY")
    url = f"https://api.themoviedb.org/3/movie/top_rated?api_key={TMDB_KEY}&language=en-US&page=1"
    movies = requests.get(url).json()['results']

    texts = []
    metadatas = []

    for movie in movies:
        content = f"Title: {movie['title']}. Overview: {movie['overview']}"
        texts.append(content)
        metadatas.append({
            "tmdb_id": movie['id'], 
            "title": movie['title'],
            "overview": movie['overview']
        })

    print(f"Loaded {len(texts)} movies from TMDB")

    # Using HuggingFace embeddings (384 dimensions)
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

    print("Creating embeddings and uploading to Pinecone...")
    vectorstore = PineconeVectorStore.from_texts(
        texts,
        embeddings,
        index_name=os.getenv("PINECONE_INDEX"),
        metadatas=metadatas
    )

    print("Ingestion completed! Indexed", len(texts), "movies.")

if __name__ == "__main__":
    index_movies()
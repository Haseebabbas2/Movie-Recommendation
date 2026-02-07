import os;
import requests;
from fastapi import FastAPI
from langchain_pinecone import PineconeVectorStore
from langchain_community.document_loaders import JSONLoader


os.environ["GOOGLE_API_KEY"] =""
os.environ["PINECONE_API_KEY"] =""

def index_movies():
    TMDB_KEY =""
    url = f"https://api.themoviedb.org/3/movie/top_rated?api_key={TMDB_KEY}&language=en-US&page=1"
    movies = requests.get(url).json()['results']

    texts = []
    metadatas = []

    for movie in movies:
        content = f"Title: {movie['title']}. Overview: {movie['overview']}"
        text.append(content)
        metadatas.append({"tmdb_id": movie['id'], "title": movie['title']})


    embeddings = GollgleGenerativeAIEmbeddings(model="models/text-embedding-004")

    vectorstore = PineconeVectorStore.from_texts(
        texts,
        embeddings,
        index_name=os.getenv("PINECONE_INDEX"),
        metadatas=metadatas
    )

    print ("Ingestion completed")

if __name__ == "__main__":
    index_movies()
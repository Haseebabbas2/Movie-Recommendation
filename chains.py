import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_pinecone import PineconeVectorStore
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser

load_dotenv()

# Using HuggingFace embeddings (384 dimensions)
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
vectorstore = PineconeVectorStore(index_name=os.getenv("PINECONE_INDEX"), embedding=embeddings)
llm = ChatGoogleGenerativeAI(model="gemini-3-flash-preview")

prompt = ChatPromptTemplate.from_template("""
You are a helpful movie concierge. Use the provided context to answer the user's request.
Context: {context}
User Question: {input}
""")

retriever = vectorstore.as_retriever(search_kwargs={"k": 3})

def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

# Create the RAG chain
rag_chain = (
    {"context": retriever | format_docs, "input": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)

# Wrapper to match expected output format with context
def invoke_rag(query):
    docs = retriever.invoke(query)
    answer = rag_chain.invoke(query)
    return {"answer": answer, "context": docs}
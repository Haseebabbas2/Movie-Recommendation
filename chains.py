import os
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_pinecone import PineconeVectorStore
from langchain_core.prompts import ChatPromptTemplate
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.chains import create_retrieval_chain

embeddings = GoogleGenerativeAIEmbeddings(model="models/text-embedding-004")
vectorstore = PineconeVectorStore(index_name=os.getenv("PINECONE_INDEX"), embedding=embeddings)
llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash")

prompt = ChatPromptTemplate.from_template("""
You are a helpful movie concierge. Use the provided context to answer the user's request.
Context: {context}
User Question: {input}
""")

combine_docs_chain = create_stuff_documents_chain(llm, prompt)
rag_chain = create_retrieval_chain(vectorstore.as_retriever(search_kwargs={"k": 3}), combine_docs_chain)
import faiss
import numpy as np
import google.generativeai as genai
from fastapi import FastAPI, Query
from sentence_transformers import SentenceTransformer
from database import fetch_volunteers, fetch_events
import os

# Initialize FastAPI
app = FastAPI()

# Load the sentence transformer model (same one used in embeddings.py)
model = SentenceTransformer("all-MiniLM-L6-v2")

# Load FAISS index and IDs
index = faiss.read_index("vectorstore/faiss_index.bin")
ids = np.load("vectorstore/ids.npy", allow_pickle=True)

# Fetch volunteers & events for ID lookup
volunteers = fetch_volunteers()
events = fetch_events()

# Configure Gemini API
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))


def get_gemini_response(query, context):
    """Send query + retrieved context to Gemini API."""
    prompt = f"User Query: {query}\n\nRelevant Information:\n{context}\n\nGenerate a helpful response based on this."
    
    model = genai.GenerativeModel("gemini-1.5-pro-latest")
    response = model.generate_content(prompt)
    
    return response.text if response else "I couldn't generate a response."

def retrieve_info(ids):
    """Retrieve relevant volunteer or event details based on FAISS search results."""
    results = []
    for id in ids:
        for v in volunteers:
            if v["id"] == id:
                results.append(f"Volunteer {v['first_name']} {v['last_name']} with skills {v['skills']} interested in {v['interests']}.")
        for e in events:
            if e["id"] == id:
                results.append(f"Event: {e['title']} ({e['category']}) at {e['location']}.")
    return "\n".join(results)

@app.get("/")
def home():
    return {"message": "Volunteer Chatbot API is running!"}

@app.get("/search/")
def search(query: str = Query(..., description="Search query to find volunteers or events")):
    # Encode query into an embedding
    query_embedding = model.encode([query], convert_to_numpy=True)

    # Perform FAISS search (top 3 matches)
    D, I = index.search(query_embedding, 3)

    # Retrieve matching IDs
    matched_ids = [ids[i] for i in I[0]]

    # Get relevant information from the database
    context = retrieve_info(matched_ids)

    # Get response from Gemini API
    chatbot_response = get_gemini_response(query, context)

    return {
        "query": query,
        "retrieved_context": context,
        "chatbot_response": chatbot_response
    }

# Example query test (Uncomment to test directly in the script)
if __name__ == "__main__":
    example_query = "volunteers for an education event"
    test_response = search(query=example_query)
    print(test_response)

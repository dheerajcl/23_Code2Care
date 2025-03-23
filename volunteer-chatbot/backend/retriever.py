from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import faiss
import numpy as np
import os
from sentence_transformers import SentenceTransformer
from pydantic import BaseModel
import google.generativeai as genai

from database import fetch_volunteers, fetch_events

# Initialize FastAPI
app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load sentence transformer model
model = SentenceTransformer("all-MiniLM-L6-v2")

# Variables to be filled on startup
index = None
ids = None
volunteers = []
events = []

# Configure Gemini API
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

@app.on_event("startup")
def startup_event():
    print("🔄 Updating FAISS index on startup...")
    from faiss_updater import update_faiss_index  # Import locally to prevent circular import
    update_faiss_index()
    print("✅ FAISS index updated.")

    # Reload index and data
    global index, ids, volunteers, events
    index = faiss.read_index("vectorstore/faiss_index.bin")
    ids = np.load("vectorstore/ids.npy", allow_pickle=True)
    volunteers = fetch_volunteers()
    events = fetch_events()
    print(f"📦 Loaded {len(volunteers)} volunteers & {len(events)} events.")

def retrieve_info(matched_ids):
    """Retrieve relevant volunteer or event details."""
    results = []
    for id in matched_ids:
        for v in volunteers:
            if v["id"] == id:
                results.append(
                    f"👤 Volunteer **{v['first_name']} {v['last_name']}**\n"
                    f"   - **Skills:** {', '.join(v['skills'])}\n"
                    f"   - **Interests:** {', '.join(v['interests'])}\n"
                )
        for e in events:
            if e["id"] == id:
                event_link = f"https://samarthanam.vercel.app/volunteer/events/{e['id']}"
                results.append(
                    f"📅 **Event:** [{e['title']}]({event_link})\n"
                    f"   - **Category:** {e['category']}\n"
                    f"   - **Location:** {e['location']}\n"
                )
    return "\n".join(results) if results else "No relevant events found."

def get_gemini_response(query, context):
    print(f"🔍 Query: {query}")
    print(f"📌 Retrieved Context: {context}")

    if not context.strip():
        return "I'm sorry, but I couldn't find any relevant events. Can you provide more details?"

    
    prompt = (
    f"You are an assistant for volunteers and events. "
    f"Use ONLY the following data.\n\n"
    f"Example: 'Here are some upcoming events: 📅 Tech Conference (Technology) happening in San Francisco.'\n\n"
    f"User Query: {query}\n"
    f"Relevant Event Information:\n{context}\n\n"
    f"Reply in this friendly format."
)



    model = genai.GenerativeModel("gemini-1.5-pro-latest")
    response = model.generate_content(prompt)
    return response.text if response else "I couldn't generate a response."

@app.get("/")
def home():
    return {"message": "Volunteer Chatbot API is running!"}

@app.get("/search/")
def search(query: str = Query(..., description="Search query to find volunteers or events")):
    query_embedding = model.encode([query], convert_to_numpy=True)
    D, I = index.search(query_embedding, 3)
    matched_ids = [ids[i] for i in I[0] if i >= 0]

    print(f"🔑 Matched FAISS IDs: {matched_ids}")

    context = retrieve_info(matched_ids)
    chatbot_response = get_gemini_response(query, context)

    return {
        "query": query,
        "retrieved_context": context,
        "chatbot_response": chatbot_response
    }

class ChatRequest(BaseModel):
    messages: list[dict]  # Expecting list of {"user": "text", "bot": "text"}

@app.post("/chat/")
async def chat(request: ChatRequest):
    user_query = request.messages[-1]["user"]
    print(f"🔍 User Query: {user_query}")

    search_response = search(query=user_query)
    chatbot_response = search_response.get("chatbot_response", "I couldn't find relevant events.")

    return {"response": chatbot_response}

# Run server
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)

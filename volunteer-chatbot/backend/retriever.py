from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import faiss
import numpy as np
import os
from sentence_transformers import SentenceTransformer
from pydantic import BaseModel
import google.generativeai as genai

from database import fetch_volunteers, fetch_events, fetch_tasks, fetch_task_assignments

# Initialize FastAPI
app = FastAPI()

# Enable CORS (✅ Fix applied for proper CORS handling)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load sentence transformer model
model = SentenceTransformer("all-MiniLM-L6-v2")

# Globals for FAISS and data
index = None
ids = None
volunteers = []
events = []
tasks = []
assignments = []

# Configure Gemini API
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

@app.on_event("startup")
def startup_event():
    global index, ids, volunteers, events, tasks, assignments

    print("🔄 Updating FAISS index on startup...")
    from faiss_updater import update_faiss_index  # Import locally to avoid circular imports
    update_faiss_index()
    print("✅ FAISS index updated.")

    index = faiss.read_index("vectorstore/faiss_index.bin")
    ids = np.load("vectorstore/ids.npy", allow_pickle=True)

    volunteers = fetch_volunteers()
    events = fetch_events()
    tasks = fetch_tasks()
    assignments = fetch_task_assignments()

    print(f"📦 Loaded {len(volunteers)} volunteers, {len(events)} events, {len(tasks)} tasks, {len(assignments)} task assignments.")

def retrieve_info(matched_ids):
    """Retrieve relevant volunteer, event, task, or assignment details."""
    results = []

    for id in matched_ids:
        id_str = str(id)

        # Volunteers
        for v in volunteers:
            if v["id"] == id:
                results.append(
                    f"👤 **Volunteer:** {v['first_name']} {v['last_name']}\n"
                    f"   - **Email:** {v['email']}\n"
                    f"   - **Phone:** {v['phone']}\n"
                    f"   - **City:** {v['city']}, **State:** {v['state']}\n"
                    f"   - **Skills:** {', '.join(v['skills']) if v['skills'] else 'None'}\n"
                    f"   - **Interests:** {', '.join(v['interests']) if v['interests'] else 'None'}\n"
                    f"   - **Availability:** {v['availability']}\n"
                    f"   - **Experience:** {v['experience']}\n"
                    f"   - **Badges:** {v['badges']}\n"
                    f"   - **Rating:** {v['rating']}\n"
                    f"   - **Bio:** {v['bio']}\n"
                    f"   - **Status:** {v['status']}\n"
                    f"   - **Last Active:** {v['last_active']}\n"
                )


        # Events
        for e in events:
            if e["id"] == id:
                event_link = f"https://samarthanam.vercel.app/volunteer/events/{e['id']}"
                results.append(
                    f"📅 **Event:** [{e['title']}]({event_link})\n"
                    f"   - **Category:** {e['category']}\n"
                    f"   - **Description:** {e['description']}\n"
                    f"   - **Location:** {e['location']}\n"
                    f"   - **Start Date:** {e['start_date']}\n"
                    f"   - **End Date:** {e['end_date']}\n"
                    f"   - **Status:** {e['status']}\n"
                    f"   - **Max Volunteers:** {e['max_volunteers']}\n"
                    f"   - **Organizer ID:** {e['organizer_id']}\n"
                )


        # Tasks
        if id_str.startswith("task_"):
            task_id = id_str.replace("task_", "")
            for t in tasks:
                if t["id"] == task_id:
                    results.append(
                        f"📝 **Task:** {t['title']}\n"
                        f"   - **Description:** {t['description']}\n"
                        f"   - **Skills:** {t['skills']}\n"
                        f"   - **Status:** {t['status']}\n"
                        f"   - **Deadline:** {t['deadline']}\n"
                    )

        # Task Assignments
        if id_str.startswith("assign_"):
            assign_id = id_str.replace("assign_", "")
            for ta in assignments:
                combined_id = f"{ta['volunteer_id']}_{ta['task_id']}"
                if combined_id == assign_id:
                    results.append(
                        f"📌 **Task Assignment:**\n"
                        f"   - Volunteer ID: {ta['volunteer_id']}\n"
                        f"   - Task ID: {ta['task_id']}\n"
                        f"   - Status: {ta['status']}\n"
                        f"   - Response Deadline: {ta['response_deadline'] or 'Not set'}\n"
                    )

    return "\n".join(results) if results else "No relevant info found."

def get_gemini_response(query, context):
    print(f"🔍 Query: {query}")
    print(f"📌 Retrieved Context: {context}")

    if not context.strip():
        return "I'm sorry, but I couldn't find any relevant information. Can you provide more details?"

    prompt = (
    f"You are an assistant for volunteers and events. "
    f"Use ONLY the following data.\n\n"
    f"For volunteers, show detailed info including name, location, skills, interests, availability, experience, badges, rating, and last active time.\n"
    f"For events, show title, category, location, description, dates, status, and max volunteers.\n\n"
    f"User Query: {query}\n"
    f"Relevant Volunteer, Event, Task Information:\n{context}\n\n"
    f"Reply in a friendly, structured, and clear format."
)

    model = genai.GenerativeModel("gemini-1.5-pro-latest")
    response = model.generate_content(prompt)

    return response.text if response else "I couldn't generate a response."

@app.get("/")
def home():
    return {"message": "Volunteer Chatbot API is running!"}

@app.get("/search/")
def search(query: str = Query(..., description="Search query to find tasks, events, or assignments")):
    query_embedding = model.encode([query], convert_to_numpy=True)
    D, I = index.search(query_embedding, 3)
    matched_ids = [ids[i] for i in I[0] if i >= 0]

    print(f"🔑 Matched FAISS IDs: {matched_ids}")

    # 👇 If broad query, inject all events
    if "open" in query.lower() or "more volunteers" in query.lower():
        print("⚠️ Broad query detected, injecting all events")
        all_event_ids = [e["id"] for e in events]
        matched_ids.extend(all_event_ids)

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
    chatbot_response = search_response.get("chatbot_response", "I couldn't find relevant information.")

    return {"response": chatbot_response}

# Run server
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)

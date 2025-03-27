from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import faiss
import numpy as np
import os
from sentence_transformers import SentenceTransformer
from pydantic import BaseModel
import google.generativeai as genai
from dateutil import parser
import calendar
from datetime import datetime
from database import get_assigned_tasks
from database import fetch_volunteers, fetch_events, fetch_tasks, fetch_task_assignments
from database import get_tasks_for_volunteer

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = SentenceTransformer("all-MiniLM-L6-v2")

index = None
ids = None
volunteers = []
events = []
tasks = []
assignments = []

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

@app.on_event("startup")
def startup_event():
    global index, ids, volunteers, events, tasks, assignments

    print("🔄 Updating FAISS index on startup...")
    from faiss_updater import update_faiss_index 
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
                    f"   - **Status:** {v['status']}\n"
                    f"   - **Last Active:** {v['last_active']}\n"
                )


        # Events
        for e in events:
            if e["id"] == id:
                event_link = f"https://samarthanam.vercel.app/volunteer/events/{e['id']}"
                results.append(
                f"### 📅 **Event: {e['title']}**\n"
                f"- **Category:** {e['category']}\n"
                f"- **Location:** {e['location']}\n"
                f"- **Description:** {e['description']}\n"
                f"- **Dates:** 🗓️ {e['start_date']} → {e['end_date']}\n"
                f"- **Status:** ✅ {e['status'].capitalize()}\n"
                f"- **Max Volunteers Needed:** {e['max_volunteers'] or '∞ Unlimited'}\n"
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


def handle_user_query(user_input, volunteer_id):
    if "assigned task" in user_input.lower():
        tasks = get_assigned_tasks(volunteer_id)
        if tasks:
            response = "Here are your assigned tasks:\n"
            for title, description, status in tasks:
                response += f"\nTitle: {title}\nDescription: {description}\nStatus: {status}\n---"
        else:
            response = "You currently have no assigned tasks."
        return response
    



def process_user_query(user_input, volunteer_id):
    if "status of my tasks" in user_input.lower() or "my tasks" in user_input.lower():
        tasks = get_tasks_for_volunteer(volunteer_id)
        if tasks:
            response = "Here are your assigned tasks:\n"
            for task in tasks:
                response += f"- {task.title}: {task.description} (Status: {task.status})\n"
        else:
            response = "You currently have no tasks assigned."
        return response
    else:
        return default_retriever_logic(user_input)

def get_gemini_response(query, context, conversation_history=""):

    print(f"🔍 Query: {query}")
    print(f"📌 Retrieved Context: {context}")

    if not context.strip():
        return "I'm sorry, but I couldn't find any relevant information. Can you provide more details?"

    prompt = (
    f"You are a friendly assistant that helps volunteers find information about events, tasks, and assignments.\n"
    f"Based ONLY on the following data, answer the user's query clearly, conversationally, and in simple human language.\n"
    f"DO NOT include raw JSON or code formatting.\n"
    f"DO NOT repeat irrelevant information.\n"
    f"If no matching data is found, say politely: 'Sorry, no matching events/tasks were found.'\n\n"
    f"---\n"
    f"User Query:\n{query}\n\n"
    f"Available Data:\n{context}\n"
    f"---\n\n"
    f"Give your answer like you're talking to a person."
    f"You are a helpful assistant for volunteers.\n"
    f"Here is the chat history so far:\n{conversation_history}\n\n"
    f"---\n"
    f"User's latest question:\n{query}\n\n"
    f"Relevant Data:\n{context}\n"
    f"---\n\n"
    f"Answer in a friendly, clear way using both history and available data."
    f"don't add **"

)


    model = genai.GenerativeModel("gemini-1.5-pro-latest")
    response = model.generate_content(prompt)

    return response.text if response else "I couldn't generate a response."

@app.get("/")
def home():
    return {"message": "Volunteer Chatbot API is running!"}

@app.get("/search/")
def search(
    query: str = Query(..., description="Search query to find tasks, events, or assignments"),
    conversation_history: str = "",
    volunteer_id: str = None 
):

    query_embedding = model.encode([query], convert_to_numpy=True)
    matched_ids = []

    months = list(calendar.month_name)
    month_in_query = None
    for month in months:
        if month.lower() in query.lower():
            month_in_query = month
            break

    location_keywords = ["bangalojre", "bengaluru", "delhi", "chennai", "mumbai"]  # Expand as needed
    location_in_query = None
    for loc in location_keywords:
        if loc.lower() in query.lower():
            location_in_query = loc.lower()
            break

    status_keywords = ["pending", "completed", "in progress", "review", "done"]
    status_in_query = None
    for status in status_keywords:
        if status.lower() in query.lower():
            status_in_query = status.lower()
            break

    if "task" in query.lower() or "tasks" in query.lower():
        print("🟢 Detected Task Query... Applying filters")
        for t in tasks:
            include = True

            if month_in_query:
                if t['start_time']:
                    task_month = parser.parse(t['start_time']).strftime("%B")
                    if task_month.lower() != month_in_query.lower():
                        include = False

            if location_in_query:
                for e in events:
                    if e['id'] == t['event_id']: 
                        if location_in_query not in e['location'].lower():
                            include = False

            if status_in_query:
                if status_in_query not in t['status'].lower():
                    include = False

            if include:
                matched_ids.append(f"task_{t['id']}")

        print(f"✅ Filtered Task IDs: {matched_ids}")

    elif "event" in query.lower() or month_in_query or location_in_query:
        print("📅 Detected Event Query... Applying filters")

        for e in events:
            include = True

            if month_in_query:
                event_month = parser.parse(e['start_date']).strftime("%B")
                if event_month.lower() != month_in_query.lower():
                    include = False


            if location_in_query:
                if location_in_query not in e['location'].lower():
                    include = False

            if include:
                matched_ids.append(e['id'])

        print(f" Filtered Event IDs: {matched_ids}")

    else:
        D, I = index.search(query_embedding, 3)
        matched_ids = [ids[i] for i in I[0] if i >= 0]
        print(f"🔑 FAISS Matched IDs: {matched_ids}")

    context = retrieve_info(matched_ids)
    chatbot_response = get_gemini_response(query, context, conversation_history)

    return {
        "query": query,
        "retrieved_context": context,
        "chatbot_response": chatbot_response
    }
class ChatRequest(BaseModel):
    messages: list[dict] 

@app.post("/chat/")
async def chat(request: ChatRequest, volunteer_id: str = Query(None)):
    conversation_history = ""
    for msg in request.messages:
        conversation_history += f"User: {msg['user']}\nBot: {msg['bot']}\n"

    latest_user_query = request.messages[-1]["user"]

    search_response = search(query=latest_user_query, volunteer_id=volunteer_id, conversation_history=conversation_history)
    
    chatbot_response = search_response.get("chatbot_response", "I couldn't find relevant information.")

    return {"response": chatbot_response}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)

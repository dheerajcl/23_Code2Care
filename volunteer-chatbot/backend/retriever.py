import os
import sys
import json
import numpy as np
import faiss
from fastapi import FastAPI, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
import google.generativeai as genai
from supabase import create_client
from dotenv import load_dotenv

# Determine the correct path for importing
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Load environment variables
load_dotenv()

# Global variables for lazy loading
model = None
index = None
ids = None
volunteers = []
events = []
tasks = []
assignments = []

# Initialize FastAPI
app = FastAPI()

# Enable CORS with more comprehensive configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins during development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase setup
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Load sentence transformer model
model = SentenceTransformer("all-MiniLM-L6-v2")

# Configure Gemini API
gemini_api_key = os.getenv("GEMINI_API_KEY")
if not gemini_api_key:
    raise ValueError("GEMINI_API_KEY is not set in the environment. Please set it in your .env file.")
genai.configure(api_key=gemini_api_key)

# Global variables
index = None
ids = None
volunteers = []
events = []
tasks = []
assignments = []

def load_models():
    global model, index, ids, volunteers, events, tasks, assignments
    
    # Load sentence transformer model
    model = SentenceTransformer("all-MiniLM-L6-v2")
    
    # Load FAISS index
    index_path = os.path.join(os.path.dirname(__file__), 'vectorstore', 'faiss_index.bin')
    ids_path = os.path.join(os.path.dirname(__file__), 'vectorstore', 'ids.npy')
    
    index = faiss.read_index(index_path)
    ids = np.load(ids_path, allow_pickle=True)
    
    # Fetch data
    volunteers = fetch_volunteers()
    events = fetch_events()
    tasks = fetch_tasks()
    assignments = fetch_task_assignments()
    
    return model, index, ids, volunteers, events, tasks, assignments

# Database fetching functions
def fetch_volunteers():
    try:
        response = supabase.table("volunteer").select("*").execute()
        if not response.data:
            print("No volunteer data retrieved.")
            return []
        return response.data
    except Exception as e:
        print(f"Error fetching volunteers: {e}")
        # Consider more specific exception handling
        if "connection" in str(e).lower():
            print("Network connection issue detected.")
        elif "authentication" in str(e).lower():
            print("Supabase authentication problem.")
        return []

def fetch_events():
    response = supabase.table("event").select("*").execute()
    return response.data if response.data else []

def fetch_tasks():
    response = supabase.table("task").select("*").execute()
    return response.data if response.data else []

def fetch_task_assignments():
    response = supabase.table("task_assignment").select("*").execute()
    return response.data if response.data else []

def get_tasks_for_volunteer(volunteer_id):
    response = supabase.table("task_assignment") \
        .select("status, task(title, description)") \
        .eq("volunteer_id", volunteer_id) \
        .execute()
    if response.data:
        return [{"title": row["task"]["title"], "description": row["task"]["description"], "status": row["status"]} for row in response.data]
    return []

# FAISS index updater
def update_faiss_index():
    global volunteers, events, tasks, assignments
    volunteers = fetch_volunteers()
    events = fetch_events()
    tasks = fetch_tasks()
    assignments = fetch_task_assignments()

    all_data = []
    all_ids = []

    for v in volunteers:
        text = f"Volunteer {v['first_name']} {v['last_name']} with skills {v.get('skills', 'None')} interested in {v.get('interests', 'None')}."
        all_data.append(text)
        all_ids.append(v["id"])

    for e in events:
        text = f"Event: {e['title']} ({e['category']}) at {e['location']}."
        all_data.append(text)
        all_ids.append(e["id"])

    for t in tasks:
        text = f"Task: {t['title']} - {t['description']} (Status: {t['status']})"
        all_data.append(text)
        all_ids.append(f"task_{t['id']}")

    for ta in assignments:
        text = f"Task Assignment - Volunteer ID: {ta['volunteer_id']}, Task ID: {ta['task_id']}, Status: {ta['status']}"
        all_data.append(text)
        all_ids.append(f"assign_{ta['volunteer_id']}_{ta['task_id']}")

    embeddings = model.encode(all_data, convert_to_numpy=True)
    new_index = faiss.IndexFlatL2(embeddings.shape[1])
    new_index.add(embeddings)

    os.makedirs("vectorstore", exist_ok=True)
    faiss.write_index(new_index, "vectorstore/faiss_index.bin")
    np.save("vectorstore/ids.npy", np.array(all_ids))
    print(f"FAISS index updated with {len(all_data)} entries.")

# Startup event
@app.on_event("startup")
def startup_event():
    global index, ids
    update_faiss_index()
    index = faiss.read_index("vectorstore/faiss_index.bin")
    ids = np.load("vectorstore/ids.npy", allow_pickle=True)
    print(f"Loaded data: {len(volunteers)} volunteers, {len(events)} events, {len(tasks)} tasks, {len(assignments)} assignments.")

# Retrieve info
def retrieve_info(matched_ids):
    results = []
    for id in matched_ids:
        id_str = str(id)
        for v in volunteers:
            if v["id"] == id:
                results.append(f"Volunteer: {v['first_name']} {v['last_name']} - Email: {v['email']}, Skills: {v.get('skills', 'None')}")
        for e in events:
            if e["id"] == id:
                results.append(f"Event: {e['title']} ({e['category']}) at {e['location']}, Dates: {e['start_date']} to {e['end_date']}")
        if id_str.startswith("task_"):
            task_id = id_str.replace("task_", "")
            for t in tasks:
                if t["id"] == task_id:
                    results.append(f"Task: {t['title']} - {t['description']} (Status: {t['status']})")
        if id_str.startswith("assign_"):
            assign_id = id_str.replace("assign_", "")
            for ta in assignments:
                if f"{ta['volunteer_id']}_{ta['task_id']}" == assign_id:
                    results.append(f"Assignment: Volunteer {ta['volunteer_id']} to Task {ta['task_id']} (Status: {ta['status']})")
    return "\n".join(results) if results else "No relevant info found."

# Gemini response
def get_gemini_response(query, context, conversation_history=""):
    if not context.strip():
        return "Sorry, I couldn’t find any relevant information."
    prompt = (
        f"You are a friendly assistant for volunteers.\n"
        f"User Query: {query}\n"
        f"Available Data: {context}\n"
        f"Chat History: {conversation_history}\n"
        f"Answer clearly and conversationally based ONLY on the data provided."
    )
    try:
        model = genai.GenerativeModel("gemini-1.5-pro-latest")
        response = model.generate_content(prompt)
        return response.text if response else "I couldn’t generate a response."
    except Exception as e:
        print(f"Gemini API error: {e}")
        return "Sorry, there was an issue with the response generation."

# Endpoints
@app.get("/")
def home():
    return {"message": "Volunteer Chatbot API is running!"}

@app.get("/search/")
def search(query: str = Query(...), conversation_history: str = "", volunteer_id: str = None):
    if "my tasks" in query.lower():
        if volunteer_id:
            tasks = get_tasks_for_volunteer(volunteer_id)
            if tasks:
                return {"response": "Here are your tasks:\n" + "\n".join([f"- {t['title']}: {t['description']} (Status: {t['status']})" for t in tasks])}
            return {"response": "You currently have no tasks assigned."}
        return {"response": "Please provide a volunteer ID to see your tasks."}

    query_embedding = model.encode([query], convert_to_numpy=True)
    D, I = index.search(query_embedding, 3)
    matched_ids = [ids[i] for i in I[0] if i >= 0]
    context = retrieve_info(matched_ids)
    chatbot_response = get_gemini_response(query, context, conversation_history)
    return {"query": query, "retrieved_context": context, "chatbot_response": chatbot_response}

class ChatRequest(BaseModel):
    messages: list[dict]

def process_chat_request(body):
    # Reuse existing chat logic
    messages = body.get('messages', [])
    volunteer_id = body.get('volunteer_id')
    
    # Lazy load models and data
    model, index, ids, volunteers, events, tasks, assignments = load_models()
    
    # Handle 'my tasks' query
    if messages and "my tasks" in messages[-1]['user'].lower():
        if volunteer_id:
            tasks_list = get_tasks_for_volunteer(volunteer_id)
            if tasks_list:
                return {
                    "response": "Here are your tasks:\n" + 
                    "\n".join([f"- {t['title']}: {t['description']} (Status: {t['status']})" for t in tasks_list])
                }
            return {"response": "You currently have no tasks assigned."}
        return {"response": "Please provide a volunteer ID to see your tasks."}
    
    # Regular chat query
    latest_user_query = messages[-1]['user']
    conversation_history = "\n".join([f"User: {m['user']}\nBot: {m['bot']}" for m in messages[:-1]])
    
    # Perform semantic search
    query_embedding = model.encode([latest_user_query], convert_to_numpy=True)
    D, I = index.search(query_embedding, 3)
    matched_ids = [ids[i] for i in I[0] if i >= 0]
    
    # Retrieve context and generate response
    context = retrieve_info(matched_ids, volunteers, events, tasks, assignments)
    chatbot_response = get_gemini_response(latest_user_query, context, conversation_history)
    
    return {
        "response": chatbot_response
    }

# Vercel serverless function handler
def handler(request, response):
    try:
        # Parse the incoming request
        body = json.loads(request.body)
        chat_response = process_chat_request(body)
        return chat_response
    
    except Exception as e:
        print(f"Error in chat handler: {e}")
        return {
            "error": "Internal server error",
            "details": str(e)
        }




@app.options("/chat/")
async def options_chat(request: Request):
    return JSONResponse(
        status_code=200,
        content={"message": "CORS preflight request successful"}
    )

class ChatRequest(BaseModel):
    messages: list[dict]
    volunteer_id: str = None  # Make volunteer_id optional in the request body

@app.post("/chat/")
async def chat(
    request: Request, 
    volunteer_id: str = Query(None)
):
    # Try to get volunteer_id from query params or request body
    if not volunteer_id:
        try:
            body = await request.json()
            volunteer_id = body.get('volunteer_id')
        except Exception:
            pass

    # Fallback error handling
    if not volunteer_id:
        return JSONResponse(
            status_code=400, 
            content={"error": "Volunteer ID is required"}
        )

    try:
        # Parse request body
        body = await request.json()
        messages = body.get('messages', [])

        conversation_history = "\n".join([f"User: {m['user']}\nBot: {m['bot']}" for m in messages[:-1]])
        latest_user_query = messages[-1]['user']

        search_response = search(
            query=latest_user_query, 
            volunteer_id=volunteer_id, 
            conversation_history=conversation_history
        )
        
        return {
            "response": search_response.get("chatbot_response", "I couldn't find relevant information.")
        }
    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        return JSONResponse(
            status_code=500, 
            content={"error": "Internal server error", "details": str(e)}
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
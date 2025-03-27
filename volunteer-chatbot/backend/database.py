import os
from supabase import create_client 
from dotenv import load_dotenv 

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def fetch_volunteers():
    """Fetch all volunteers from the database."""
    response = supabase.table("volunteer").select("*").execute()
    print(f" Volunteers fetched: {len(response.data)}") if response.data else print("⚠️ No volunteers found.")
    return response.data if response.data else []

def fetch_events():
    """Fetch all events from the database."""
    response = supabase.table("event").select("*").execute()
    print(f" Events fetched: {len(response.data)}") if response.data else print("⚠️ No events found.")
    return response.data if response.data else []

def fetch_tasks():
    """Fetch all tasks from the database."""
    response = supabase.table("task").select("*").execute()
    print(f" Tasks fetched: {len(response.data)}") if response.data else print("⚠️ No tasks found.")
    return response.data if response.data else []

def fetch_task_assignments():
    """Fetch all task assignments from the database."""
    response = supabase.table("task_assignment").select("*").execute()
    print(f" Task Assignments fetched: {len(response.data)}") if response.data else print("⚠️ No task assignments found.")
    return response.data if response.data else []

def get_assigned_tasks(volunteer_id):
    query = """
        SELECT 
            task.title, 
            task.description, 
            task_assignment.status 
        FROM 
            task_assignment
        JOIN 
            task 
        ON 
            task_assignment.task_id = task.id
        WHERE 
            task_assignment.volunteer_id = %s
    """
    cursor = connection.cursor() 
    cursor.execute(query, (volunteer_id,))
    rows = cursor.fetchall()
    cursor.close()
    return rows


def get_tasks_for_volunteer(volunteer_id):
    response = supabase.table("task_assignment") \
        .select("status, task(title, description)") \
        .eq("volunteer_id", volunteer_id) \
        .execute()

    if response.data:
        tasks = []
        for row in response.data:
            task_info = {
                "title": row["task"]["title"],
                "description": row["task"]["description"],
                "status": row["status"]
            }
            tasks.append(task_info)
        return tasks
    else:
        return []

def add_event(title, category, location, start_date, end_date):
    """Adds a new event to the database and updates FAISS index."""
    try:
        response = supabase.table("event").insert({
            "title": title,
            "category": category,
            "location": location,
            "start_date": start_date,
            "end_date": end_date
        }).execute()

        if response.data:
            print(f" Event '{title}' added to DB!")

            from faiss_updater import update_faiss_index
            update_faiss_index()
            print(f" FAISS index updated after adding event '{title}'.")
        else:
            print(" Failed to insert event.")

    except Exception as e:
        print(f" Error adding event: {e}")


if __name__ == "__main__":
    fetch_events()
    fetch_volunteers()

import os
from supabase import create_client  # type: ignore
from dotenv import load_dotenv  # type: ignore

# Load environment variables
load_dotenv()

# Supabase credentials
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Initialize Supabase client
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

##############################################
# Volunteer & Event Fetching Functions
##############################################

def fetch_volunteers():
    """Fetch all volunteers from the database."""
    response = supabase.table("volunteer").select("*").execute()
    print(f"✅ Volunteers fetched: {len(response.data)}") if response.data else print("⚠️ No volunteers found.")
    return response.data if response.data else []

def fetch_events():
    """Fetch all events from the database."""
    response = supabase.table("event").select("*").execute()
    print(f"✅ Events fetched: {len(response.data)}") if response.data else print("⚠️ No events found.")
    return response.data if response.data else []

##############################################
# Event Adding Function (FAISS import moved inside)
##############################################

def add_event(title, category, location, start_date, end_date):
    """Adds a new event to the database and updates FAISS index."""
    try:
        # Insert event
        response = supabase.table("event").insert({
            "title": title,
            "category": category,
            "location": location,
            "start_date": start_date,
            "end_date": end_date
        }).execute()

        if response.data:
            print(f"✅ Event '{title}' added to DB!")

            # ✅ Import inside function to prevent circular import
            from faiss_updater import update_faiss_index
            update_faiss_index()
            print(f"✅ FAISS index updated after adding event '{title}'.")
        else:
            print("❌ Failed to insert event.")

    except Exception as e:
        print(f"❌ Error adding event: {e}")

##############################################
# Optional: Test Fetching (when running standalone)
##############################################

if __name__ == "__main__":
    fetch_events()
    fetch_volunteers()

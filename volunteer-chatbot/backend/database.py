import os
from supabase import create_client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Supabase credentials
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Initialize Supabase client
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def fetch_volunteers():
    """Fetch all volunteers from the database."""
    response = supabase.table("volunteer").select("*").execute()
    return response.data

def fetch_events():
    """Fetch all events from the database."""
    response = supabase.table("event").select("*").execute()
    return response.data

if __name__ == "__main__":
    print(fetch_volunteers())  # Test the connection

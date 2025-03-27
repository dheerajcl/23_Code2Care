from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def fetch_volunteers():
    """Fetch all volunteers from the database."""
    response = supabase.table("volunteer").select("*").execute()
    return response.data

def fetch_events():
    """Fetch all events from the database."""
    response = supabase.table("event").select("*").execute()
    return response.data

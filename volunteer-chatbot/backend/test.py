import os
from supabase import create_client
from dotenv import load_dotenv
from database import get_tasks_for_volunteer
# Load .env variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Initialize supabase client
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


if __name__ == "__main__":
    # Fetch a volunteer
    # Fetch volunteer with Priyanka's email
    volunteer_response = supabase.table("volunteer") \
        .select("id, email, first_name") \
        .eq("email", "swetapriya2612@gmail.com") \
        .execute()

    print("✅ Priyanka Volunteer Record:", volunteer_response.data)

    if volunteer_response.data:
        priyanka_id = volunteer_response.data[0]['id']
        print(f"🆔 Priyanka's Volunteer ID: {priyanka_id}")

        # Now fetch tasks assigned to Priyanka
        tasks = get_tasks_for_volunteer(priyanka_id)
        print("📋 Priyanka's Assigned Tasks:", tasks)
    else:
        print("❌ No volunteer found for Priyanka.")


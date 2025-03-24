import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
from database import fetch_events, fetch_volunteers, fetch_tasks, fetch_task_assignments

# Load model
model = SentenceTransformer("all-MiniLM-L6-v2")

def update_faiss_index():
    print("🔄 Updating FAISS index with fresh data...")

    # Fetch data
    volunteers = fetch_volunteers()
    events = fetch_events()
    tasks = fetch_tasks()
    task_assignments = fetch_task_assignments()

    all_data = []
    all_ids = []

    # Volunteers
    for v in volunteers:
        text = (
            f"Volunteer {v['first_name']} {v['last_name']} (Rating: {v['rating']})\n"
            f"Email: {v['email']}, Phone: {v['phone']}\n"
            f"City: {v['city']}, State: {v['state']}\n"
            f"Skills: {v['skills']}, Interests: {v['interests']}\n"
            f"Availability: {v['availability']}, Experience: {v['experience']}\n"
            f"Badges: {v['badges']}, Bio: {v['bio']}\n"
            f"Status: {v['status']}, Last Active: {v['last_active']}\n"
        )
        all_data.append(text)
        all_ids.append(v["id"])


    # Events
    for e in events:
        text = (
            f"Event: {e['title']} ({e['category']})\n"
            f"Description: {e['description']}\n"
            f"Location: {e['location']}\n"
            f"Start: {e['start_date']} End: {e['end_date']}\n"
            f"Status: {e['status']}, Max Volunteers: {e['max_volunteers']}\n"
            f"Organizer ID: {e['organizer_id']}\n"
        )
        all_data.append(text)
        all_ids.append(e["id"])


    # Tasks
    for t in tasks:
        text = (
            f"Task Title: {t['title']} Description: {t['description']} "
            f"Start: {t['start_time']} End: {t['end_time']} Skills: {t['skills']} "
            f"Status: {t['status']} Deadline: {t['deadline']} Max Volunteers: {t['max_volunteers']}"
        )
        all_data.append(text)
        all_ids.append(f"task_{t['id']}")  # Prefix "task_"

    # Task Assignments
    for ta in task_assignments:
        assignment_id = f"{ta['volunteer_id']}_{ta['task_id']}"
        text = (
            f"Task Assignment - Volunteer ID: {ta['volunteer_id']}, Task ID: {ta['task_id']} "
            f"Status: {ta['status']} Response Deadline: {ta['response_deadline']}, Event ID: {ta['event_id']}"
        )
        all_data.append(text)
        all_ids.append(f"assign_{assignment_id}")  # Prefix "assign_"

    # Convert to embeddings
    embeddings = model.encode(all_data, convert_to_numpy=True)

    # Create FAISS index
    new_index = faiss.IndexFlatL2(embeddings.shape[1])
    new_index.add(embeddings)

    # Save index & IDs
    faiss.write_index(new_index, "vectorstore/faiss_index.bin")
    np.save("vectorstore/ids.npy", np.array(all_ids))

    print(f"✅ FAISS index updated! Volunteers: {len(volunteers)}, Events: {len(events)}, Tasks: {len(tasks)}, Assignments: {len(task_assignments)}")

# Run directly
if __name__ == "__main__":
    update_faiss_index()

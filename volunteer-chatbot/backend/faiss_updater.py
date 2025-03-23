import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
from database import fetch_events, fetch_volunteers

# Load the sentence transformer model
model = SentenceTransformer("all-MiniLM-L6-v2")

def update_faiss_index():
    """Fetches latest data and updates the FAISS index dynamically."""
    print("🔄 Updating FAISS index with new data...")

    # Fetch updated volunteers & events
    volunteers = fetch_volunteers()
    events = fetch_events()

    all_data = []
    all_ids = []

    for v in volunteers:
        text = f"Volunteer {v['first_name']} {v['last_name']} with skills {v['skills']} interested in {v['interests']}."
        all_data.append(text)
        all_ids.append(v["id"])

    for e in events:
        text = f"Event: {e['title']} ({e['category']}) at {e['location']}."
        all_data.append(text)
        all_ids.append(e["id"])

    # Convert to embeddings
    embeddings = model.encode(all_data, convert_to_numpy=True)

    # Create new FAISS index
    new_index = faiss.IndexFlatL2(embeddings.shape[1])
    new_index.add(embeddings)

    # Save updated index & IDs
    faiss.write_index(new_index, "vectorstore/faiss_index.bin")
    np.save("vectorstore/ids.npy", np.array(all_ids))

    print("✅ FAISS index updated successfully!")

# Call this function to refresh FAISS index on startup
if __name__ == "__main__":
    update_faiss_index()

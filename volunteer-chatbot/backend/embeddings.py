import faiss 
import os
import numpy as np
from sentence_transformers import SentenceTransformer
from database import fetch_volunteers, fetch_events

model = SentenceTransformer("all-MiniLM-L6-v2")

def generate_embeddings(texts):
    return model.encode(texts, convert_to_numpy=True)

volunteers = fetch_volunteers()
events = fetch_events()

print(f"✅ Fetched {len(volunteers)} volunteers and {len(events)} events.")

data = []
ids = []

for v in volunteers:
    skills = v.get("skills", "None")
    interests = v.get("interests", "None")
    text = f"Volunteer {v.get('first_name', 'Unknown')} {v.get('last_name', 'Unknown')} with skills {skills} interested in {interests}."
    data.append(text)
    ids.append(v["id"])

for e in events:
    title = e.get("title", "Unknown Event")
    category = e.get("category", "Unknown Category")
    location = e.get("location", "Unknown Location")
    text = f"Event: {e['id']} - {title} ({category}) at {location}."
    data.append(text)
    ids.append(e["id"])

embeddings = generate_embeddings(data)

print(f" Embedding shape: {embeddings.shape}")

dimension = embeddings.shape[1]
index = faiss.IndexFlatL2(dimension)
index.add(embeddings)

vectorstore_path = "vectorstore"
if not os.path.exists(vectorstore_path):
    os.makedirs(vectorstore_path)

try:
    faiss.write_index(index, os.path.join(vectorstore_path, "faiss_index.bin"))
    np.save(os.path.join(vectorstore_path, "ids.npy"), ids)
    print("FAISS Index Created & Saved Successfully!")
except Exception as e:
    print(f"Error saving FAISS index: {e}")

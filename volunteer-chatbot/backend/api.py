from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

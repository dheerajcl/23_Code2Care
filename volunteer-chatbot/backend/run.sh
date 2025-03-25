#!/bin/bash
# my app is in main.py and the FastAPI class instance is named 'app'
uvicorn retriever:app --host 0.0.0.0 --port 10000
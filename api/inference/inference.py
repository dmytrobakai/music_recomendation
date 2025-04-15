from fastapi import FastAPI
from google.cloud import storage
import os, pickle, torch
import numpy as np
from recvae_model import RecVAE
from recommender import recommend_for_user

app = FastAPI()

# ----- Змінні середовища -----
BUCKET_NAME = os.environ["GCS_BUCKET"]
MODEL_PREFIX = os.environ.get("MODEL_PREFIX", "results")
MODEL_DIR = "/tmp/model"
MODEL_PATH = f"{MODEL_DIR}/recvae_model.pt"
META_PATH = f"{MODEL_DIR}/recvae_metadata.pkl"

# ----- Завантажити модель із GCS -----
def download_from_gcs(bucket_name, source_blob, destination):
    client = storage.Client()
    bucket = client.bucket(bucket_name)
    blob = bucket.blob(source_blob)
    os.makedirs(os.path.dirname(destination), exist_ok=True)
    blob.download_to_filename(destination)

@app.on_event("startup")
def load_model():
    print("Downloading model from GCS...")
    download_from_gcs(BUCKET_NAME, f"{MODEL_PREFIX}/recvae_model.pt", MODEL_PATH)
    download_from_gcs(BUCKET_NAME, f"{MODEL_PREFIX}/recvae_metadata.pkl", META_PATH)

    global model, metadata
    with open(META_PATH, "rb") as f:
        metadata = pickle.load(f)

    input_dim = len(metadata["track_ids"])
    model_instance = RecVAE(input_dim=input_dim)
    model_instance.load_state_dict(torch.load(MODEL_PATH))
    model_instance.eval()

    model = model_instance  # assign globally
    print("Model loaded.")

@app.get("/recommend")
def recommend(user: str, top_n: int = 10):
    return recommend_for_user(user, metadata, model, top_n)

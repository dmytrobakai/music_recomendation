# recvae_model.py

import torch
import torch.nn as nn
import torch.nn.functional as F
from sqlalchemy.orm import Session
from db_models import User as DBUser, Track
from db_config import SessionLocal
import numpy as np
import pickle
import os
from kfp.v2.dsl import component, pipeline
from kfp.v2 import compiler

class RecVAE(nn.Module):
    def __init__(self, input_dim, hidden_dim=600, latent_dim=200, dropout=0.5):
        super(RecVAE, self).__init__()

        self.encoder = nn.Sequential(
            nn.Linear(input_dim, hidden_dim),
            nn.Tanh(),
            nn.Dropout(dropout),
            nn.Linear(hidden_dim, hidden_dim),
            nn.Tanh(),
            nn.Dropout(dropout)
        )

        self.mu_layer = nn.Linear(hidden_dim, latent_dim)
        self.logvar_layer = nn.Linear(hidden_dim, latent_dim)

        self.decoder = nn.Sequential(
            nn.Linear(latent_dim, hidden_dim),
            nn.Tanh(),
            nn.Dropout(dropout),
            nn.Linear(hidden_dim, input_dim),
        )

    def reparameterize(self, mu, logvar):
        std = torch.exp(0.5 * logvar)
        eps = torch.randn_like(std)
        return mu + eps * std

    def forward(self, x):
        encoded = self.encoder(x)
        mu = self.mu_layer(encoded)
        logvar = self.logvar_layer(encoded)
        z = self.reparameterize(mu, logvar)
        decoded = self.decoder(z)
        return decoded, mu, logvar

    def loss_fn(self, recon_x, x, mu, logvar):
        BCE = F.binary_cross_entropy_with_logits(recon_x, x, reduction='sum')
        KLD = -0.5 * torch.sum(1 + logvar - mu.pow(2) - logvar.exp())
        return BCE + KLD


def get_user_track_matrix(session: Session):
    users = session.query(DBUser).all()
    tracks = session.query(Track).all()

    user_ids = [user.username for user in users]
    track_ids = [track.id for track in tracks]

    user_idx = {u: i for i, u in enumerate(user_ids)}
    track_idx = {t: i for i, t in enumerate(track_ids)}

    matrix = np.zeros((len(users), len(tracks)), dtype=np.float32)
    for user in users:
        for track in user.liked_songs:
            matrix[user_idx[user.username], track_idx[track.id]] = 1.0

    return matrix, user_ids, track_ids


@component(
    base_image="python:3.10",
    packages_to_install=["torch", "sqlalchemy", "numpy", "psycopg2-binary", "python-dotenv", "google-cloud-storage"]
)
def train_recvae_component(database_url: str, output_dir: str):
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    from google.cloud import storage

    engine = create_engine(database_url)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    session = SessionLocal()
    matrix, user_ids, track_ids = get_user_track_matrix(session)
    input_dim = matrix.shape[1]

    model = RecVAE(input_dim)
    optimizer = torch.optim.Adam(model.parameters(), lr=0.001)

    model.train()
    x = torch.tensor(matrix)
    for epoch in range(30):
        optimizer.zero_grad()
        recon_x, mu, logvar = model(x)
        loss = model.loss_fn(recon_x, x, mu, logvar)
        loss.backward()
        optimizer.step()
        print(f"Epoch {epoch + 1}: Loss = {loss.item():.2f}")

    local_model_path = "recvae_model.pt"
    local_meta_path = "recvae_metadata.pkl"

    torch.save(model.state_dict(), local_model_path)
    with open(local_meta_path, "wb") as f:
        pickle.dump({"user_ids": user_ids, "track_ids": track_ids}, f)

    client = storage.Client()
    bucket_name = output_dir.replace("gs://", "").split("/")[0]
    prefix = "/".join(output_dir.replace("gs://", "").split("/")[1:])
    bucket = client.bucket(bucket_name)
    bucket.blob(f"{prefix}/recvae_model.pt").upload_from_filename(local_model_path)
    bucket.blob(f"{prefix}/recvae_metadata.pkl").upload_from_filename(local_meta_path)

    session.close()


@component(
    base_image="python:3.10",
    packages_to_install=["google-cloud-aiplatform"]
)
def deploy_to_vertex_component(project: str, location: str, model_display_name: str, artifact_uri: str, endpoint_display_name: str):
    from google.cloud import aiplatform

    aiplatform.init(project=project, location=location)

    model = aiplatform.Model.upload(
        display_name=model_display_name,
        artifact_uri=artifact_uri,
        serving_container_image_uri="us-docker.pkg.dev/vertex-ai/prediction/pytorch-gpu.1-12:latest",
    )

    endpoints = aiplatform.Endpoint.list(filter=f"display_name={endpoint_display_name}")
    endpoint = endpoints[0] if endpoints else aiplatform.Endpoint.create(display_name=endpoint_display_name)

    model.deploy(endpoint=endpoint, traffic_split={"0": 100})


@pipeline(name="recvae-training-pipeline")
def recvae_pipeline(database_url: str, output_dir: str, project: str, location: str, model_display_name: str, endpoint_display_name: str):
    train_task = train_recvae_component(database_url=database_url, output_dir=output_dir)
    deploy_to_vertex_component(
        project=project,
        location=location,
        model_display_name=model_display_name,
        artifact_uri=output_dir,
        endpoint_display_name=endpoint_display_name
    )


if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv()
    compiler.Compiler().compile(
        pipeline_func=recvae_pipeline,
        package_path="recvae_pipeline.json"
    )

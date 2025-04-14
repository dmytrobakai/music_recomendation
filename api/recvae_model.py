# recvae_model.py

import torch
import torch.nn as nn
import torch.nn.functional as F
from sqlalchemy.orm import Session
from db_models import User as DBUser, Track
from db_config import SessionLocal
import numpy as np
import pickle

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


def train_recvae():
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

    torch.save(model.state_dict(), "recvae_model.pt")
    with open("recvae_metadata.pkl", "wb") as f:
        pickle.dump({"user_ids": user_ids, "track_ids": track_ids}, f)

    session.close()


if __name__ == "__main__":
    train_recvae()

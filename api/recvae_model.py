from kfp.dsl import component, pipeline, Input, Output, Dataset, Model, Artifact
from kfp import compiler
import os
import uuid

@component(
    base_image="python:3.10",
    packages_to_install=["sqlalchemy", "numpy", "psycopg2-binary"]
)
def extract_matrix_component(
    database_url: str,
    matrix_output: Output[Dataset],
    metadata_output: Output[Dataset]
):
    import numpy as np
    import pickle
    import os
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker, relationship, declarative_base
    from sqlalchemy import Column, Integer, String, ForeignKey, Table, Boolean, BigInteger

    Base = declarative_base()

    user_likes = Table(
        'user_likes', Base.metadata,
        Column('username', String, ForeignKey('users.username'), primary_key=True),
        Column('song_id', Integer, ForeignKey('tracks.id'), primary_key=True)
    )

    class User(Base):
        __tablename__ = 'users'
        id = Column(Integer, primary_key=True, autoincrement=True)
        username = Column(String, unique=True, nullable=False)
        liked_songs = relationship('Track', secondary=user_likes, back_populates='liked_by')

    class Artist(Base):
        __tablename__ = 'artists'
        id = Column(Integer, primary_key=True, autoincrement=True)
        name = Column(String, nullable=False)

    class Track(Base):
        __tablename__ = 'tracks'
        id = Column(BigInteger, primary_key=True, autoincrement=False)
        title = Column(String, nullable=False)
        link = Column(String)
        duration = Column(BigInteger)
        preview = Column(String)
        position = Column(BigInteger)
        rank = Column(BigInteger)
        explicit_lyrics = Column(Boolean)
        album_id = Column(BigInteger)
        album_title = Column(String)
        album_cover = Column(String)
        artist_id = Column(BigInteger, ForeignKey('artists.id'))
        liked_by = relationship('User', secondary=user_likes, back_populates='liked_songs')

    engine = create_engine(database_url)
    SessionLocal = sessionmaker(bind=engine)
    session = SessionLocal()

    users = session.query(User).all()
    tracks = session.query(Track).all()

    user_ids = [user.username for user in users]
    track_ids = [track.id for track in tracks]

    user_idx = {u: i for i, u in enumerate(user_ids)}
    track_idx = {t: i for i, t in enumerate(track_ids)}

    matrix = np.zeros((len(users), len(tracks)), dtype=np.float32)
    for user in users:
        for track in user.liked_songs:
            if track.id in track_idx:
                matrix[user_idx[user.username], track_idx[track.id]] = 1.0

    os.makedirs(matrix_output.path, exist_ok=True)
    os.makedirs(metadata_output.path, exist_ok=True)

    np.save(os.path.join(matrix_output.path, "matrix.npy"), matrix)
    with open(os.path.join(metadata_output.path, "meta.pkl"), "wb") as f:
        pickle.dump({"user_ids": user_ids, "track_ids": track_ids}, f)

    session.close()

@component(
    base_image="python:3.10",
    packages_to_install=["torch", "numpy", "pickle5"]
)
def train_model_component(
    matrix_input: Input[Dataset],
    metadata_input: Input[Dataset],
    model_output: Output[Model],
    epochs: int = 30,
    batch_size: int = 64
):
    import numpy as np
    import pickle
    import os
    import torch
    import torch.nn as nn
    import torch.nn.functional as F

    os.makedirs(model_output.path, exist_ok=True)

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

    matrix = np.load(os.path.join(matrix_input.path, "matrix.npy"))
    with open(os.path.join(metadata_input.path, "meta.pkl"), "rb") as f:
        meta = pickle.load(f)

    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    input_dim = matrix.shape[1]
    model = RecVAE(input_dim).to(device)
    optimizer = torch.optim.Adam(model.parameters(), lr=0.001)

    model.train()
    dataset = torch.utils.data.TensorDataset(torch.tensor(matrix, dtype=torch.float32))
    dataloader = torch.utils.data.DataLoader(dataset, batch_size=batch_size, shuffle=True)

    for epoch in range(epochs):
        epoch_loss = 0
        for batch in dataloader:
            x_batch = batch[0].to(device)
            optimizer.zero_grad()
            recon_x, mu, logvar = model(x_batch)
            loss = model.loss_fn(recon_x, x_batch, mu, logvar)
            loss.backward()
            optimizer.step()
            epoch_loss += loss.item()
        print(f"Epoch {epoch+1}: Loss = {epoch_loss:.2f}")

    torch.save(model.state_dict(), os.path.join(model_output.path, "recvae_model.pt"))
    with open(os.path.join(model_output.path, "recvae_metadata.pkl"), "wb") as f:
        pickle.dump(meta, f)

@component(
    base_image="python:3.10",
    packages_to_install=["google-cloud-storage"]
)
def upload_model_component(
    model_path: Input[Model],
    gcp_credentials_json: str,
    output_dir: str
):
    import os
    from google.cloud import storage

    credentials_path = "/tmp/gcp_credentials.json"
    with open(credentials_path, "w") as f:
        f.write(gcp_credentials_json)
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = credentials_path

    client = storage.Client()
    bucket_name = output_dir.replace("gs://", "").split("/")[0]
    prefix = "/".join(output_dir.replace("gs://", "").split("/")[1:])
    bucket = client.bucket(bucket_name)
    bucket.blob(f"{prefix}/recvae_model.pt").upload_from_filename(os.path.join(model_path.path, "recvae_model.pt"))
    bucket.blob(f"{prefix}/recvae_metadata.pkl").upload_from_filename(os.path.join(model_path.path, "recvae_metadata.pkl"))

@component(
    base_image="python:3.10",
    packages_to_install=["google-cloud-run", "google-auth"]
)
def redeploy_music_recom_component(
    gcp_credentials_json: str,
    project_id: str,
    region: str
):
    import os
    from google.cloud import run_v2
    from google.oauth2 import service_account
    from google.cloud.run_v2.types import Service, RevisionTemplate, Container

    # --- Save credentials ---
    credentials_path = "/tmp/credentials.json"
    with open(credentials_path, "w") as f:
        f.write(gcp_credentials_json)

    credentials = service_account.Credentials.from_service_account_file(
        credentials_path,
        scopes=["https://www.googleapis.com/auth/cloud-platform"]
    )

    # --- Cloud Run client ---
    client = run_v2.ServicesClient(credentials=credentials)

    service_name = "music-recom"
    parent = f"projects/{project_id}/locations/{region}"
    full_service_name = f"{parent}/services/{service_name}"

    # --- Construct Cloud Run Service object ---
    service = Service(
        name=full_service_name,
        template=RevisionTemplate(
            containers=[Container(image="us-docker.pkg.dev/music-rate-457008/music/music-recom:latest")]
        ),
        ingress=run_v2.IngressTraffic.INGRESS_TRAFFIC_ALL,
    )

    # --- Update or create service ---
    operation = client.update_service(
        run_v2.UpdateServiceRequest(
            service=service,
            allow_missing=True
        )
    )

    response = operation.result(timeout=300)
    print(f"✅ music-recom Cloud Run service redeployed: {response.uri}")

@pipeline(name="recvae-training-pipeline")
def recvae_pipeline(
    database_url: str,
    gcp_credentials_json: str,
    output_dir: str,
    project_id: str,
    region: str,
):
    extract_op = extract_matrix_component(database_url=database_url)

    train_op = train_model_component(
        matrix_input=extract_op.outputs["matrix_output"],
        metadata_input=extract_op.outputs["metadata_output"]
    )

    upload_op = upload_model_component(
        model_path=train_op.outputs["model_output"],
        gcp_credentials_json=gcp_credentials_json,
        output_dir=output_dir
    )

    redeploy_op = redeploy_music_recom_component(
        gcp_credentials_json=gcp_credentials_json,
        project_id=project_id,
        region=region
    )
    redeploy_op.after(upload_op)

compiler.Compiler().compile(
    pipeline_func=recvae_pipeline,
    package_path="recvae_pipeline.json"
)
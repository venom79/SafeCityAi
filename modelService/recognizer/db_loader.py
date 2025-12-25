import pickle
import os
import numpy as np


def load_embedding_db(path: str):
    if not os.path.exists(path):
        raise FileNotFoundError(f"Embedding DB not found at: {path}")

    with open(path, "rb") as f:
        db = pickle.load(f)

    # Basic validation
    if not isinstance(db, list):
        raise ValueError("Embedding DB must be a list")

    for entry in db:
        if "person_id" not in entry or "embeddings" not in entry:
            raise ValueError("Invalid DB entry structure")

        fixed_embeddings = []

        for emb in entry["embeddings"]:
            # Convert to numpy array
            emb = np.asarray(emb)

            # FIX SHAPE: (1,512) → (512,)
            if emb.ndim == 2 and emb.shape == (1, 512):
                emb = emb.squeeze(0)

            if emb.shape != (512,):
                raise ValueError(f"Invalid embedding shape: {emb.shape}")

            # L2 NORMALIZE
            emb = emb / (np.linalg.norm(emb) + 1e-10)

            fixed_embeddings.append(emb)

        entry["embeddings"] = fixed_embeddings

    print(f"[DB] Loaded {len(db)} identities")
    return db

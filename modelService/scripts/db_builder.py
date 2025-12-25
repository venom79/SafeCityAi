import os
import pickle
import cv2
import numpy as np

from modelService.recognizer.engine import FaceRecognitionEngine

# ───────────── CONFIG ─────────────
DATASET_DIR = "modelService/dataset"
OUTPUT_PATH = "modelService/data/embedding_db.pkl"

MIN_EMB_PER_PERSON = 2    # discard identities with too few samples

# ───────────── MAIN ─────────────
def build_embedding_db():
    engine = FaceRecognitionEngine(load_db=False)

    embedding_db = []

    print(DATASET_DIR)
    for person_id in os.listdir(DATASET_DIR):
        person_path = os.path.join(DATASET_DIR, person_id)

        if not os.path.isdir(person_path):
            continue

        print(f"\n[DB] Processing person: {person_id}")

        person_embeddings = []

        for file in os.listdir(person_path):
            if not file.lower().endswith((".jpg", ".png", ".jpeg")):
                continue

            img_path = os.path.join(person_path, file)
            img = cv2.imread(img_path)

            if img is None:
                print(f"  ⚠️ Failed to read image: {file}")
                continue

            emb = engine.face_to_embedding(img)

            if emb is None:
                print(f"  ⚠️ No face detected: {file}")
                continue

            # emb is (1,512) → store as (512,)
            person_embeddings.append(emb.squeeze(0))
            print(f"  ✔ Added embedding from {file}")

        if len(person_embeddings) >= MIN_EMB_PER_PERSON:
            embedding_db.append({
                "person_id": person_id,
                "embeddings": person_embeddings
            })
            print(f"  ✅ {person_id} accepted ({len(person_embeddings)} embeddings)")
        else:
            print(f"  ❌ {person_id} rejected (only {len(person_embeddings)} embeddings)")

    # SAVE DB
    with open(OUTPUT_PATH, "wb") as f:
        pickle.dump(embedding_db, f)

    print(f"\n[DB] Saved {len(embedding_db)} identities to {OUTPUT_PATH}")


if __name__ == "__main__":
    build_embedding_db()

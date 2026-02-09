from recognizer.db_loader import load_embedding_db
from sklearn.metrics.pairwise import cosine_similarity
import os
import base64
import io
from PIL import Image
import numpy as np
import cv2
import torch
from facenet_pytorch import MTCNN, InceptionResnetV1

# ───────────── CONFIG ─────────────
THRESHOLD = 0.75
POSSIBLE_THRESHOLD = 0.65
MIN_SIMILARITY = 0.55
QUALITY_THRESHOLD = 0.65

MIN_BOX_SIZE = 60
MIN_DET_PROB = 0.90
IOU_THRESHOLD = 0.15

WINDOW = 3
MIN_TOTAL_FRAMES = 3
MIN_RECENT_FRAMES = 2
MAX_SCORES_PER_ID = 10

DEBUG = False


# ───────────── HELPERS ─────────────
def iou(a, b):
    xA, yA = max(a[0], b[0]), max(a[1], b[1])
    xB, yB = min(a[2], b[2]), min(a[3], b[3])
    inter = max(0, xB - xA) * max(0, yB - yA)
    areaA = (a[2] - a[0]) * (a[3] - a[1])
    areaB = (b[2] - b[0]) * (b[3] - b[1])
    union = areaA + areaB - inter
    return inter / union if union > 0 else 0


def center_distance(a, b):
    c1 = ((a[0] + a[2]) / 2, (a[1] + a[3]) / 2)
    c2 = ((b[0] + b[2]) / 2, (b[1] + b[3]) / 2)
    return np.linalg.norm(np.array(c1) - np.array(c2))


def dynamic_dist_threshold(box):
    return (box[2] - box[0]) * 2.0


# ───────────── ENGINE ─────────────
class FaceRecognitionEngine:
    def __init__(self, load_db=True):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"

        self.mtcnn = MTCNN(keep_all=True, device=self.device)
        self.resnet = InceptionResnetV1(
            pretrained="vggface2"
        ).eval().to(self.device)

        self.state = {}

        self.embedding_db = []
        if load_db:
            db_path = os.path.join(
                os.path.dirname(__file__), "..", "data", "embedding_db.pkl"
            )
            self.embedding_db = load_embedding_db(db_path)

    # ───────── IMAGE DECODE ─────────
    def decode_image(self, b64):
        data = base64.b64decode(b64)
        return np.array(Image.open(io.BytesIO(data)).convert("RGB"))

    # ───────── MAIN PIPELINE ─────────
    def process_frame(self, camera_id, frame_id, frame_bgr):

        if camera_id not in self.state:
            self.state[camera_id] = {
                "tracks": {},
                "next_track_id": 0
            }

        cam = self.state[camera_id]
        tracks = cam["tracks"]

        rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
        pil = Image.fromarray(rgb)
        boxes, probs = self.mtcnn.detect(pil)

        results = []

        if boxes is None:
            return results

        for i, box in enumerate(boxes):

            if probs[i] is None or probs[i] < MIN_DET_PROB:
                continue

            x1, y1, x2, y2 = map(int, box)
            if (x2 - x1) < MIN_BOX_SIZE or (y2 - y1) < MIN_BOX_SIZE:
                continue

            # ── TRACK ASSOCIATION ──
            matched = None
            best_dist = float("inf")

            for tid, t in tracks.items():
                ov = iou((x1,y1,x2,y2), t["box"])
                dist = center_distance((x1,y1,x2,y2), t["box"])
                if ov > IOU_THRESHOLD or dist < dynamic_dist_threshold((x1,y1,x2,y2)):
                    if dist < best_dist:
                        best_dist = dist
                        matched = tid

            if matched is None:
                matched = cam["next_track_id"]
                cam["next_track_id"] += 1
                tracks[matched] = {
                    "box": (x1,y1,x2,y2),
                    "scores": {},
                    "identity": None,
                    "last_seen": frame_id
                }

            track = tracks[matched]
            track["box"] = (x1,y1,x2,y2)
            track["last_seen"] = frame_id

            # # ── LOCKED IDENTITY ──
            if track["identity"] is not None:
                results.append({
                    "track_id": matched,
                    "status": "CONFIRMED",
                    "person_id": track["identity"],
                    "confidence": round(track.get("confidence",0.0),4),
                    "bbox": [x1,y1,x2,y2]
                })
                continue

            # ── FACE EMBEDDING ──
            face = self.crop_face(frame_bgr, (x1,y1,x2,y2))
            if face is None:
                continue

            query_emb = self.face_to_embedding(face)
            if query_emb is None:
                continue

            pid, score = self.match_embedding(query_emb)

            if score < MIN_SIMILARITY:
                results.append({
                    "track_id": matched,
                    "status": "UNKNOWN",
                    "person_id": None,
                    "confidence": 0.0,
                    "bbox": [x1,y1,x2,y2]
                })
                continue

            # ── ACCUMULATE ──
            track["scores"].setdefault(pid, []).append(score)
            track["scores"][pid] = track["scores"][pid][-MAX_SCORES_PER_ID:]

            usable = [s for s in track["scores"][pid] if s >= QUALITY_THRESHOLD]

            status = "UNKNOWN"
            confidence = 0.0
            person_id = None

            if len(usable) >= MIN_TOTAL_FRAMES:
                global_avg = np.mean(usable)
                recent = usable[-WINDOW:]
                recent_avg = np.mean(recent) if len(recent) >= MIN_RECENT_FRAMES else 0
                final = max(global_avg, recent_avg)

                if final >= THRESHOLD:
                    status = "CONFIRMED"
                    track["identity"] = pid
                    track["confidence"] = final
                    person_id = pid
                    confidence = final

                elif final >= POSSIBLE_THRESHOLD:
                    status = "POSSIBLE"
                    person_id = pid
                    confidence = final

            results.append({
                "track_id": matched,
                "status": status,
                "person_id": person_id,
                "confidence": round(confidence, 4),
                "bbox": [x1,y1,x2,y2]
            })

        return results

    # ───────── HELPERS ─────────
    def crop_face(self, frame, box):
        x1,y1,x2,y2 = map(int, box)
        h,w,_ = frame.shape
        x1,y1 = max(0,x1), max(0,y1)
        x2,y2 = min(w,x2), min(h,y2)
        face = frame[y1:y2, x1:x2]
        return face if face.size > 0 else None

    def face_to_embedding(self, face):
        rgb = cv2.cvtColor(face, cv2.COLOR_BGR2RGB)
        pil = Image.fromarray(rgb)
        tensor = self.mtcnn(pil)
        if tensor is None:
            return None
        if tensor.dim() == 3:
            tensor = tensor.unsqueeze(0)
        tensor = tensor.to(self.device)
        with torch.no_grad():
            emb = self.resnet(tensor).cpu().numpy()
        return emb / (np.linalg.norm(emb, axis=1, keepdims=True) + 1e-10)

    def match_embedding(self, query):
        best_pid, best_score = None, -1.0
        for entry in self.embedding_db:
            for ref in entry["embeddings"]:
                score = cosine_similarity(query, ref[np.newaxis,:])[0][0]
                if score > best_score:
                    best_score = score
                    best_pid = entry["person_id"]
        return best_pid, float(best_score)

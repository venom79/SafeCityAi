import base64
import io
from PIL import Image
import numpy as np
import cv2
import torch
from facenet_pytorch import MTCNN, InceptionResnetV1
import time


MIN_BOX_SIZE = 60
MIN_DET_PROB = 0.90
IOU_THRESHOLD = 0.15


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


class FaceRecognitionEngine:
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"

        self.mtcnn = MTCNN(keep_all=True, device=self.device)
        self.resnet = (
            InceptionResnetV1(pretrained="vggface2")
            .eval()
            .to(self.device)
        )

        self.state = {}
        self.last_embedding_time = {}

    def decode_image(self, b64):
        data = base64.b64decode(b64)
        return np.array(Image.open(io.BytesIO(data)).convert("RGB"))

    def process_frame(self, camera_id, frame_id, frame_bgr):

        if camera_id not in self.state:
            self.state[camera_id] = {
                "tracks": {},
                "next_track_id": 0,
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

            matched = None
            best_dist = float("inf")

            for tid, t in tracks.items():
                ov = iou((x1, y1, x2, y2), t["box"])
                dist = center_distance((x1, y1, x2, y2), t["box"])
                if ov > IOU_THRESHOLD or dist < dynamic_dist_threshold((x1, y1, x2, y2)):
                    if dist < best_dist:
                        best_dist = dist
                        matched = tid

            if matched is None:
                matched = cam["next_track_id"]
                cam["next_track_id"] += 1
                tracks[matched] = {
                    "box": (x1, y1, x2, y2),
                    "last_seen": frame_id
                }

            tracks[matched]["box"] = (x1, y1, x2, y2)
            tracks[matched]["last_seen"] = frame_id

            face = self.crop_face(frame_bgr, (x1, y1, x2, y2))
            if face is None:
                continue
            
            face_b64 = self.encode_face(face)
            if face_b64 is None:
                continue

            now = time.time()

            key = (camera_id, matched)

            if key in self.last_embedding_time:
                if now - self.last_embedding_time[key] < 2:
                    continue

            embedding = self.face_to_embedding(face)

            self.last_embedding_time[key] = now

            if embedding is None:
                continue

            results.append({
                "track_id": matched,
                "bbox": [x1, y1, x2, y2],
                "embedding": embedding.tolist(),
                "face_image": face_b64
            })
        # ----------------------------
        # CLEAN OLD TRACKS
        # ----------------------------
        MAX_MISSING_FRAMES = 50

        tracks_to_delete = []

        for tid, t in tracks.items():
            if frame_id - t["last_seen"] > MAX_MISSING_FRAMES:
                tracks_to_delete.append(tid)

        for tid in tracks_to_delete:
            del tracks[tid]

            key = (camera_id, tid)
            if key in self.last_embedding_time:
                del self.last_embedding_time[key]

        return results

    def crop_face(self, frame, box):
        x1, y1, x2, y2 = map(int, box)
        h, w, _ = frame.shape
        x1, y1 = max(0, x1), max(0, y1)
        x2, y2 = min(w, x2), min(h, y2)
        face = frame[y1:y2, x1:x2]
        return face if face.size > 0 else None

    def encode_face(self, face):
        success, buffer = cv2.imencode(".jpg", face)
        if not success:
            return None
        return base64.b64encode(buffer).decode("utf-8")

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

        return emb[0] / (np.linalg.norm(emb) + 1e-10)

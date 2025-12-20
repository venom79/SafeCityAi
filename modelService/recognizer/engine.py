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


# ───────────── HELPERS ─────────────
def iou(boxA, boxB):
    xA = max(boxA[0], boxB[0])
    yA = max(boxA[1], boxB[1])
    xB = min(boxA[2], boxB[2])
    yB = min(boxA[3], boxB[3])

    inter = max(0, xB - xA) * max(0, yB - yA)
    areaA = (boxA[2] - boxA[0]) * (boxA[3] - boxA[1])
    areaB = (boxB[2] - boxB[0]) * (boxB[3] - boxB[1])

    union = areaA + areaB - inter
    return inter / union if union > 0 else 0


def center_distance(b1, b2):
    c1 = ((b1[0] + b1[2]) / 2, (b1[1] + b1[3]) / 2)
    c2 = ((b2[0] + b2[2]) / 2, (b2[1] + b2[3]) / 2)
    return np.linalg.norm(np.array(c1) - np.array(c2))


def dynamic_dist_threshold(box):
    return (box[2] - box[0]) * 2.0


# ───────────── ENGINE ─────────────
class FaceRecognitionEngine:
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"

        self.mtcnn = MTCNN(
            keep_all=True,
            device=self.device
        )

        self.resnet = InceptionResnetV1(
            pretrained="vggface2"
        ).eval().to(self.device)

        self.embedding_db = []  # injected later
        self.state = {}         # camera_id -> tracking state

    # -------------------------------
    def decode_image(self, image_base64: str):
        image_bytes = base64.b64decode(image_base64)
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        return np.array(image)

    # -------------------------------
    def process_frame(self, camera_id: str, frame_id: int, frame_bgr: np.ndarray):
        if camera_id not in self.state:
            self.state[camera_id] = {
                "tracks": {},
                "next_track_id": 0
            }

        cam_state = self.state[camera_id]
        tracks = cam_state["tracks"]

        rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
        pil_img = Image.fromarray(rgb)

        boxes, probs = self.mtcnn.detect(pil_img)

        detections = []

        if boxes is None:
            return detections

        for i, box in enumerate(boxes):
            if probs[i] is None or probs[i] < MIN_DET_PROB:
                continue

            x1, y1, x2, y2 = map(int, box)
            bw, bh = x2 - x1, y2 - y1

            if bw < MIN_BOX_SIZE or bh < MIN_BOX_SIZE:
                continue

            # ── Track association ──
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
                matched = cam_state["next_track_id"]
                cam_state["next_track_id"] += 1
                tracks[matched] = {
                    "box": (x1,y1,x2,y2),
                    "scores": {},
                    "last_seen": frame_id
                }
            else:
                tracks[matched]["box"] = (x1,y1,x2,y2)
                tracks[matched]["last_seen"] = frame_id

            # ── Recognition placeholder ──
            # For now: stub confidence
            detections.append({
                "track_id": matched,
                "status": "UNKNOWN",
                "person_id": None,
                "confidence": 0.0,
                "bbox": [x1,y1,x2,y2]
            })

        return detections

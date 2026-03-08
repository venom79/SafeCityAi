from recognizer.engine import FaceRecognitionEngine
from recognizer.embedding_generator import EmbeddingGenerator

import cv2
import time
import base64
import io
from enum import Enum
from typing import List, Optional

import numpy as np
from PIL import Image
from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel

import threading
import requests

app = FastAPI(
    title="SafeCity AI – Model Service",
    version="1.0.0",
    description="Face detection, recognition, and embedding service"
)

# ─────────────────────────────
# In-memory state (temporary)
# ─────────────────────────────
STATE = {
    # camera_id -> tracking state
    # filled later
}

# ─────────────────────────────
# Schemas
# ─────────────────────────────
class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    timestamp: float


class ImageIdentifyRequest(BaseModel):
    camera_id: str
    frame_id: int
    image_base64: str  # base64-encoded image


class Detection(BaseModel):
    track_id: int
    status: str                # UNKNOWN / POSSIBLE / CONFIRMED
    person_id: Optional[str]
    confidence: float
    bbox: List[int]            # [x1, y1, x2, y2]


class ImageIdentifyResponse(BaseModel):
    camera_id: str
    frame_id: int
    detections: List[Detection]


# ─────────────────────────────
# Embedding schemas
# ─────────────────────────────
class ImageType(str, Enum):
    PHOTO = "PHOTO"
    SKETCH = "SKETCH"


class EmbeddingRequest(BaseModel):
    image_base64: str
    image_type: ImageType


class EmbeddingResponse(BaseModel):
    embedding: List[float]
    model_name: str
    model_version: str


# ─────────────────────────────
# Camera Worker 
# ─────────────────────────────
def camera_worker(camera_id: str, rtsp_url: str):

    print(f"[CAMERA] Starting worker for {camera_id}")

    cap = cv2.VideoCapture(rtsp_url, cv2.CAP_FFMPEG)
    cap.set(cv2.CAP_PROP_BUFFERSIZE, 2)

    if not cap.isOpened():
        print("[CAMERA] Failed to open stream")
        return

    PROCESS_EVERY_N_FRAMES = 5  # camera ~25fps → process ~5fps

    frame_count = 0
    frame_id = 0
    fail_count = 0

    engine = app.state.engine

    while True:

        ret, frame = cap.read()

        if not ret:
            fail_count += 1

            if fail_count > 20:
                print("[CAMERA] Reconnecting stream...")
                cap.release()
                time.sleep(2)

                cap = cv2.VideoCapture(rtsp_url, cv2.CAP_FFMPEG)
                cap.set(cv2.CAP_PROP_BUFFERSIZE, 2)

                fail_count = 0

            continue

        fail_count = 0

        frame_count += 1

        # ---- Skip frames but keep consuming stream ----
        if frame_count % PROCESS_EVERY_N_FRAMES != 0:
            continue

        frame_id += 1

        start = time.time()

        detections = engine.process_frame(
            camera_id=camera_id,
            frame_id=frame_id,
            frame_bgr=frame
        )

        if detections:
            try:
                requests.post(
                    "http://localhost:8080/recognitions",
                    json={
                        "camera_id": camera_id,
                        "frame_id": frame_id,
                        "detections": detections
                    },
                    timeout=1
                )
            except Exception:
                pass


# ─────────────────────────────
# Startup hook 
# ─────────────────────────────
@app.on_event("startup")
def startup_event():
    print("[STARTUP] Loading recognition engine...")
    app.state.engine = FaceRecognitionEngine()

    print("[STARTUP] Loading embedding generator...")
    app.state.embedding_generator = EmbeddingGenerator()

    app.state.model_loaded = True

# ─────────────────────────────
# Health endpoint
# ─────────────────────────────
@app.get("/health", response_model=HealthResponse)
def health_check():
    return HealthResponse(
        status="ok",
        model_loaded=getattr(app.state, "model_loaded", False),
        timestamp=time.time()
    )


# ─────────────────────────────
# Image identification (stub)
# ─────────────────────────────
@app.post("/identify/image", response_model=ImageIdentifyResponse)
def identify_image(payload: ImageIdentifyRequest):

    engine = app.state.engine

    frame_rgb = engine.decode_image(payload.image_base64)
    frame_bgr = cv2.cvtColor(frame_rgb, cv2.COLOR_RGB2BGR)

    detections = engine.process_frame(
        camera_id=payload.camera_id,
        frame_id=payload.frame_id,
        frame_bgr=frame_bgr
    )

    return ImageIdentifyResponse(
        camera_id=payload.camera_id,
        frame_id=payload.frame_id,
        detections=detections
    )


# ─────────────────────────────
# Embedding endpoint (PHOTO / SKETCH)
# ─────────────────────────────
@app.post("/embedding", response_model=EmbeddingResponse)
def generate_embedding(payload: EmbeddingRequest):

    generator: EmbeddingGenerator = app.state.embedding_generator

    # Decode base64 image
    try:
        image_bytes = base64.b64decode(payload.image_base64)
        image = Image.open(io.BytesIO(image_bytes))
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid image_base64"
        )

    # Generate embedding
    if payload.image_type == ImageType.PHOTO:
        embedding = generator.photo_to_embedding(image)
        if embedding is None:
            raise HTTPException(
                status_code=400,
                detail="No face detected in photo"
            )
    else:
        embedding = generator.sketch_to_embedding(image)

    return EmbeddingResponse(
        embedding=embedding.tolist(),
        model_name=generator.model_name,
        model_version=generator.model_version
    )

@app.post("/embedding/file", response_model=EmbeddingResponse)
async def generate_embedding_file(
    image: UploadFile = File(...),
    image_type: ImageType = ImageType.PHOTO
):
    generator: EmbeddingGenerator = app.state.embedding_generator

    try:
        contents = await image.read()
        img = Image.open(io.BytesIO(contents))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image file")

    if image_type == ImageType.PHOTO:
        embedding = generator.photo_to_embedding(img)
        if embedding is None:
            raise HTTPException(status_code=400, detail="No face detected")
    else:
        embedding = generator.sketch_to_embedding(img)

    return EmbeddingResponse(
        embedding=embedding.tolist(),
        model_name=generator.model_name,
        model_version=generator.model_version
    )

class StartCameraRequest(BaseModel):
    camera_id: str
    rtsp_url: str


@app.post("/camera/start")
def start_camera(payload: StartCameraRequest):

    thread = threading.Thread(
        target=camera_worker,
        args=(payload.camera_id, payload.rtsp_url),
        daemon=True
    )

    thread.start()

    return {"status": "started"}

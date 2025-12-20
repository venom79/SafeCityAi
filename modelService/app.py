from recognizer.engine import FaceRecognitionEngine
import cv2
import numpy as np
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
import time

app = FastAPI(
    title="SafeCity AI – Model Service",
    version="1.0.0",
    description="Face detection and recognition service"
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
# Startup hook 
# ─────────────────────────────
@app.on_event("startup")
def startup_event():
    print("[STARTUP] Loading recognition engine...")
    app.state.engine = FaceRecognitionEngine()
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
import numpy as np
import torch
from PIL import Image
from facenet_pytorch import MTCNN, InceptionResnetV1


class EmbeddingGenerator:
    """
    Generates 512-D face embeddings for PHOTOS and SKETCHES
    using InceptionResnetV1 (VGGFace2).

    - Photos: face detection via MTCNN
    - Sketches: assumed already face-only (no detection)
    """

    def __init__(self, device: str | None = None):
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")

        # Face detector (ONLY for photos)
        self.mtcnn = MTCNN(
            image_size=160,
            margin=20,
            keep_all=False,
            device=self.device
        )

        # Embedding backbone
        self.model = (
            InceptionResnetV1(pretrained="vggface2")
            .eval()
            .to(self.device)
        )

        self.model_name = "InceptionResnetV1"
        self.model_version = "vggface2"

    # ─────────────────────────────────────────────
    # PHOTO → embedding (face detection required)
    # ─────────────────────────────────────────────
    def photo_to_embedding(self, image: Image.Image) -> np.ndarray | None:
        """
        Generates an embedding from a PHOTO.
        Returns None if no face is detected.
        """
        image = image.convert("RGB")

        face = self.mtcnn(image)
        if face is None:
            return None

        # MTCNN returns (3, 160, 160)
        face = face.unsqueeze(0).to(self.device)

        with torch.no_grad():
            emb = self.model(face).cpu().numpy()

        return self._l2_normalize(emb)[0]

    # ─────────────────────────────────────────────
    # SKETCH → embedding (NO face detection)
    # ─────────────────────────────────────────────
    def sketch_to_embedding(self, image: Image.Image) -> np.ndarray:
        """
        Generates an embedding from a SKETCH.
        Assumes the sketch already contains a face.
        """
        image = image.convert("RGB").resize((160, 160))

        tensor = torch.tensor(
            np.array(image),
            dtype=torch.float32
        ).permute(2, 0, 1) / 255.0

        # Match MTCNN normalization (CRITICAL)
        tensor = (tensor - 0.5) / 0.5

        tensor = tensor.unsqueeze(0).to(self.device)

        with torch.no_grad():
            emb = self.model(tensor).cpu().numpy()

        return self._l2_normalize(emb)[0]

    # ─────────────────────────────────────────────
    # Utility
    # ─────────────────────────────────────────────
    @staticmethod
    def _l2_normalize(x: np.ndarray) -> np.ndarray:
        return x / (np.linalg.norm(x, axis=1, keepdims=True) + 1e-10)

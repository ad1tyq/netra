"""
NETRA-AI Worker — Lesion Detection Service.

Detects and localises lesions (microaneurysms, haemorrhages,
exudates) in fundus images, returning normalised bounding boxes
that power the "visual decision-support aid" on the Diagnostic
Passport.

╔══════════════════════════════════════════════════════════╗
║  STUB MODE: When no detector weights are found, this     ║
║  service returns realistic mock bounding boxes so the    ║
║  frontend overlay and Spring Boot persistence can be     ║
║  integration-tested immediately.                         ║
║                                                          ║
║  ML FRIEND: See model/README.md for integration guide.   ║
╚══════════════════════════════════════════════════════════╝
"""

from __future__ import annotations

import hashlib
import logging
import random
from dataclasses import dataclass
from pathlib import Path

import numpy as np

from app.config import settings
from app.schemas.responses import LesionType

logger = logging.getLogger(__name__)


@dataclass
class DetectedLesion:
    """A single detected lesion."""
    lesion_type: LesionType
    bbox: list[float]       # [x, y, width, height] normalised 0–1
    confidence: float       # 0–1


class LesionDetector:
    """
    Fundus lesion detector.

    Automatically switches between real and stub mode
    based on whether weight files exist.

    ── FOR THE ML FRIEND ──────────────────────────────────────
    To integrate your trained detector:

    1. Save your trained detection model weights as a .pt file.

    2. Place it at: model/weights/detector.pt

    3. Update `_load_real_model()` and `_real_detect()` below
       to match your model architecture.

    4. Ensure your model outputs bounding boxes in
       normalised [x, y, width, height] format where
       (x, y) is the top-left corner and all values
       are in the range [0, 1].

    See model/README.md for full instructions.
    ───────────────────────────────────────────────────────────
    """

    MODEL_NAME = "DR-LesionDet"
    VERSION = "0.1.0-stub"

    # Lesion types the model can detect
    LESION_CLASSES = [
        LesionType.MICROANEURYSM,
        LesionType.HAEMORRHAGE,
        LesionType.EXUDATE,
    ]

    def __init__(self) -> None:
        self.weights_path = settings.detector_weights
        self.stub_mode = True
        self.model = None

        if self.weights_path.exists():
            self._load_real_model()
        else:
            logger.warning(
                "Detector weights not found at '%s' — running in STUB MODE. "
                "See model/README.md to integrate real weights.",
                self.weights_path,
            )

    @property
    def is_loaded(self) -> bool:
        return not self.stub_mode

    def _load_real_model(self) -> None:
        """
        Load the real trained detection model from disk.

        ╔═══════════════════════════════════════════════════╗
        ║  ML FRIEND: Replace this method's body with your  ║
        ║  actual model loading code.                       ║
        ╚═══════════════════════════════════════════════════╝
        """
        try:
            import torch

            # ── REPLACE THIS BLOCK ────────────────────────
            # Example placeholder — replace with your actual
            # detection architecture (YOLOv8, Faster R-CNN,
            # custom head on EfficientNet, etc.)
            self.model = torch.load(
                self.weights_path,
                map_location=torch.device("cpu"),
                weights_only=False,
            )
            if hasattr(self.model, "eval"):
                self.model.eval()
            # ── END REPLACE ───────────────────────────────

            self.stub_mode = False
            self.VERSION = "1.0.0"
            logger.info("Detector model loaded successfully from '%s'", self.weights_path)

        except Exception:
            logger.exception("Failed to load detector weights — falling back to STUB MODE")
            self.stub_mode = True

    def detect(self, image: np.ndarray) -> list[DetectedLesion]:
        """
        Detect lesions in a BGR fundus image.

        Args:
            image: BGR numpy array.

        Returns:
            List of DetectedLesion objects with bounding boxes.
        """
        if self.stub_mode:
            return self._stub_detect(image)
        return self._real_detect(image)

    def _real_detect(self, image: np.ndarray) -> list[DetectedLesion]:
        """
        Run real detection model inference.

        ╔═══════════════════════════════════════════════════╗
        ║  ML FRIEND: Replace this with your actual         ║
        ║  detection inference pipeline.                    ║
        ║                                                   ║
        ║  Input:  BGR numpy array (original resolution)    ║
        ║  Output: list of DetectedLesion with normalised   ║
        ║          bounding boxes [x, y, w, h] in [0, 1].  ║
        ╚═══════════════════════════════════════════════════╝
        """
        import torch
        from app.utils.image_processing import resize_for_model, bgr_to_rgb

        # ── REPLACE THIS BLOCK ────────────────────────────
        # Placeholder: your actual preprocessing + inference
        resized = resize_for_model(image)
        rgb = bgr_to_rgb(resized)

        # Example: model expects [1, 3, H, W] tensor
        tensor = torch.from_numpy(rgb).permute(2, 0, 1).unsqueeze(0).float() / 255.0

        with torch.no_grad():
            raw_output = self.model(tensor)

        # Parse raw_output into DetectedLesion list
        # This depends entirely on your model's output format
        lesions = []
        # ... parse raw_output into lesions ...
        # ── END REPLACE ───────────────────────────────────

        return lesions

    def _stub_detect(self, image: np.ndarray) -> list[DetectedLesion]:
        """
        Generate deterministic mock lesion detections based on image content.

        Produces 0–4 lesions per image with plausible bounding boxes
        positioned in the retinal region (roughly the centre of the image).
        """
        pixel_hash = hashlib.md5(image.tobytes()[:4096]).hexdigest()
        seed = int(pixel_hash[:8], 16)
        rng = random.Random(seed)

        # Number of lesions: weighted toward 1–3
        num_lesions = rng.choices([0, 1, 2, 3, 4], weights=[10, 30, 30, 20, 10])[0]

        lesions: list[DetectedLesion] = []
        for _ in range(num_lesions):
            lesion_type = rng.choice(self.LESION_CLASSES)

            # Position lesions in the central retinal area (0.2–0.8 range)
            x = round(rng.uniform(0.2, 0.7), 2)
            y = round(rng.uniform(0.2, 0.7), 2)

            # Size varies by lesion type
            if lesion_type == LesionType.MICROANEURYSM:
                w = round(rng.uniform(0.02, 0.05), 2)
                h = round(rng.uniform(0.02, 0.05), 2)
            elif lesion_type == LesionType.HAEMORRHAGE:
                w = round(rng.uniform(0.05, 0.12), 2)
                h = round(rng.uniform(0.04, 0.10), 2)
            else:  # EXUDATE
                w = round(rng.uniform(0.03, 0.08), 2)
                h = round(rng.uniform(0.03, 0.08), 2)

            confidence = round(rng.uniform(0.60, 0.97), 2)

            lesions.append(DetectedLesion(
                lesion_type=lesion_type,
                bbox=[x, y, w, h],
                confidence=confidence,
            ))

        logger.debug("STUB detect: %d lesions generated", len(lesions))
        return lesions

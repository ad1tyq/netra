"""
NETRA-AI Worker — DR Classification Service.

Grades a fundus image on the APTOS 0–4 scale and returns
a continuous referable-probability score.

Architecture: EfficientNet-B0 (pre-trained on ImageNet, fine-tuned
on APTOS/EyePACS).

╔══════════════════════════════════════════════════════════╗
║  STUB MODE: When no model weights are found at the      ║
║  configured path, this service returns realistic mock    ║
║  predictions so the full pipeline can be integration-    ║
║  tested before the ML friend delivers weights.           ║
║                                                          ║
║  ML FRIEND: See model/README.md for instructions on      ║
║  how to plug in your trained model.                      ║
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
from app.utils.image_processing import resize_for_model, bgr_to_rgb, normalize_for_model

logger = logging.getLogger(__name__)


@dataclass
class ClassificationOutput:
    """Raw output from the classifier."""
    ai_grade: int            # 0–4
    referable_probability: float  # 0.0–1.0
    class_probabilities: list[float]  # Per-class softmax [p0, p1, p2, p3, p4]


class DRClassifier:
    """
    Diabetic Retinopathy classifier.

    Automatically switches between real inference and stub mode
    based on whether weight files exist.

    ── FOR THE ML FRIEND ──────────────────────────────────────
    To integrate your trained model:

    1. Save your trained EfficientNet-B0 weights as a .pt file
       (using torch.save(model.state_dict(), path)).

    2. Place it at: model/weights/classifier.pt

    3. Update the `_load_real_model()` and `_real_predict()`
       methods below to match your model's exact architecture
       and preprocessing.

    See model/README.md for full instructions.
    ───────────────────────────────────────────────────────────
    """

    MODEL_NAME = "EfficientNet-B0"
    VERSION = "0.1.0-stub"

    def __init__(self) -> None:
        self.weights_path = settings.classifier_weights
        self.stub_mode = True
        self.model = None

        if self.weights_path.exists():
            self._load_real_model()
        else:
            logger.warning(
                "Classifier weights not found at '%s' — running in STUB MODE. "
                "See model/README.md to integrate real weights.",
                self.weights_path,
            )

    @property
    def is_loaded(self) -> bool:
        return not self.stub_mode

    def _load_real_model(self) -> None:
        """
        Load the real trained model from disk.

        ╔═══════════════════════════════════════════════════╗
        ║  ML FRIEND: Replace this method's body with your  ║
        ║  actual model loading code.                       ║
        ╚═══════════════════════════════════════════════════╝
        """
        try:
            import torch
            import torchvision.models as models

            # ── REPLACE THIS BLOCK ────────────────────────
            # Example: loading an EfficientNet-B0 with 5 output classes
            self.model = models.efficientnet_b0(weights=None)
            # Replace the classifier head for 5 DR grades
            in_features = self.model.classifier[1].in_features
            self.model.classifier[1] = torch.nn.Linear(in_features, 5)
            # Load trained weights
            state_dict = torch.load(
                self.weights_path,
                map_location=torch.device("cpu"),
                weights_only=True,
            )
            self.model.load_state_dict(state_dict)
            self.model.eval()
            # ── END REPLACE ───────────────────────────────

            self.stub_mode = False
            self.VERSION = "1.0.0"
            logger.info("Classifier model loaded successfully from '%s'", self.weights_path)

        except Exception:
            logger.exception("Failed to load classifier weights — falling back to STUB MODE")
            self.stub_mode = True

    def predict(self, image: np.ndarray) -> ClassificationOutput:
        """
        Predict DR grade for a BGR fundus image.

        Args:
            image: BGR numpy array.

        Returns:
            ClassificationOutput with grade, probability, and per-class scores.
        """
        if self.stub_mode:
            return self._stub_predict(image)
        return self._real_predict(image)

    def _real_predict(self, image: np.ndarray) -> ClassificationOutput:
        """
        Run real model inference.

        ╔═══════════════════════════════════════════════════╗
        ║  ML FRIEND: Update preprocessing if your model    ║
        ║  uses different transforms (crop, augmentation,   ║
        ║  normalization constants, etc.).                   ║
        ╚═══════════════════════════════════════════════════╝
        """
        import torch
        import torchvision.transforms as T

        # Preprocess: resize → RGB → normalise → tensor → batch
        resized = resize_for_model(image)
        rgb = bgr_to_rgb(resized)

        transform = T.Compose([
            T.ToTensor(),
            T.Normalize(
                mean=[0.485, 0.456, 0.406],  # ImageNet defaults
                std=[0.229, 0.224, 0.225],
            ),
        ])

        tensor = transform(rgb).unsqueeze(0)  # [1, 3, 224, 224]

        with torch.no_grad():
            logits = self.model(tensor)                    # [1, 5]
            probs = torch.softmax(logits, dim=1)[0]        # [5]
            class_probs = probs.tolist()
            ai_grade = int(torch.argmax(probs).item())

        # Referable probability = sum of grades 2–4
        referable_probability = sum(class_probs[2:])

        return ClassificationOutput(
            ai_grade=ai_grade,
            referable_probability=round(referable_probability, 4),
            class_probabilities=[round(p, 4) for p in class_probs],
        )

    def _stub_predict(self, image: np.ndarray) -> ClassificationOutput:
        """
        Generate a deterministic-ish mock prediction based on image content.

        Uses a hash of pixel data so the same image always returns the
        same stub result — helpful for consistent integration testing.
        """
        # Derive a seed from the image so results are repeatable per image
        pixel_hash = hashlib.md5(image.tobytes()[:4096]).hexdigest()
        seed = int(pixel_hash[:8], 16) % 100

        # Distribute grades: ~30% grade 0, ~20% grade 1, ~20% grade 2,
        # ~15% grade 3, ~15% grade 4
        if seed < 30:
            grade = 0
        elif seed < 50:
            grade = 1
        elif seed < 70:
            grade = 2
        elif seed < 85:
            grade = 3
        else:
            grade = 4

        # Generate plausible class probabilities
        rng = random.Random(seed)
        raw = [rng.random() for _ in range(5)]
        raw[grade] += 3.0  # Boost the "correct" class
        total = sum(raw)
        class_probs = [round(r / total, 4) for r in raw]

        referable_probability = round(sum(class_probs[2:]), 4)

        logger.debug(
            "STUB predict: grade=%d, referable_prob=%.4f",
            grade, referable_probability,
        )

        return ClassificationOutput(
            ai_grade=grade,
            referable_probability=referable_probability,
            class_probabilities=class_probs,
        )

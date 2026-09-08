"""
NETRA-AI Worker — DR Classification Service.

Grades a fundus image on the APTOS 0–4 scale and returns
a continuous referable-probability score.

Real model:
EfficientNet-B0, trained for five DR classes:
0 = No DR
1 = Mild NPDR
2 = Moderate NPDR
3 = Severe NPDR
4 = Proliferative DR
"""

from __future__ import annotations

import hashlib
import logging
import random
from dataclasses import dataclass

import numpy as np

from app.config import settings
from app.utils.image_processing import (
    resize_for_model,
    bgr_to_rgb,
    normalize_for_model,
)

logger = logging.getLogger(__name__)


@dataclass
class ClassificationOutput:
    """Raw output from the classifier."""
    ai_grade: int
    referable_probability: float
    class_probabilities: list[float]


class DRClassifier:
    """
    Diabetic Retinopathy five-class classifier.

    Uses classifier.pt when the model file exists.
    Falls back to deterministic stub predictions otherwise.
    """

    MODEL_NAME = "EfficientNet-B0"
    VERSION = "1.0.0"

    def __init__(self) -> None:
        self.weights_path = settings.classifier_weights
        self.stub_mode = True
        self.model = None
        self.device = None

        if self.weights_path.exists():
            self._load_real_model()
        else:
            logger.warning(
                "Classifier weights not found at '%s' — running in STUB MODE.",
                self.weights_path,
            )

    @property
    def is_loaded(self) -> bool:
        return not self.stub_mode

    def _load_real_model(self) -> None:
        """
        Build the same five-class EfficientNet-B0 architecture used in
        Colab, then load the tensor-only classifier.pt state_dict.
        """
        try:
            import torch
            import torch.nn as nn
            from torchvision.models import efficientnet_b0

            self.device = torch.device(
                "cuda" if torch.cuda.is_available() else "cpu"
            )

            # Create the exact architecture used during training.
            model = efficientnet_b0(weights=None)

            # Your trained model has five APTOS DR-grade outputs.
            model.classifier[1] = nn.Linear(
                model.classifier[1].in_features,
                5,
            )

            # classifier.pt was saved with model.state_dict(), so it is
            # a tensor-only OrderedDict and safely supports weights_only=True.
            state_dict = torch.load(
                self.weights_path,
                map_location=self.device,
                weights_only=True,
            )

            model.load_state_dict(state_dict)
            model.to(self.device)
            model.eval()

            self.model = model
            self.stub_mode = False
            self.VERSION = "1.0.0"

            logger.info(
                "Real EfficientNet-B0 five-class classifier loaded from '%s' on %s.",
                self.weights_path,
                self.device,
            )

        except Exception:
            logger.exception(
                "Failed to load classifier weights — falling back to STUB MODE"
            )
            self.model = None
            self.stub_mode = True

    def predict(self, image: np.ndarray) -> ClassificationOutput:
        """
        Predict DR grade for a BGR fundus image.

        Args:
            image: BGR OpenCV NumPy array.

        Returns:
            ClassificationOutput:
              - ai_grade: 0–4
              - referable_probability: P(grade 2) + P(grade 3) + P(grade 4)
              - class_probabilities: softmax [P0, P1, P2, P3, P4]
        """
        if self.stub_mode:
            return self._stub_predict(image)

        return self._real_predict(image)

    def _real_predict(self, image: np.ndarray) -> ClassificationOutput:
        """Run five-class EfficientNet-B0 inference."""
        import torch
        import torchvision.transforms as T

        # Uses existing project helpers:
        # BGR -> resized 224x224 -> RGB.
        resized = resize_for_model(image)
        rgb = bgr_to_rgb(resized)

        transform = T.Compose([
            T.ToTensor(),
            T.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225],
            ),
        ])

        # Shape: [1, 3, 224, 224]
        tensor = transform(rgb).unsqueeze(0).to(self.device)

        with torch.no_grad():
            logits = self.model(tensor)
            probabilities = torch.softmax(logits, dim=1)[0]

        class_probs = [
            float(probability.item())
            for probability in probabilities
        ]

        ai_grade = int(torch.argmax(probabilities).item())

        # By the project's clinical policy, Grades 2, 3, and 4 are referable.
        referable_probability = float(sum(class_probs[2:]))

        logger.debug(
            "REAL predict: grade=%d, referable_prob=%.4f",
            ai_grade,
            referable_probability,
        )

        return ClassificationOutput(
            ai_grade=ai_grade,
            referable_probability=round(referable_probability, 4),
            class_probabilities=[
                round(probability, 4)
                for probability in class_probs
            ],
        )

    def _stub_predict(self, image: np.ndarray) -> ClassificationOutput:
        """
        Generate deterministic mock output when classifier.pt is absent.
        """
        pixel_hash = hashlib.md5(image.tobytes()[:4096]).hexdigest()
        seed = int(pixel_hash[:8], 16) % 100

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

        rng = random.Random(seed)
        raw = [rng.random() for _ in range(5)]
        raw[grade] += 3.0
        total = sum(raw)

        class_probs = [
            round(value / total, 4)
            for value in raw
        ]

        referable_probability = round(
            sum(class_probs[2:]),
            4,
        )

        logger.debug(
            "STUB predict: grade=%d, referable_prob=%.4f",
            grade,
            referable_probability,
        )

        return ClassificationOutput(
            ai_grade=grade,
            referable_probability=referable_probability,
            class_probabilities=class_probs,
        )
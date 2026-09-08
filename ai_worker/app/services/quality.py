"""
NETRA-AI Worker — Image Quality Assessment (IQA) Service.

Runs two checks on the uploaded fundus image BEFORE any model
inference happens:

1. **Sharpness (blur detection)** — Laplacian variance.
   Low variance → blurry image → RETAKE_REQUIRED.

2. **Exposure analysis** — Mean pixel intensity of grayscale.
   Too dark → underexposed.  Too bright → overexposed.

This is pure OpenCV — no trained model needed, works from day one.
"""

from __future__ import annotations

import logging

import cv2
import numpy as np

from app.config import settings
from app.schemas.responses import ExposureStatus, QualityResult
from app.utils.image_processing import to_grayscale

logger = logging.getLogger(__name__)


class QualityAssessor:
    """Stateless IQA service — no model weights required."""

    def __init__(self) -> None:
        self.blur_threshold = settings.blur_threshold
        self.exposure_low = settings.exposure_low
        self.exposure_high = settings.exposure_high

    def assess(self, image: np.ndarray) -> QualityResult:
        """
        Run full IQA on a BGR image.

        Args:
            image: BGR numpy array (as decoded from upload).

        Returns:
            QualityResult with blur_score, exposure status, and
            whether the image is gradable.
        """
        blur_score = self._compute_blur_score(image)
        exposure = self._compute_exposure(image)

        is_sharp = blur_score >= self.blur_threshold
        is_well_exposed = exposure == ExposureStatus.NORMAL
        gradable = is_sharp and is_well_exposed

        logger.info(
            "IQA result: blur_score=%.1f (threshold=%.1f), exposure=%s, gradable=%s",
            blur_score, self.blur_threshold, exposure.value, gradable,
        )

        return QualityResult(
            gradable=gradable,
            blur_score=round(blur_score, 1),
            exposure=exposure,
        )

    def _compute_blur_score(self, image: np.ndarray) -> float:
        """
        Compute Laplacian variance as a sharpness metric.

        Higher values = sharper image.  Typical ranges:
        - Very blurry: < 50
        - Borderline:  50–150
        - Sharp:       > 150
        - Very sharp:  > 500
        """
        gray = to_grayscale(image)
        laplacian = cv2.Laplacian(gray, cv2.CV_64F)
        variance = float(laplacian.var())
        return variance

    def _compute_exposure(self, image: np.ndarray) -> ExposureStatus:
        """
        Assess exposure via mean pixel intensity of the grayscale image.

        Returns:
            ExposureStatus enum value.
        """
        gray = to_grayscale(image)
        mean_intensity = float(np.mean(gray))

        if mean_intensity < self.exposure_low:
            return ExposureStatus.UNDEREXPOSED
        elif mean_intensity > self.exposure_high:
            return ExposureStatus.OVEREXPOSED
        else:
            return ExposureStatus.NORMAL

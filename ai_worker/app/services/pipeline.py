"""
NETRA-AI Worker — Full Inference Pipeline Orchestrator.

Chains the three stages of the AI pipeline:

    IQA Gate  →  Classification  →  Lesion Detection  →  Verdict

If the IQA gate fails, the pipeline short-circuits and returns
RETAKE_REQUIRED without wasting compute on classification/detection.

The 0.40 referral threshold is applied here to produce the final
ROUTINE_ANNUAL_CHECK or URGENT_REFERRAL recommendation.
"""

from __future__ import annotations

import logging

import numpy as np

from app.config import settings
from app.schemas.responses import (
    AnalyzeResponse,
    Lesion,
    QualityCheckResponse,
    QualityStatus,
    Recommendation,
    ScreeningResult,
)
from app.services.classifier import DRClassifier
from app.services.lesion_detector import LesionDetector
from app.services.quality import QualityAssessor

logger = logging.getLogger(__name__)


class InferencePipeline:
    """
    Orchestrates the full IQA → Classify → Detect → Verdict pipeline.

    Instantiated once at app startup and reused for every request.
    """

    def __init__(self) -> None:
        logger.info("Initialising inference pipeline...")
        self.quality_assessor = QualityAssessor()
        self.classifier = DRClassifier()
        self.detector = LesionDetector()
        self.referral_threshold = settings.referral_threshold
        logger.info(
            "Pipeline ready. classifier_stub=%s, detector_stub=%s, threshold=%.2f",
            self.classifier.stub_mode,
            self.detector.stub_mode,
            self.referral_threshold,
        )

    @property
    def models_loaded(self) -> bool:
        """True if at least the classifier has real weights loaded."""
        return self.classifier.is_loaded

    def run_quality_check(self, image: np.ndarray) -> QualityCheckResponse:
        """
        Quick IQA-only check (for the retake prompt at capture time).

        This is called via POST /internal/ai/quality-check.
        """
        quality = self.quality_assessor.assess(image)

        return QualityCheckResponse(
            status="success",
            quality=quality,
            quality_status=(
                QualityStatus.GRADABLE if quality.gradable
                else QualityStatus.RETAKE_REQUIRED
            ),
        )

    def run_full_analysis(self, image: np.ndarray) -> AnalyzeResponse:
        """
        Full pipeline: IQA → Classification → Lesion Detection → Verdict.

        This is called via POST /internal/ai/analyze.

        Pipeline logic:
        1. Run IQA gate.
        2. If image is NOT gradable → short-circuit, return RETAKE_REQUIRED
           with no classification or lesions.
        3. If gradable → run classifier → get grade + probability.
        4. Run lesion detector → get bounding boxes.
        5. Apply 0.40 referral threshold → determine recommendation.
        6. Package into the AnalyzeResponse contract.
        """
        # ── Step 1: IQA Gate ────────────────────────────────
        quality = self.quality_assessor.assess(image)

        # ── Step 2: Short-circuit if ungradable ─────────────
        if not quality.gradable:
            logger.info("IQA gate FAILED — returning RETAKE_REQUIRED, skipping inference")
            return AnalyzeResponse(
                status="success",
                quality=quality,
                screening_result=None,
                recommendation=None,
                lesions=[],
            )

        # ── Step 3: Classification ──────────────────────────
        classification = self.classifier.predict(image)
        logger.info(
            "Classification: grade=%d, referable_prob=%.4f, probs=%s",
            classification.ai_grade,
            classification.referable_probability,
            classification.class_probabilities,
        )

        screening_result = ScreeningResult(
            ai_grade=classification.ai_grade,
            referable_probability=round(classification.referable_probability, 2),
        )

        # ── Step 4: Lesion Detection ────────────────────────
        raw_lesions = self.detector.detect(image)
        lesions = [
            Lesion(
                type=det.lesion_type,
                bbox=det.bbox,
                confidence=round(det.confidence, 2),
            )
            for det in raw_lesions
        ]

        # ── Step 5: Apply Referral Threshold ────────────────
        # 0.40 threshold (sensitivity-biased): grades 2–4 = URGENT_REFERRAL
        if classification.referable_probability >= self.referral_threshold:
            recommendation = Recommendation.URGENT_REFERRAL
        else:
            recommendation = Recommendation.ROUTINE_ANNUAL_CHECK

        logger.info(
            "Verdict: %s (prob=%.4f, threshold=%.2f, grade=%d)",
            recommendation.value,
            classification.referable_probability,
            self.referral_threshold,
            classification.ai_grade,
        )

        # ── Step 6: Package Response ────────────────────────
        return AnalyzeResponse(
            status="success",
            quality=quality,
            screening_result=screening_result,
            recommendation=recommendation,
            lesions=lesions,
        )

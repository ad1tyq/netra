"""
NETRA-AI Worker — Full Inference Pipeline Orchestrator.

Chains the AI pipeline:

    IQA Gate -> Classification -> Lesion Detection -> Verdict

If the IQA gate fails, the pipeline returns RETAKE_REQUIRED and skips
classification and lesion detection.

Referral policy:
- Grade 0: ROUTINE_ANNUAL_CHECK
- Grade 1: ROUTINE_ANNUAL_CHECK
- Grade 2: URGENT_REFERRAL when referable probability reaches threshold
- Grade 3: always URGENT_REFERRAL
- Grade 4: always URGENT_REFERRAL

The configured referral threshold is applied to the classifier's
referable probability, which represents the combined probability of
grades 2, 3, and 4.
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
    Orchestrates the IQA -> Classification -> Detection -> Verdict pipeline.

    A single instance is created at application startup and reused for
    all inference requests.
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
        """Return True when real classifier weights were loaded."""
        return self.classifier.is_loaded

    def run_quality_check(self, image: np.ndarray) -> QualityCheckResponse:
        """
        Run only the image-quality assessment gate.

        Used by POST /internal/ai/quality-check.
        """
        quality = self.quality_assessor.assess(image)

        return QualityCheckResponse(
            status="success",
            quality=quality,
            quality_status=(
                QualityStatus.GRADABLE
                if quality.gradable
                else QualityStatus.RETAKE_REQUIRED
            ),
        )

    def _get_recommendation(
        self,
        ai_grade: int,
        referable_probability: float,
    ) -> Recommendation:
        """
        Convert the classifier output into the final clinical workflow action.

        Grade 3 and Grade 4 are treated as urgent regardless of the
        probability threshold. For lower grades, the configured threshold
        is used as a sensitivity-oriented referral safety net.
        """
        if ai_grade >= 3:
            return Recommendation.URGENT_REFERRAL

        if referable_probability >= self.referral_threshold:
            return Recommendation.URGENT_REFERRAL

        return Recommendation.ROUTINE_ANNUAL_CHECK

    def run_full_analysis(self, image: np.ndarray) -> AnalyzeResponse:
        """
        Run the full IQA -> classification -> lesion detection -> verdict flow.

        Used by POST /internal/ai/analyze.
        """
        # Step 1: Image-quality assessment.
        quality = self.quality_assessor.assess(image)

        # Step 2: Stop early if the image cannot be graded.
        if not quality.gradable:
            logger.info(
                "IQA gate failed; returning RETAKE_REQUIRED and skipping inference."
            )

            return AnalyzeResponse(
                status="success",
                quality=quality,
                screening_result=None,
                recommendation=None,
                lesions=[],
            )

        # Step 3: Five-class DR classification.
        classification = self.classifier.predict(image)

        logger.info(
            "Classification: grade=%d, referable_prob=%.4f, probabilities=%s",
            classification.ai_grade,
            classification.referable_probability,
            classification.class_probabilities,
        )

        screening_result = ScreeningResult(
            ai_grade=classification.ai_grade,
            referable_probability=round(
                classification.referable_probability,
                2,
            ),
        )

        # Step 4: Lesion localization.
        raw_lesions = self.detector.detect(image)

        lesions = [
            Lesion(
                type=detection.lesion_type,
                bbox=detection.bbox,
                confidence=round(detection.confidence, 2),
            )
            for detection in raw_lesions
        ]

        # Step 5: Clinical workflow verdict.
        recommendation = self._get_recommendation(
            ai_grade=classification.ai_grade,
            referable_probability=classification.referable_probability,
        )

        logger.info(
            "Verdict: %s (grade=%d, probability=%.4f, threshold=%.2f)",
            recommendation.value,
            classification.ai_grade,
            classification.referable_probability,
            self.referral_threshold,
        )

        # Step 6: Return the Spring Boot API contract.
        return AnalyzeResponse(
            status="success",
            quality=quality,
            screening_result=screening_result,
            recommendation=recommendation,
            lesions=lesions,
        )
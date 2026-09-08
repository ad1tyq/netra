"""
POST /internal/ai/analyze — Full AI inference pipeline.

This is the primary endpoint.  Spring Boot calls this after
the technician submits a screening.  It runs the complete
pipeline:

    IQA Gate → Classification → Lesion Detection → Verdict

Returns the full JSON contract that Spring Boot persists to
PostgreSQL and uses to route referrals.
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, Request, UploadFile

from app.schemas.responses import (
    AnalyzeResponse,
    ExposureStatus,
    QualityResult,
)
from app.utils.image_processing import decode_image_bytes

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post(
    "/analyze",
    response_model=AnalyzeResponse,
    summary="Full DR screening inference pipeline",
    tags=["Inference"],
)
async def analyze(request: Request, file: UploadFile) -> AnalyzeResponse:
    """
    Upload a fundus image for full DR screening analysis.

    - **file**: Fundus image file (JPEG/PNG) as multipart upload.

    Pipeline stages:
    1. **IQA Gate**: Checks blur and exposure.  If ungradable,
       short-circuits and returns immediately — no model inference.
    2. **Classification**: EfficientNet-B0 grades the image 0–4
       and produces a referable probability.
    3. **Lesion Detection**: Localises microaneurysms, haemorrhages,
       and exudates with normalised bounding boxes.
    4. **Verdict**: Applies the 0.40 clinical threshold to produce
       ROUTINE_ANNUAL_CHECK or URGENT_REFERRAL.

    Returns the full JSON contract consumed by Spring Boot.
    """
    try:
        raw_bytes = await file.read()
        logger.info(
            "Analyze request: filename=%s, size=%d bytes",
            file.filename, len(raw_bytes),
        )

        image = decode_image_bytes(raw_bytes)
        pipeline = request.app.state.pipeline

        result = pipeline.run_full_analysis(image)

        logger.info(
            "Analyze complete: status=%s, recommendation=%s",
            result.status,
            result.recommendation.value if result.recommendation else "N/A (retake)",
        )

        return result

    except ValueError as e:
        logger.warning("Analyze failed — invalid image: %s", e)
        return AnalyzeResponse(
            status="error",
            quality=QualityResult(
                gradable=False, blur_score=0.0, exposure=ExposureStatus.NORMAL
            ),
            screening_result=None,
            recommendation=None,
            lesions=[],
            error_message=str(e),
        )

    except Exception as e:
        logger.exception("Unexpected error during analysis")
        return AnalyzeResponse(
            status="error",
            quality=QualityResult(
                gradable=False, blur_score=0.0, exposure=ExposureStatus.NORMAL
            ),
            screening_result=None,
            recommendation=None,
            lesions=[],
            error_message=f"Internal error: {type(e).__name__}",
        )

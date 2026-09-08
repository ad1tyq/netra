"""
POST /internal/ai/quality-check — Quick IQA-only endpoint.

Runs Laplacian variance (sharpness) and exposure analysis on
the uploaded fundus image.  Returns immediately with GRADABLE
or RETAKE_REQUIRED.

This is called by Spring Boot the moment the technician captures
an image, so the frontend can flash an amber "retake" banner
before the patient stands up.

No classification or lesion detection happens here — just the
image quality gate.
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, Request, UploadFile

from app.schemas.responses import QualityCheckResponse
from app.utils.image_processing import decode_image_bytes

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post(
    "/quality-check",
    response_model=QualityCheckResponse,
    summary="Quick image quality assessment",
    tags=["Inference"],
)
async def quality_check(request: Request, file: UploadFile) -> QualityCheckResponse:
    """
    Upload a fundus image for instant quality feedback.

    - **file**: Fundus image file (JPEG/PNG) as multipart upload.

    Returns blur score, exposure status, and whether the image
    is gradable or needs a retake.
    """
    try:
        raw_bytes = await file.read()
        logger.info(
            "Quality check request: filename=%s, size=%d bytes",
            file.filename, len(raw_bytes),
        )

        image = decode_image_bytes(raw_bytes)
        pipeline = request.app.state.pipeline

        return pipeline.run_quality_check(image)

    except ValueError as e:
        logger.warning("Quality check failed — invalid image: %s", e)
        from app.schemas.responses import ExposureStatus, QualityResult, QualityStatus
        return QualityCheckResponse(
            status="error",
            quality=QualityResult(gradable=False, blur_score=0.0, exposure=ExposureStatus.NORMAL),
            quality_status=QualityStatus.RETAKE_REQUIRED,
            error_message=str(e),
        )

    except Exception as e:
        logger.exception("Unexpected error during quality check")
        from app.schemas.responses import ExposureStatus, QualityResult, QualityStatus
        return QualityCheckResponse(
            status="error",
            quality=QualityResult(gradable=False, blur_score=0.0, exposure=ExposureStatus.NORMAL),
            quality_status=QualityStatus.RETAKE_REQUIRED,
            error_message=f"Internal error: {type(e).__name__}",
        )

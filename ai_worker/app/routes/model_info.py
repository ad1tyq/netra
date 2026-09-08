"""
GET /internal/ai/model-info — Model metadata for audit traceability.

Returns the loaded model names, versions, expected input dimensions,
and whether the system is running in stub mode (no real weights).

Used by Spring Boot for logging and compliance audit trails.
"""

from __future__ import annotations

from fastapi import APIRouter, Request

from app.schemas.responses import ModelInfoResponse
from app.utils.image_processing import MODEL_INPUT_SIZE

router = APIRouter()


@router.get(
    "/model-info",
    response_model=ModelInfoResponse,
    summary="Model metadata for audit traceability",
    tags=["Ops"],
)
async def model_info(request: Request) -> ModelInfoResponse:
    """
    Returns metadata about the currently loaded AI models.
    """
    pipeline = request.app.state.pipeline

    return ModelInfoResponse(
        classifier=pipeline.classifier.MODEL_NAME,
        classifier_version=pipeline.classifier.VERSION,
        detector=pipeline.detector.MODEL_NAME,
        detector_version=pipeline.detector.VERSION,
        input_size=list(MODEL_INPUT_SIZE),
        stub_mode=pipeline.classifier.stub_mode and pipeline.detector.stub_mode,
    )

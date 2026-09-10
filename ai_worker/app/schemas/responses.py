"""
NETRA-AI Worker — Response Schemas.

These Pydantic models define the exact JSON shape that Spring Boot
expects from every endpoint.  Any change here must be coordinated
with the Java team.
"""

from __future__ import annotations

from enum import Enum
from typing import Literal

from pydantic import BaseModel, Field


# ── Enums ───────────────────────────────────────────────────

class ExposureStatus(str, Enum):
    NORMAL = "normal"
    OVEREXPOSED = "overexposed"
    UNDEREXPOSED = "underexposed"


class Recommendation(str, Enum):
    ROUTINE_ANNUAL_CHECK = "ROUTINE_ANNUAL_CHECK"
    URGENT_REFERRAL = "URGENT_REFERRAL"
    URGENT_MACULAR_REFERRAL = "URGENT_MACULAR_REFERRAL"


class LesionType(str, Enum):
    MICROANEURYSM = "MICROANEURYSM"
    HAEMORRHAGE = "HAEMORRHAGE"
    EXUDATE = "EXUDATE"
    MACULAR_EDEMA = "MACULAR_EDEMA"


class QualityStatus(str, Enum):
    GRADABLE = "GRADABLE"
    RETAKE_REQUIRED = "RETAKE_REQUIRED"


# ── Sub-models ──────────────────────────────────────────────

class QualityResult(BaseModel):
    """Image quality assessment results."""
    gradable: bool
    blur_score: float = Field(description="Laplacian variance — higher is sharper")
    exposure: ExposureStatus


class ScreeningResult(BaseModel):
    """Classification output from the DR grading model."""
    ai_grade: int = Field(ge=0, le=4, description="APTOS DR grade 0–4")
    referable_probability: float = Field(
        ge=0.0, le=1.0,
        description="Continuous referable probability score",
    )


class Lesion(BaseModel):
    """A single detected lesion with bounding box."""
    type: LesionType
    bbox: list[float] = Field(
        min_length=4, max_length=4,
        description="[x, y, width, height] normalised to 0–1",
    )
    confidence: float = Field(ge=0.0, le=1.0)


# ── Top-level Endpoint Responses ────────────────────────────

class AnalyzeResponse(BaseModel):
    """
    Full pipeline response for POST /internal/ai/analyze.

    This is the exact JSON contract the Java Spring Boot backend
    consumes to persist screening results and route referrals.
    """
    status: Literal["success", "error"]
    quality: QualityResult
    screening_result: ScreeningResult | None = Field(
        default=None,
        description="None when quality gate fails (RETAKE_REQUIRED)",
    )
    recommendation: Recommendation | None = Field(
        default=None,
        description="None when quality gate fails",
    )
    lesions: list[Lesion] = Field(default_factory=list)
    error_message: str | None = None


class QualityCheckResponse(BaseModel):
    """
    Quick IQA-only response for POST /internal/ai/quality-check.
    Used for real-time retake prompts in the field.
    """
    status: Literal["success", "error"]
    quality: QualityResult
    quality_status: QualityStatus
    error_message: str | None = None


class HealthResponse(BaseModel):
    """GET /internal/ai/health liveness probe."""
    status: Literal["healthy", "unhealthy"]
    model_loaded: bool
    uptime_seconds: float


class ModelInfoResponse(BaseModel):
    """GET /internal/ai/model-info for audit traceability."""
    classifier: str = Field(description="Classifier architecture name")
    classifier_version: str
    detector: str = Field(description="Detector architecture name")
    detector_version: str
    input_size: list[int] = Field(description="Expected [H, W] input dimensions")
    stub_mode: bool = Field(description="True if using mock predictions (no weights loaded)")

"""
GET /internal/ai/health — Liveness / readiness probe.

Used by:
- Docker HEALTHCHECK
- Spring Boot's Resilience4j circuit breaker health polling
- Kubernetes readiness probes (if deployed on K8s)
"""

from __future__ import annotations

import time

from fastapi import APIRouter, Request

from app.schemas.responses import HealthResponse

router = APIRouter()

# Set at app startup via lifespan
_start_time: float = 0.0


def set_start_time(t: float) -> None:
    global _start_time
    _start_time = t


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Liveness / readiness probe",
    tags=["Ops"],
)
async def health_check(request: Request) -> HealthResponse:
    """
    Returns the worker's health status, whether models are loaded,
    and uptime in seconds.
    """
    pipeline = request.app.state.pipeline
    model_loaded = pipeline.models_loaded

    return HealthResponse(
        status="healthy" if model_loaded or pipeline.classifier.stub_mode else "unhealthy",
        model_loaded=model_loaded,
        uptime_seconds=round(time.time() - _start_time, 1),
    )

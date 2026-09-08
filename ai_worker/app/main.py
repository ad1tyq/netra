"""
NETRA-AI Worker — FastAPI Application Entry Point.

This module creates the FastAPI app, sets up CORS for Spring Boot,
mounts all route routers, and manages the application lifespan
(model loading on startup, cleanup on shutdown).
"""

from __future__ import annotations

import logging
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routes import analyze, health, model_info, quality_check
from app.routes.health import set_start_time
from app.services.pipeline import InferencePipeline

# ── Logging ─────────────────────────────────────────────────
logging.basicConfig(
    level=getattr(logging, settings.log_level.upper(), logging.INFO),
    format="%(asctime)s │ %(levelname)-8s │ %(name)s │ %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("netra.ai_worker")


# ── Lifespan ────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Startup: load models into memory once.
    Shutdown: cleanup (if needed).
    """
    logger.info("══════════════════════════════════════════════")
    logger.info("  NETRA-AI Worker starting up...")
    logger.info("══════════════════════════════════════════════")

    # Record start time for health endpoint
    set_start_time(time.time())

    # Initialise the full inference pipeline (loads models or stubs)
    pipeline = InferencePipeline()
    app.state.pipeline = pipeline

    if pipeline.classifier.stub_mode:
        logger.warning("⚠  Classifier running in STUB MODE — no weights loaded")
    else:
        logger.info("✓  Classifier loaded with real weights")

    if pipeline.detector.stub_mode:
        logger.warning("⚠  Detector running in STUB MODE — no weights loaded")
    else:
        logger.info("✓  Detector loaded with real weights")

    logger.info("══════════════════════════════════════════════")
    logger.info("  NETRA-AI Worker ready on port %d", settings.port)
    logger.info("══════════════════════════════════════════════")

    yield  # App is running

    # Shutdown cleanup
    logger.info("NETRA-AI Worker shutting down...")


# ── App Factory ─────────────────────────────────────────────
app = FastAPI(
    title="NETRA-AI Worker",
    description=(
        "Stateless AI inference microservice for Diabetic Retinopathy "
        "screening. Consumed exclusively by the Spring Boot orchestrator."
    ),
    version="0.1.0",
    docs_url="/internal/ai/docs",
    redoc_url="/internal/ai/redoc",
    openapi_url="/internal/ai/openapi.json",
    lifespan=lifespan,
)

# ── CORS ────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Mount Routers ───────────────────────────────────────────
app.include_router(health.router, prefix="/internal/ai")
app.include_router(model_info.router, prefix="/internal/ai")
app.include_router(quality_check.router, prefix="/internal/ai")
app.include_router(analyze.router, prefix="/internal/ai")

"""
NETRA-AI Worker — Application Settings.

All configuration is loaded from environment variables / .env file.
Thresholds and paths are centralised here so nothing is hard-coded
in the service layer.
"""

from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application-wide configuration loaded from .env."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # ── Server ──────────────────────────────────────────────
    host: str = "0.0.0.0"
    port: int = 8000
    log_level: str = "info"

    # ── Model Weights Paths ─────────────────────────────────
    classifier_weights_path: str = "model/weights/classifier.pt"
    detector_weights_path: str = "model/weights/detector.pt"

    # ── IQA Thresholds ──────────────────────────────────────
    blur_threshold: float = 50.0   # Laplacian variance below this = blurry (<50 is severe blur)
    exposure_low: int = 40         # Mean retinal pixel intensity below this = underexposed
    exposure_high: int = 220       # Mean pixel intensity above this = overexposed

    # ── Clinical Decision ───────────────────────────────────
    referral_threshold: float = 0.40  # Sensitivity-biased (0.40, not 0.50)

    # ── CORS ────────────────────────────────────────────────
    allowed_origins: str = "http://localhost:8080"

    # ── Derived helpers ─────────────────────────────────────
    @property
    def project_root(self) -> Path:
        return Path(__file__).resolve().parents[1]

    @property
    def classifier_weights(self) -> Path:
        return self.project_root / self.classifier_weights_path

    @property
    def detector_weights(self) -> Path:
        return self.project_root / self.detector_weights_path

    @property
    def origins_list(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",")]


# Singleton — import this everywhere
settings = Settings()

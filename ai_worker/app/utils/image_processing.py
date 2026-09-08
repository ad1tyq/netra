"""
NETRA-AI Worker — Image Processing Utilities.

Centralised helpers for decoding uploaded images, resizing,
normalising, and converting between OpenCV / PIL / PyTorch
tensor formats.
"""

from __future__ import annotations

import io
import logging

import cv2
import numpy as np
from PIL import Image

logger = logging.getLogger(__name__)

# Standard input size for EfficientNet-B0
MODEL_INPUT_SIZE = (224, 224)


def decode_image_bytes(raw_bytes: bytes) -> np.ndarray:
    """
    Decode raw image bytes (JPEG/PNG) into a BGR numpy array (OpenCV format).

    Raises:
        ValueError: If the bytes cannot be decoded as a valid image.
    """
    np_arr = np.frombuffer(raw_bytes, dtype=np.uint8)
    image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    if image is None:
        raise ValueError("Failed to decode image — file may be corrupt or unsupported format.")
    logger.debug("Decoded image: shape=%s, dtype=%s", image.shape, image.dtype)
    return image


def bgr_to_rgb(image: np.ndarray) -> np.ndarray:
    """Convert BGR (OpenCV default) to RGB."""
    return cv2.cvtColor(image, cv2.COLOR_BGR2RGB)


def resize_for_model(image: np.ndarray, size: tuple[int, int] = MODEL_INPUT_SIZE) -> np.ndarray:
    """
    Resize an image to the model's expected input dimensions.

    Args:
        image: Input image (any colour space).
        size:  Target (height, width).

    Returns:
        Resized image as numpy array.
    """
    return cv2.resize(image, (size[1], size[0]), interpolation=cv2.INTER_LINEAR)


def normalize_for_model(image: np.ndarray) -> np.ndarray:
    """
    Normalise pixel values to [0, 1] float32 range.

    This is the first step before applying ImageNet mean/std
    normalisation in the model-specific preprocessing.
    """
    return image.astype(np.float32) / 255.0


def to_grayscale(image: np.ndarray) -> np.ndarray:
    """Convert a BGR image to single-channel grayscale."""
    if len(image.shape) == 2:
        return image
    return cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)


def image_to_pil(image: np.ndarray) -> Image.Image:
    """Convert a BGR numpy array to a PIL Image (RGB)."""
    rgb = bgr_to_rgb(image)
    return Image.fromarray(rgb)

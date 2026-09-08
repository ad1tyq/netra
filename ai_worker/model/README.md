# NETRA-AI — Model Weights Directory

## 👋 Hey! This folder is YOUR workspace.

The AI worker microservice (FastAPI) is built and ready. It currently
runs in **stub mode** — returning realistic mock predictions so the
Java backend and frontend teams can integration-test the full pipeline
while you work on the model.

Your job is to make the stubs real.

---

## What You Need To Deliver

### 1. Classification Model (`classifier.pt`)

**Architecture**: EfficientNet-B0 (or compatible — just update the
loading code in `app/services/classifier.py`)

**Training Dataset**: APTOS 2019 Blindness Detection
(https://www.kaggle.com/c/aptos2019-blindness-detection) or
EyePACS.

**Expected Output**: 5-class softmax → Grades 0–4 (APTOS DR scale)

| Grade | Meaning              |
|-------|----------------------|
| 0     | No DR                |
| 1     | Mild NPDR            |
| 2     | Moderate NPDR        |
| 3     | Severe NPDR          |
| 4     | Proliferative DR     |

**Input Preprocessing** (what the server already does):
- Resize to 224×224
- Convert BGR → RGB
- Normalise with ImageNet mean/std:
  - mean = [0.485, 0.456, 0.406]
  - std  = [0.229, 0.224, 0.225]

**How to save your weights**:
```python
import torch

# After training:
torch.save(model.state_dict(), "model/weights/classifier.pt")
```

**Where to place it**: `model/weights/classifier.pt`

---

### 2. Lesion Detection Model (`detector.pt`)

**Architecture**: Your choice — YOLOv8, Faster R-CNN, custom head
on EfficientNet, etc.

**Expected Output**: List of detections, each with:
- `lesion_type`: One of `MICROANEURYSM`, `HAEMORRHAGE`, `EXUDATE`
- `bbox`: `[x, y, width, height]` — **normalised to 0–1**
  (x,y is top-left corner, all values relative to image dimensions)
- `confidence`: 0.0–1.0

**How to save your weights**:
```python
import torch

# Save the entire model or state_dict — just update the loading
# code in app/services/lesion_detector.py accordingly
torch.save(model.state_dict(), "model/weights/detector.pt")
```

**Where to place it**: `model/weights/detector.pt`

---

## Files You Need To Edit

Once your weights are ready, you need to update **2 files**:

### `app/services/classifier.py`
Look for the blocks marked:
```
╔═══════════════════════════════════════════════════╗
║  ML FRIEND: Replace this method's body with your  ║
║  actual model loading code.                       ║
╚═══════════════════════════════════════════════════╝
```

There are 2 methods to update:
1. `_load_real_model()` — How to instantiate and load your model
2. `_real_predict()` — How to preprocess and run inference

### `app/services/lesion_detector.py`
Same pattern — look for the ML FRIEND markers:
1. `_load_real_model()` — Load your detection model
2. `_real_detect()` — Run detection and return `DetectedLesion` list

---

## How To Test Your Integration

```bash
# From the ai_worker directory:

# 1. Drop your weights into model/weights/
# 2. Start the server:
python -m uvicorn app.main:app --reload --port 8000

# 3. Check model-info (should show stub_mode: false):
curl http://localhost:8000/internal/ai/model-info

# 4. Test with a fundus image:
curl -X POST http://localhost:8000/internal/ai/analyze \
  -F "file=@path/to/fundus_image.jpg"
```

The server will automatically detect your weights and switch
from stub mode to real inference. No config changes needed.

---

## Optional: Training Scripts

If you want to keep your training notebooks / scripts organised,
put them in `model/scripts/`. These won't be deployed — they're
just for your reference.

## Questions?

If the preprocessing (resize, normalise) doesn't match your
training pipeline, just update the transforms in `_real_predict()`
or `_real_detect()`. The code is heavily commented to show you
exactly what to change.

# NETRA-AI Worker

Stateless Python FastAPI microservice for Diabetic Retinopathy screening inference.

## Architecture

```
Frontend (Next.js)  →  Spring Boot (port 8080)  →  This Worker (port 8000)
                                                      ↓
                                                  model/weights/
```

**This service is called exclusively by Spring Boot — never by the frontend directly.**

## Quick Start

```bash
# 1. Create a virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

# 2. Install dependencies
pip install -r requirements.txt

# 3. Copy environment config
copy .env.example .env       # Windows
# cp .env.example .env       # Mac/Linux

# 4. Run the server
uvicorn app.main:app --reload --port 8000

# 5. Open the interactive API docs
# → http://localhost:8000/internal/ai/docs
```

## Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/internal/ai/quality-check` | Quick IQA — blur & exposure check |
| `POST` | `/internal/ai/analyze` | Full pipeline: IQA → classify → detect → verdict |
| `GET`  | `/internal/ai/health` | Liveness/readiness probe |
| `GET`  | `/internal/ai/model-info` | Model metadata for audit trail |

## Stub Mode

The server starts in **stub mode** when no model weights are found.
It returns realistic mock predictions so the Java backend and frontend
can integration-test the full pipeline before model training is complete.

Drop trained weights into `model/weights/` and restart — the server
automatically switches to real inference.

See `model/README.md` for instructions.

## Testing

```bash
# Run all tests
pytest tests/ -v

# Test with curl
curl http://localhost:8000/internal/ai/health
curl -X POST http://localhost:8000/internal/ai/analyze -F "file=@test_image.jpg"
```

## Docker

```bash
docker build -t netra-ai-worker .
docker run -p 8000:8000 netra-ai-worker
```

## Project Structure

```
ai_worker/
├── app/
│   ├── main.py              # FastAPI app, lifespan, CORS
│   ├── config.py             # Settings from .env
│   ├── routes/               # 4 endpoint handlers
│   ├── schemas/              # Pydantic request/response models
│   ├── services/             # IQA, classifier, detector, pipeline
│   └── utils/                # Image processing helpers
├── model/                    # ML teammate's workspace
│   ├── weights/              # .pt model weight files
│   ├── scripts/              # Training scripts (optional)
│   └── README.md             # Integration guide
├── tests/                    # Test suite
├── Dockerfile
├── requirements.txt
└── .env.example
```

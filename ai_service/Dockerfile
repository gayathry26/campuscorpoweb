# ==============================================================================
# CampusCorp AI Resume Analyzer Microservice - Production Docker Container
# FastAPI + llama-cpp-python for Mistral 7B Local Inference
# ==============================================================================

FROM python:3.11-slim-bookworm

# Install build dependencies for compiling llama-cpp-python if needed
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    cmake \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy dependency specification
COPY requirements.txt ./

# Install Python requirements
RUN pip install --no-cache-dir -r requirements.txt

# Copy service code
COPY app.py model_loader.py resume_analyzer.py schemas.py ./

# Create directory for model weights (can be mounted via EFS or downloaded from S3)
RUN mkdir -p /models

ENV AI_SERVICE_HOST=0.0.0.0
ENV AI_SERVICE_PORT=8000
ENV MISTRAL_MODEL_PATH=/models/mistral-7b-instruct-v0.1.Q4_K_M.gguf
ENV MISTRAL_N_CTX=2048
ENV MISTRAL_N_THREADS=4

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

CMD ["python", "app.py"]

import os
import sys
import logging
import threading
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment
load_dotenv()

from schemas import AnalysisRequest, AnalysisResponse, HealthResponse
from model_loader import model_manager
from resume_analyzer import analyze_resume

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("ai_service")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: trigger model load in background thread so server starts instantly
    logger.info("CampusCorp Mistral 7B Resume Analyzer Service Starting...")
    def _bg_load():
        success = model_manager.load_model()
        if success:
            logger.info("Mistral 7B GGUF Model is ready for inference.")
        else:
            logger.error(f"Failed to load Mistral 7B model: {model_manager.load_error}")

    thread = threading.Thread(target=_bg_load, daemon=True)
    thread.start()
    yield
    logger.info("CampusCorp AI Service shutting down.")

app = FastAPI(
    title="CampusCorp Mistral 7B Resume AI Service",
    description="High-performance local GGUF inference service for automated student resume evaluation",
    version="1.0.0",
    lifespan=lifespan
)

# Allow local loopback CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", response_model=HealthResponse)
def health_check():
    """Returns local AI service status, model path verification, and memory state."""
    health_data = model_manager.get_health()
    return HealthResponse(**health_data)

@app.post("/analyze", response_model=AnalysisResponse)
def analyze(req: AnalysisRequest):
    """Processes student resume text and generates structured evaluation using Mistral 7B."""
    if not model_manager.is_loaded:
        health = model_manager.get_health()
        if health["status"] == "error":
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Local Mistral 7B model failed to initialize: {health['details']}"
            )
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Local Mistral 7B model is currently loading into memory. Please retry in a few seconds."
        )

    try:
        logger.info(f"Received resume analysis request for role: {req.role_title} ({req.role_id})")
        result = analyze_resume(req)
        logger.info(f"Analysis completed successfully for {req.role_title}. Score: {result.overallScore}")
        return result
    except ValueError as ve:
        logger.warning(f"Validation error in analysis: {ve}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        logger.error(f"Inference exception during resume analysis: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while evaluating the resume with the local AI model."
        )

if __name__ == "__main__":
    import uvicorn
    host = os.getenv("AI_SERVICE_HOST", "127.0.0.1")
    port = int(os.getenv("AI_SERVICE_PORT", "8000"))
    logger.info(f"Running Uvicorn server on http://{host}:{port}")
    uvicorn.run("app:app", host=host, port=port, reload=False, workers=1)

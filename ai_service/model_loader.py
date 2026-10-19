import os
import sys
import threading
import logging
from typing import Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger("model_loader")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")

class ModelManager:
    _instance: Optional["ModelManager"] = None
    _lock = threading.Lock()

    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(ModelManager, cls).__new__(cls)
                cls._instance._initialized = False
            return cls._instance

    def __init__(self):
        if self._initialized:
            return
        
        self.model_path = os.getenv(
            "MISTRAL_MODEL_PATH",
            r"D:\INNOVO\server\src\models\mistral-7b-instruct-v0.1.Q4_K_M.gguf"
        )
        self.n_ctx = int(os.getenv("MISTRAL_N_CTX", "2048"))
        self.n_threads = int(os.getenv("MISTRAL_N_THREADS", str(max(2, os.cpu_count() or 4))))
        self.max_tokens = int(os.getenv("MISTRAL_MAX_TOKENS", "1024"))
        self.temperature = float(os.getenv("MISTRAL_TEMPERATURE", "0.2"))

        self.llm = None
        self.is_loaded = False
        self.load_error: Optional[str] = None
        self.inference_lock = threading.Lock()
        self._initialized = True

    def check_model_file(self) -> bool:
        if not self.model_path:
            self.load_error = "MISTRAL_MODEL_PATH is not set"
            return False
        
        if not os.path.exists(self.model_path):
            self.load_error = f"Model file not found at path: {self.model_path}"
            return False
            
        file_size_mb = os.path.getsize(self.model_path) / (1024 * 1024)
        if file_size_mb < 500:
            self.load_error = f"Model file appears truncated or corrupt ({file_size_mb:.2f} MB)"
            return False
            
        return True

    def load_model(self) -> bool:
        with self._lock:
            if self.is_loaded and self.llm is not None:
                return True

            logger.info(f"Validating Mistral GGUF model path: {self.model_path}")
            if not self.check_model_file():
                logger.error(f"Model validation failed: {self.load_error}")
                return False

            try:
                from llama_cpp import Llama

                logger.info(
                    f"Initializing Mistral 7B Q4_K_M (n_ctx={self.n_ctx}, n_threads={self.n_threads}) on CPU..."
                )
                self.llm = Llama(
                    model_path=self.model_path,
                    n_ctx=self.n_ctx,
                    n_threads=self.n_threads,
                    verbose=False
                )
                self.is_loaded = True
                self.load_error = None
                logger.info("Mistral 7B model initialized and resident in memory.")
                return True
            except Exception as e:
                self.is_loaded = False
                self.llm = None
                self.load_error = f"Failed to load model through llama-cpp-python: {str(e)}"
                logger.error(self.load_error, exc_info=True)
                return False

    def generate(self, prompt: str, max_tokens: Optional[int] = None, temperature: Optional[float] = None) -> str:
        if not self.is_loaded or self.llm is None:
            raise RuntimeError(f"Model is not loaded. Detail: {self.load_error}")

        tokens_to_gen = max_tokens or self.max_tokens
        temp = temperature if temperature is not None else self.temperature

        with self.inference_lock:
            # llama_cpp handles prompt generation safely
            output = self.llm(
                prompt=prompt,
                max_tokens=tokens_to_gen,
                temperature=temp,
                top_p=0.9,
                stop=["</s>", "[INST]"],
                echo=False
            )
            return output["choices"][0]["text"].strip()

    def get_health(self) -> dict:
        exists = os.path.exists(self.model_path) if self.model_path else False
        status = "ready" if self.is_loaded else ("loading" if not self.load_error else "error")
        return {
            "status": status,
            "model_loaded": self.is_loaded,
            "model_path": self.model_path,
            "model_exists": exists,
            "n_ctx": self.n_ctx,
            "n_threads": self.n_threads,
            "device": "CPU (AVX2/FMA llama-cpp-python runtime)",
            "details": self.load_error or "Model is resident and ready for inference."
        }

model_manager = ModelManager()

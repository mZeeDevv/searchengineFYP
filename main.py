from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.routers import image_router, vector_router, config_router
from app.services.firebase_service import configure_firebase
from app.config import config
import logging
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Fashion FYP API",
    description="Backend API for Fashion Final Year Project - Image Embeddings & Vector Database",
    version="1.0.0"
)

# Validate configuration (more lenient for serverless)
config_errors = config.validate_config()
if config_errors:
    logger.warning("Configuration issues found:")
    for error in config_errors:
        logger.warning(f"  - {error}")
    # In serverless, we'll allow mock mode even with missing config
    if not config.FIREBASE_MOCK_MODE and not os.getenv("VERCEL"):
        logger.error("Cannot start with missing configuration in production mode")
        # Don't exit in serverless environment
        pass

# Configure Firebase (now using environment configuration)
from app.services.firebase_service import firebase_service
firebase_service.initialize_firebase(bucket_name=config.FIREBASE_STORAGE_BUCKET_NAME)
if config.FIREBASE_MOCK_MODE:
    print("🔥 Firebase Storage configured in MOCK mode (development)")
else:
    print("🔥 Firebase Storage configured using REST API (production)")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(image_router.router)
app.include_router(vector_router.router)
app.include_router(config_router.router)

# Mount static files (conditional for serverless)
if not os.getenv("VERCEL"):
    # Local development - mount static files
    app.mount("/static", StaticFiles(directory="static"), name="static")
    
    @app.get("/")
    async def root():
        return FileResponse("static/vector_database.html")

    @app.get("/search")
    async def similar_search():
        return FileResponse("static/similar_search.html")

    @app.get("/firebase-upload")
    async def firebase_upload():
        return FileResponse("static/firebase_upload.html")

    @app.get("/embeddings")
    async def embeddings_view():
        return FileResponse("static/embeddings.html")
else:
    # Vercel deployment - simple API-only responses
    @app.get("/")
    async def root():
        return {
            "message": "Fashion FYP API",
            "version": "1.0.0",
            "endpoints": {
                "upload_and_store": "/api/v1/vectors/upload-and-store",
                "search": "/api/v1/vectors/search",
                "embeddings": "/api/v1/getembeddings",
                "config": "/api/v1/config/firebase"
            }
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

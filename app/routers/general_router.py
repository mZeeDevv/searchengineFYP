from fastapi import APIRouter
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/api/v1", tags=["General"])

@router.get("/")
async def welcome():
    """Welcome endpoint"""
    return {"message": "Welcome to Fashion FYP API", "version": "1.0.0"}

@router.get("/health")
async def health_check():
    """General health check endpoint"""
    return {"status": "healthy", "service": "fashion_fyp_api"}

@router.get("/info")
async def api_info():
    """Get API information"""
    return {
        "name": "Fashion FYP API",
        "version": "1.0.0",
        "description": "Backend API for Fashion Final Year Project",
        "endpoints": {
            "image_processing": "/api/v1/getembeddings",
            "image_upload": "/api/v1/upload",
            "health": "/api/v1/health"
        }
    }

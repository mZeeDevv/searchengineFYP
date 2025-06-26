from fastapi import APIRouter
from fastapi.responses import JSONResponse
from app.config import config

router = APIRouter(prefix="/api/v1/config", tags=["Configuration"])

@router.get("/firebase")
async def get_firebase_config():
    """
    Get Firebase configuration for frontend
    Note: Only returns public configuration values safe for client-side use
    """
    return JSONResponse({
        "firebaseConfig": {
            "apiKey": config.FIREBASE_API_KEY,
            "authDomain": config.FIREBASE_AUTH_DOMAIN,
            "projectId": config.FIREBASE_PROJECT_ID,
            "storageBucket": config.FIREBASE_STORAGE_BUCKET,
            "messagingSenderId": config.FIREBASE_MESSAGING_SENDER_ID, 
            "appId": config.FIREBASE_APP_ID,
            "measurementId": config.FIREBASE_MEASUREMENT_ID
        },
        "mockMode": config.FIREBASE_MOCK_MODE
    })

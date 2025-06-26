"""
Configuration management for environment variables
"""
import os
from dotenv import load_dotenv
from typing import List

# Load environment variables from .env file
load_dotenv()

class Config:
    """Configuration class to manage environment variables"""
    
    # Qdrant Configuration
    QDRANT_URL: str = os.getenv("QDRANT_URL", "")
    QDRANT_API_KEY: str = os.getenv("QDRANT_API_KEY", "")
    QDRANT_COLLECTION_NAME: str = os.getenv("QDRANT_COLLECTION_NAME", "fashion_embeddings")
    
    # Firebase Configuration
    FIREBASE_API_KEY: str = os.getenv("FIREBASE_API_KEY", "")
    FIREBASE_AUTH_DOMAIN: str = os.getenv("FIREBASE_AUTH_DOMAIN", "")
    FIREBASE_PROJECT_ID: str = os.getenv("FIREBASE_PROJECT_ID", "")
    FIREBASE_STORAGE_BUCKET: str = os.getenv("FIREBASE_STORAGE_BUCKET", "")
    FIREBASE_MESSAGING_SENDER_ID: str = os.getenv("FIREBASE_MESSAGING_SENDER_ID", "")
    FIREBASE_APP_ID: str = os.getenv("FIREBASE_APP_ID", "")
    FIREBASE_MEASUREMENT_ID: str = os.getenv("FIREBASE_MEASUREMENT_ID", "")
    
    # Firebase Storage Configuration
    FIREBASE_STORAGE_BUCKET_NAME: str = os.getenv("FIREBASE_STORAGE_BUCKET_NAME", "")
    FIREBASE_SERVICE_ACCOUNT_PATH: str = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH", "")
    
    # Application Configuration
    MAX_FILE_SIZE_MB: int = int(os.getenv("MAX_FILE_SIZE_MB", "10"))
    MAX_FILE_SIZE: int = MAX_FILE_SIZE_MB * 1024 * 1024  # Convert to bytes
    ALLOWED_IMAGE_TYPES: List[str] = os.getenv(
        "ALLOWED_IMAGE_TYPES", 
        "image/jpeg,image/jpg,image/png,image/gif,image/webp"
    ).split(",")
    VECTOR_SIZE: int = int(os.getenv("VECTOR_SIZE", "2048"))
    
    # Development Configuration
    DEBUG_MODE: bool = os.getenv("DEBUG_MODE", "false").lower() == "true"
    FIREBASE_MOCK_MODE: bool = os.getenv("FIREBASE_MOCK_MODE", "true").lower() == "true"
    
    @classmethod
    def get_firebase_config(cls) -> dict:
        """Get Firebase configuration as a dictionary"""
        return {
            "apiKey": cls.FIREBASE_API_KEY,
            "authDomain": cls.FIREBASE_AUTH_DOMAIN,
            "projectId": cls.FIREBASE_PROJECT_ID,
            "storageBucket": cls.FIREBASE_STORAGE_BUCKET,
            "messagingSenderId": cls.FIREBASE_MESSAGING_SENDER_ID,
            "appId": cls.FIREBASE_APP_ID,
            "measurementId": cls.FIREBASE_MEASUREMENT_ID
        }
    
    @classmethod
    def validate_config(cls) -> List[str]:
        """Validate that required configuration is present"""
        errors = []
        
        if not cls.QDRANT_URL:
            errors.append("QDRANT_URL is required")
        if not cls.QDRANT_API_KEY:
            errors.append("QDRANT_API_KEY is required")
        
        # Only validate Firebase config if not in mock mode
        if not cls.FIREBASE_MOCK_MODE:
            if not cls.FIREBASE_PROJECT_ID:
                errors.append("FIREBASE_PROJECT_ID is required when FIREBASE_MOCK_MODE is false")
            if not cls.FIREBASE_STORAGE_BUCKET_NAME:
                errors.append("FIREBASE_STORAGE_BUCKET_NAME is required when FIREBASE_MOCK_MODE is false")
        
        return errors

# Global configuration instance
config = Config()

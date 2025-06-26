from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from app.models.image_models import ImageUploadResponse, EmbeddingResponse, ErrorResponse
from app.services.embedding_service import embedding_service
from app.config import config
import uuid
import time
import asyncio
from typing import List
import os

router = APIRouter(prefix="/api/v1", tags=["Image Processing"])

# Configuration from environment
ALLOWED_IMAGE_TYPES = config.ALLOWED_IMAGE_TYPES
MAX_FILE_SIZE = config.MAX_FILE_SIZE

@router.post("/getembeddings", response_model=EmbeddingResponse)
async def get_image_embeddings(file: UploadFile = File(...)):
    """
    Upload an image and get embeddings using ResNet50
    
    - **file**: Image file (JPEG, PNG, GIF, WebP supported)
    - Returns: Image embeddings and processing information
    """
    
    try:
        # Validate file type
        if file.content_type not in ALLOWED_IMAGE_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"File type {file.content_type} not supported. Allowed types: {', '.join(ALLOWED_IMAGE_TYPES)}"
            )
        
        # Read file content to check size
        content = await file.read()
        file_size = len(content)
        
        if file_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"File size {file_size} bytes exceeds maximum allowed size of {MAX_FILE_SIZE} bytes"
            )
        
        # Generate unique ID for this processing request
        processing_id = str(uuid.uuid4())
        
        # Start timing
        start_time = time.time()
        
        # Generate actual embeddings using TensorFlow
        try:
            embeddings_list, shape_list = embedding_service.generate_embeddings(content)
            model_info = embedding_service.get_model_info()
            
            processing_time = time.time() - start_time
              # Return successful response with actual embeddings
            return EmbeddingResponse(
                id=processing_id,
                filename=file.filename,
                message=f"Image '{file.filename}' successfully processed. Generated {len(embeddings_list)} dimensional embeddings using {model_info['model_name']}",
                embedding_status="completed",
                processing_time=round(processing_time, 3),
                embeddings=embeddings_list[:100],  # Return first 100 values for display (full embeddings are too large for UI)
                embedding_shape=shape_list,
                model_used=model_info['model_name']
            )
            
        except Exception as embedding_error:
            raise HTTPException(
                status_code=500,
                detail=f"Error generating embeddings: {str(embedding_error)}"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error while processing image: {str(e)}"
        )

@router.post("/upload", response_model=ImageUploadResponse)
async def upload_image(file: UploadFile = File(...)):
    """
    Simple image upload endpoint
    
    - **file**: Image file to upload
    - Returns: Upload confirmation
    """
    
    try:
        # Validate file type
        if file.content_type not in ALLOWED_IMAGE_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"File type {file.content_type} not supported. Allowed types: {', '.join(ALLOWED_IMAGE_TYPES)}"
            )
        
        # Read file content to check size
        content = await file.read()
        file_size = len(content)
        
        if file_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"File size exceeds maximum allowed size of {MAX_FILE_SIZE} bytes"
            )
        
        # Generate unique ID for this upload
        upload_id = str(uuid.uuid4())
        
        # Return successful response
        return ImageUploadResponse(
            id=upload_id,
            filename=file.filename,
            message=f"Image '{file.filename}' uploaded successfully",
            file_size=file_size,
            content_type=file.content_type
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error while uploading image: {str(e)}"
        )

@router.get("/health")
async def image_service_health():
    """Health check for image processing service"""
    return {"status": "healthy", "service": "image_processing"}

from fastapi import APIRouter, File, UploadFile, HTTPException, Query, Form
from fastapi.responses import JSONResponse
from app.models.image_models import VectorStoreResponse, SimilarImageResponse, ErrorResponse, EmbeddingRetrievalResponse, CompleteSimilarityResponse
from app.services.embedding_service import embedding_service
from app.services.vector_service import vector_service
from app.services.firebase_service import firebase_service
from app.config import config
import uuid
import time
import asyncio
from typing import List, Optional, Dict, Any
import os
import requests

router = APIRouter(prefix="/api/v1/vectors", tags=["Vector Database"])

# Configuration from environment
ALLOWED_IMAGE_TYPES = config.ALLOWED_IMAGE_TYPES
MAX_FILE_SIZE = config.MAX_FILE_SIZE

@router.on_event("startup")
async def startup_event():
    """Initialize Qdrant collection on startup"""
    await vector_service.initialize_collection()

@router.post("/upload-and-store", response_model=VectorStoreResponse)
async def upload_and_store_complete(
    file: UploadFile = File(...), 
    price: float = Form(..., description="Product price in USD"),
    product_name: str = Form(..., description="Name of the product")
):
    """
    Complete pipeline: Upload image to Firebase Storage → Generate embeddings → Store in Qdrant
    
    This endpoint handles the entire process:
    1. Uploads image to Firebase Storage and gets real Firebase URL
    2. Generates AI embeddings using TensorFlow/ResNet50
    3. Stores embeddings + Firebase URL + Price + Product Name in Qdrant vector database
    
    - **file**: Image file (JPEG, PNG, GIF, WebP supported, max 10MB)
    - **price**: Product price in USD (required)
    - **product_name**: Name of the product (required)
    - Returns: Complete processing status with real Firebase URL and vector storage confirmation
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
        
        # Step 1: Upload image to Firebase Storage
        print(f"🔥 Step 1: Uploading {file.filename} to Firebase Storage...")
        firebase_success, firebase_url, firebase_path = await firebase_service.upload_image(
            image_bytes=content,
            filename=file.filename,
            content_type=file.content_type
        )
        
        if not firebase_success:
            raise HTTPException(
                status_code=500,
                detail="Failed to upload image to Firebase Storage. Please check Firebase configuration."
            )
        
        print(f"✅ Step 1 Complete - Firebase URL: {firebase_url}")
        
        # Step 2: Generate embeddings using TensorFlow
        print(f"🤖 Step 2: Generating AI embeddings for {file.filename}...")
        try:
            embeddings_list, shape_list = embedding_service.generate_embeddings(content)
            model_info = embedding_service.get_model_info()
            print(f"✅ Step 2 Complete - Generated {len(embeddings_list)}-dimensional embedding")
            
        except Exception as embedding_error:
            # If embedding fails, we should clean up the Firebase upload
            # For now, we'll just log it
            print(f"⚠️ Embedding generation failed, Firebase image still uploaded: {firebase_url}")
            raise HTTPException(
                status_code=500,
                detail=f"Error generating embeddings: {str(embedding_error)}"
            )
        
        # Step 3: Store embeddings + Firebase URL + Price + Product Name in Qdrant
        print(f"📊 Step 3: Storing embedding + Firebase URL + Price + Product Name in Qdrant vector database...")
        processing_time = time.time() - start_time
        
        # Log price and product name information
        print(f"💰 Product price: ${price:.2f}")
        print(f"🏷️ Product name: {product_name}")
        
        vector_id = await vector_service.store_embedding(
            embedding=embeddings_list,
            filename=file.filename,
            file_size=file_size,
            content_type=file.content_type,
            processing_time=processing_time,
            model_used=model_info['model_name'],
            firebase_url=firebase_url,
            firebase_path=firebase_path,
            price=price,  # Pass price to store_embedding
            product_name=product_name,  # Pass product name to store_embedding
            metadata={
                "processing_id": processing_id,
                "embedding_shape": shape_list,
                "upload_method": "complete_pipeline",
                "price": price,  # Also store in metadata for easy access
                "product_name": product_name  # Also store in metadata for easy access
            }
        )
        
        print(f"✅ Step 3 Complete - Vector ID: {vector_id}")
        
        # Calculate embedding statistics for verification
        embedding_stats = {
            "min_value": round(min(embeddings_list), 6),
            "max_value": round(max(embeddings_list), 6),
            "avg_value": round(sum(embeddings_list) / len(embeddings_list), 6),
            "non_zero_count": sum(1 for x in embeddings_list if x != 0),
            "total_dimensions": len(embeddings_list)
        }
        
        # Final success message
        success_message = (
            f"✅ COMPLETE PIPELINE SUCCESS: "
            f"Product '{product_name}' (Image: '{file.filename}') → Firebase Storage → AI Embeddings → Qdrant Database. "
            f"Vector ID: {vector_id}"
        )
        print(success_message)
        
        # Return successful response with complete pipeline confirmation
        return VectorStoreResponse(
            id=processing_id,
            vector_id=vector_id,
            filename=file.filename,
            message=success_message,
            embedding_status="completed",
            vector_stored=True,
            processing_time=round(processing_time, 3),
            embeddings_preview=embeddings_list[:100],
            embedding_shape=shape_list,
            model_used=model_info['model_name'],
            embedding_stats=embedding_stats,
            firebase_url=firebase_url,
            firebase_path=firebase_path,
            firebase_uploaded=firebase_success,
            price=price,
            product_name=product_name
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error during complete pipeline: {str(e)}"
        )

@router.post("/search", response_model=SimilarImageResponse)
async def search_similar_images(
    file: UploadFile = File(...),
    limit: int = Query(5, ge=1, le=20, description="Number of similar images to return"),
    threshold: float = Query(0.7, ge=0.0, le=1.0, description="Minimum similarity score")
):
    """
    Upload an image and search for similar images in the vector database
    
    - **file**: Query image file
    - **limit**: Maximum number of results (1-20)
    - **threshold**: Minimum similarity score (0.0-1.0)
    - Returns: List of similar images with metadata
    """
    
    try:
        # Validate file type
        if file.content_type not in ALLOWED_IMAGE_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"File type {file.content_type} not supported. Allowed types: {', '.join(ALLOWED_IMAGE_TYPES)}"
            )
        
        # Read file content
        content = await file.read()
        file_size = len(content)
        
        if file_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"File size {file_size} bytes exceeds maximum allowed size of {MAX_FILE_SIZE} bytes"
            )
        
        # Generate query ID
        query_id = str(uuid.uuid4())
        
        # Start timing
        start_time = time.time()
        
        # Generate embeddings for the query image
        print(f"🔍 Generating embeddings for query image...")
        try:
            query_embeddings, _ = embedding_service.generate_embeddings(content)
            print(f"✅ Query embeddings generated - {len(query_embeddings)} dimensions")
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error generating query embeddings: {str(e)}"
            )
        
        # Search for similar images
        print(f"🔎 Searching for similar images (limit: {limit}, threshold: {threshold})...")
        similar_results = await vector_service.search_similar_images(
            query_embedding=query_embeddings,
            limit=limit,
            score_threshold=threshold
        )
        
        search_time = time.time() - start_time
        
        print(f"✅ Search complete - Found {len(similar_results)} similar images in {search_time:.3f}s")
        
        return SimilarImageResponse(
            query_id=query_id,
            similar_images=similar_results,
            search_time=round(search_time, 3),
            total_found=len(similar_results)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error during search: {str(e)}"
        )

@router.get("/list")
async def list_all_embeddings(
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of embeddings to return"),
    offset: int = Query(0, ge=0, description="Number of embeddings to skip")
):
    """
    List all stored embeddings with metadata
    
    - **limit**: Maximum number of results (1-1000)
    - **offset**: Number of results to skip
    - Returns: List of all embeddings with metadata
    """
    try:
        print(f"📋 Listing embeddings (limit: {limit}, offset: {offset})...")
        
        # Get all points from Qdrant
        embeddings_data = await vector_service.list_all_embeddings(limit=limit, offset=offset)
        
        print(f"✅ Retrieved {len(embeddings_data)} embeddings")
        
        return {
            "embeddings": embeddings_data,
            "total_returned": len(embeddings_data),
            "limit": limit,
            "offset": offset
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error listing embeddings: {str(e)}"
        )

@router.delete("/delete/{vector_id}")
async def delete_embedding(vector_id: str):
    """
    Delete an embedding by its vector ID
    
    - **vector_id**: The ID of the vector to delete
    - Returns: Deletion confirmation
    """
    try:
        print(f"🗑️ Deleting embedding with ID: {vector_id}")
        
        success = await vector_service.delete_embedding(vector_id)
        
        if success:
            print(f"✅ Successfully deleted embedding: {vector_id}")
            return {"message": f"Successfully deleted embedding with ID: {vector_id}"}
        else:
            raise HTTPException(
                status_code=404,
                detail=f"Embedding with ID {vector_id} not found"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error deleting embedding: {str(e)}"
        )

@router.get("/retrieve/{vector_id}", response_model=EmbeddingRetrievalResponse)
async def retrieve_embedding(
    vector_id: str,
    include_vector: bool = Query(False, description="Whether to include the full embedding vector")
):
    """
    Retrieve a specific embedding by its vector ID
    
    - **vector_id**: The ID of the vector to retrieve
    - **include_vector**: Whether to include the full embedding data
    - Returns: Embedding data with metadata
    """
    try:
        print(f"📖 Retrieving embedding with ID: {vector_id}")
        
        embedding_data = await vector_service.retrieve_embedding(vector_id, include_vector)
        
        if embedding_data:
            print(f"✅ Successfully retrieved embedding: {vector_id}")
            return EmbeddingRetrievalResponse(**embedding_data)
        else:
            raise HTTPException(
                status_code=404,
                detail=f"Embedding with ID {vector_id} not found"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving embedding: {str(e)}"
        )

@router.post("/search-complete", response_model=CompleteSimilarityResponse)
async def complete_similarity_search(
    file: UploadFile = File(...),
    limit: int = Query(5, ge=1, le=20, description="Number of similar images to return"),
    threshold: float = Query(0.7, ge=0.0, le=1.0, description="Minimum similarity score"),
    include_embeddings: bool = Query(False, description="Include full embedding vectors in response")
):
    """
    Complete similarity search with full embedding data
    
    This endpoint provides more detailed results including embedding statistics
    and optionally the full embedding vectors for advanced analysis.
    
    - **file**: Query image file
    - **limit**: Maximum number of results (1-20)
    - **threshold**: Minimum similarity score (0.0-1.0)  
    - **include_embeddings**: Include full embedding vectors in response
    - Returns: Detailed similarity search results with embeddings
    """
    
    try:
        # Validate file type
        if file.content_type not in ALLOWED_IMAGE_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"File type {file.content_type} not supported. Allowed types: {', '.join(ALLOWED_IMAGE_TYPES)}"
            )
        
        # Read file content
        content = await file.read()
        file_size = len(content)
        
        if file_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"File size {file_size} bytes exceeds maximum allowed size of {MAX_FILE_SIZE} bytes"
            )
        
        # Generate query ID
        query_id = str(uuid.uuid4())
        
        # Start timing
        start_time = time.time()
        
        # Generate embeddings for the query image
        print(f"🔍 Generating embeddings for complete similarity search...")
        try:
            query_embeddings, query_shape = embedding_service.generate_embeddings(content)
            print(f"✅ Query embeddings generated - {len(query_embeddings)} dimensions")
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error generating query embeddings: {str(e)}"
            )
        
        # Calculate query embedding statistics
        query_stats = {
            "min_value": round(min(query_embeddings), 6),
            "max_value": round(max(query_embeddings), 6),
            "avg_value": round(sum(query_embeddings) / len(query_embeddings), 6),
            "non_zero_count": sum(1 for x in query_embeddings if x != 0),
            "total_dimensions": len(query_embeddings)
        }
        
        # Search for similar images with full embedding data
        print(f"🔎 Performing complete similarity search (limit: {limit}, threshold: {threshold})...")
        similar_results = await vector_service.search_similar_complete(
            query_embedding=query_embeddings,
            limit=limit,
            score_threshold=threshold,
            include_embeddings=include_embeddings
        )
        
        search_time = time.time() - start_time
        
        print(f"✅ Complete search finished - Found {len(similar_results)} similar images in {search_time:.3f}s")
        
        return CompleteSimilarityResponse(
            query_id=query_id,
            query_filename=file.filename,
            query_embedding_preview=query_embeddings[:100] if not include_embeddings else None,
            query_embedding_stats=query_stats,
            search_time=round(search_time, 3),
            total_similar_found=len(similar_results),
            similarity_threshold=threshold,
            similar_embeddings=similar_results,
            message=f"Complete similarity search completed successfully. Found {len(similar_results)} similar images."
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error during complete similarity search: {str(e)}"
        )

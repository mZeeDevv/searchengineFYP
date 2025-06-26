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
    user_id: str = Form(None, description="Firebase User UID (optional)")
):
    """
    Complete pipeline: Upload image to Firebase Storage → Generate embeddings → Store in Qdrant
    
    This endpoint handles the entire process:
    1. Uploads image to Firebase Storage and gets real Firebase URL
    2. Generates AI embeddings using TensorFlow/ResNet50
    3. Stores embeddings + Firebase URL + User ID in Qdrant vector database
    
    - **file**: Image file (JPEG, PNG, GIF, WebP supported, max 10MB)
    - **user_id**: Firebase User UID (optional, will be stored as null if not provided)
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
        
        # Step 3: Store embeddings + Firebase URL + User ID in Qdrant
        print(f"📊 Step 3: Storing embedding + Firebase URL + User ID in Qdrant vector database...")
        processing_time = time.time() - start_time
        
        # Log user information
        if user_id:
            print(f"👤 User ID provided: {user_id}")
        else:
            print(f"👤 No User ID provided - storing as null")
        
        vector_id = await vector_service.store_embedding(
            embedding=embeddings_list,
            filename=file.filename,
            file_size=file_size,
            content_type=file.content_type,
            processing_time=processing_time,
            model_used=model_info['model_name'],
            firebase_url=firebase_url,
            firebase_path=firebase_path,
            user_id=user_id,  # Pass user_id to store_embedding
            metadata={
                "processing_id": processing_id,
                "embedding_shape": shape_list,
                "upload_method": "complete_pipeline",
                "user_id": user_id  # Also store in metadata for easy access
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
            f"Image '{file.filename}' → Firebase Storage → AI Embeddings → Qdrant Database. "
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
            user_id=user_id
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
                detail=f"File size exceeds maximum allowed size of {MAX_FILE_SIZE} bytes"
            )
        
        query_id = str(uuid.uuid4())
        start_time = time.time()
        
        # Generate embeddings for the query image
        try:
            embeddings_list, _ = embedding_service.generate_embeddings(content)
            
            # Search for similar images
            similar_images = await vector_service.search_similar_images(
                query_embedding=embeddings_list,
                limit=limit,
                score_threshold=threshold
            )
            
            search_time = time.time() - start_time
            
            return SimilarImageResponse(
                query_id=query_id,
                similar_images=similar_images,
                search_time=round(search_time, 3),
                total_found=len(similar_images)
            )
            
        except Exception as search_error:
            raise HTTPException(
                status_code=500,
                detail=f"Error searching similar images: {str(search_error)}"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error during search: {str(e)}"
        )

@router.get("/collection/info")
async def get_collection_info():
    """Get information about the vector database collection"""
    try:
        info = await vector_service.get_collection_info()
        return {
            "collection_name": "fashion_embeddings",
            "status": "active",
            "info": info
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error getting collection info: {str(e)}"
        )

@router.get("/health")
async def vector_service_health():
    """Health check for vector database service"""
    try:
        # Test connection by getting collection info
        info = await vector_service.get_collection_info()
        return {
            "status": "healthy",
            "service": "vector_database",
            "qdrant_connection": "active",
            "collection": "fashion_embeddings"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "service": "vector_database",
            "error": str(e)
        }

@router.get("/get/{vector_id}", response_model=EmbeddingRetrievalResponse)
async def get_embedding_by_id(
    vector_id: str,
    include_full_embedding: bool = Query(False, description="Include the full 2048-dimensional embedding vector")
):
    """
    Retrieve a stored embedding by its vector ID
    
    - **vector_id**: The unique ID of the stored vector
    - **include_full_embedding**: Whether to return the full embedding vector (default: False)
    - Returns: Stored embedding data and metadata
    """
    try:
        # Retrieve the stored embedding
        stored_data = await vector_service.get_stored_embedding(vector_id)
        
        if not stored_data:
            raise HTTPException(
                status_code=404,
                detail=f"Vector with ID '{vector_id}' not found in database"
            )
        
        embedding = stored_data.get('embedding', [])
        metadata = stored_data.get('metadata', {})
        
        # Calculate embedding statistics
        embedding_stats = None
        if embedding:
            embedding_stats = {
                "min_value": round(min(embedding), 6),
                "max_value": round(max(embedding), 6),
                "avg_value": round(sum(embedding) / len(embedding), 6),
                "non_zero_count": sum(1 for x in embedding if x != 0),
                "total_dimensions": len(embedding)
            }
        
        # Prepare response
        response_data = {
            "vector_id": vector_id,
            "filename": metadata.get('filename', 'Unknown'),
            "embedding_status": "found",
            "vector_found": True,
            "embeddings_preview": embedding[:100] if embedding else [],  # First 100 values
            "embedding_shape": [len(embedding)] if embedding else [],
            "embedding_stats": embedding_stats,
            "metadata": metadata,
            "model_used": metadata.get('model_used', 'Unknown')
        }
        
        # Include full embedding if requested
        if include_full_embedding and embedding:
            response_data["embedding_full"] = embedding
        
        return EmbeddingRetrievalResponse(**response_data)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving embedding: {str(e)}"
        )

@router.get("/list", response_model=Dict[str, Any])
async def list_all_embeddings(
    limit: int = Query(10, ge=1, le=100, description="Number of embeddings to return"),
    include_previews: bool = Query(True, description="Include embedding previews")
):
    """
    List all stored embeddings with their metadata
    
    - **limit**: Maximum number of embeddings to return (1-100)
    - **include_previews**: Whether to include embedding previews
    - Returns: List of stored embeddings with metadata
    """
    try:
        # Get collection info
        collection_info = await vector_service.get_collection_info()
        
        # Get all embeddings from Qdrant
        from qdrant_client import QdrantClient
        client = QdrantClient(
            url="https://8483cf56-d075-46f6-9f94-040b9d762203.europe-west3-0.gcp.cloud.qdrant.io:6333",
            api_key="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.ACRMnwXJ6xxFSZZ3nxsu_NgO1RWqHux7qPPPRSuHOXI"
        )
        
        points, _ = client.scroll(
            collection_name="fashion_embeddings",
            limit=limit,
            with_payload=True,
            with_vectors=include_previews
        )
        
        embeddings_list = []
        for point in points:
            embedding_data = {
                "vector_id": str(point.id),
                "filename": point.payload.get('filename', 'Unknown'),
                "model_used": point.payload.get('model_used', 'Unknown'),
                "upload_timestamp": point.payload.get('upload_timestamp', 'Unknown'),
                "file_size": point.payload.get('file_size', 0),
                "content_type": point.payload.get('content_type', 'Unknown'),
                "processing_time": point.payload.get('processing_time', 0)
            }
            
            # Add embedding preview if requested and available
            if include_previews and hasattr(point, 'vector') and point.vector:
                embedding_data["embedding_preview"] = point.vector[:10]  # First 10 values
                embedding_data["embedding_length"] = len(point.vector)
                embedding_data["embedding_stats"] = {
                    "min_value": round(min(point.vector), 6),
                    "max_value": round(max(point.vector), 6),
                    "non_zero_count": sum(1 for x in point.vector if abs(x) > 1e-9)
                }
            
            embeddings_list.append(embedding_data)
        
        return {
            "total_embeddings": len(embeddings_list),
            "collection_info": collection_info,
            "embeddings": embeddings_list,
            "limit_applied": limit,
            "includes_previews": include_previews
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error listing embeddings: {str(e)}"
        )

@router.post("/find-similar-complete", response_model=CompleteSimilarityResponse)
async def find_similar_embeddings_complete(
    file: UploadFile = File(...),
    threshold: float = Query(0.7, ge=0.0, le=1.0, description="Minimum similarity score"),
    limit: int = Query(10, ge=1, le=50, description="Maximum number of similar images to return"),
    include_query_embedding: bool = Query(False, description="Include the query image's full embedding in response")
):
    """
    Upload an image, generate embeddings, find similar images, and return complete embedding data
    
    - **file**: Image file to search for similar images
    - **threshold**: Minimum similarity score (0.0 - 1.0)
    - **limit**: Maximum number of similar images to return (1-50)
    - **include_query_embedding**: Whether to include the query image's full embedding
    - Returns: Complete embedding data for all similar images found
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
        
        # Generate unique query ID
        query_id = str(uuid.uuid4())
        start_time = time.time()
        
        # Generate embeddings for the query image
        try:
            query_embeddings, shape_list = embedding_service.generate_embeddings(content)
            model_info = embedding_service.get_model_info()
            
            # Calculate query embedding statistics
            query_stats = {
                "min_value": round(min(query_embeddings), 6),
                "max_value": round(max(query_embeddings), 6),
                "avg_value": round(sum(query_embeddings) / len(query_embeddings), 6),
                "non_zero_count": sum(1 for x in query_embeddings if x != 0),
                "total_dimensions": len(query_embeddings)
            }
            
            print(f"🔍 DEBUG: Query embedding generated for {file.filename}")
            print(f"   Query ID: {query_id}")
            print(f"   Embedding length: {len(query_embeddings)}")
            print(f"   Preview: {query_embeddings[:5]}")
            
        except Exception as embedding_error:
            raise HTTPException(
                status_code=500,
                detail=f"Error generating embeddings for query image: {str(embedding_error)}"
            )
        
        # Search for similar images in the database
        try:
            similar_results = await vector_service.search_similar_images(
                query_embedding=query_embeddings,
                limit=limit,
                score_threshold=threshold
            )
            
            print(f"🔎 DEBUG: Found {len(similar_results)} similar images")
            
        except Exception as search_error:
            raise HTTPException(
                status_code=500,
                detail=f"Error searching for similar images: {str(search_error)}"
            )
        
        # Retrieve complete embedding data for each similar image
        complete_similar_embeddings = []
        
        for similar_item in similar_results:
            similar_id = str(similar_item['id'])
            similarity_score = similar_item['score']
            metadata = similar_item['metadata']
            
            try:
                # Get the complete embedding data for this similar image
                stored_data = await vector_service.get_stored_embedding(similar_id)
                
                if stored_data and stored_data.get('embedding'):
                    embedding = stored_data['embedding']
                    
                    # Calculate statistics for the similar embedding
                    similar_stats = {
                        "min_value": round(min(embedding), 6),
                        "max_value": round(max(embedding), 6),
                        "avg_value": round(sum(embedding) / len(embedding), 6),
                        "non_zero_count": sum(1 for x in embedding if x != 0),
                        "total_dimensions": len(embedding)
                    }
                    
                    complete_embedding_data = {
                        "vector_id": similar_id,
                        "filename": metadata.get('filename', 'Unknown'),
                        "similarity_score": round(similarity_score, 6),
                        "model_used": metadata.get('model_used', 'Unknown'),
                        "upload_timestamp": metadata.get('upload_timestamp', 'Unknown'),
                        "file_size": metadata.get('file_size', 0),
                        "processing_time": metadata.get('processing_time', 0),
                        "embedding_full": embedding,  # Complete 2048-dimensional embedding
                        "embedding_preview": embedding[:20],  # First 20 values for quick view
                        "embedding_stats": similar_stats,
                        "embedding_shape": [len(embedding)],
                        "metadata": metadata
                    }
                    
                    complete_similar_embeddings.append(complete_embedding_data)
                    
                    print(f"   ✅ Retrieved complete embedding for {metadata.get('filename', 'Unknown')} (score: {similarity_score:.3f})")
                    
            except Exception as retrieval_error:
                print(f"   ⚠️ Could not retrieve embedding for {similar_id}: {str(retrieval_error)}")
                # Still add partial data if embedding retrieval fails
                complete_similar_embeddings.append({
                    "vector_id": similar_id,
                    "filename": metadata.get('filename', 'Unknown'),
                    "similarity_score": round(similarity_score, 6),
                    "error": f"Could not retrieve full embedding: {str(retrieval_error)}",
                    "metadata": metadata
                })
        
        search_time = round(time.time() - start_time, 3)
        
        # Prepare response
        response_data = {
            "query_id": query_id,
            "query_filename": file.filename,
            "query_embedding_preview": query_embeddings[:20],  # First 20 values
            "query_embedding_stats": query_stats,
            "search_time": search_time,
            "total_similar_found": len(complete_similar_embeddings),
            "similarity_threshold": threshold,
            "similar_embeddings": complete_similar_embeddings,
            "message": f"Found {len(complete_similar_embeddings)} similar images for '{file.filename}' with similarity threshold {threshold}. Each result includes complete 2048-dimensional embeddings."
        }
        
        print(f"✅ DEBUG: Complete similarity search finished")
        print(f"   Query: {file.filename}")
        print(f"   Results: {len(complete_similar_embeddings)} similar images")
        print(f"   Search time: {search_time}s")
        
        return CompleteSimilarityResponse(**response_data)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error during similarity search: {str(e)}"
        )



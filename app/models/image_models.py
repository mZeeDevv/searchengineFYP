from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import uuid

class ImageUploadResponse(BaseModel):
    """Response model for image upload operations"""
    id: str
    filename: str
    message: str
    file_size: int
    content_type: str
    
class EmbeddingResponse(BaseModel):
    """Response model for image embedding operations"""
    id: str
    filename: str
    message: str
    embedding_status: str
    processing_time: Optional[float] = None
    embeddings: Optional[List[float]] = None
    embedding_shape: Optional[List[int]] = None
    model_used: Optional[str] = None

class VectorStoreResponse(BaseModel):
    """Response model for vector storage operations"""
    id: str
    vector_id: str
    filename: str
    message: str
    embedding_status: str
    vector_stored: bool
    processing_time: Optional[float] = None
    embeddings_preview: Optional[List[float]] = None
    embedding_shape: Optional[List[int]] = None
    model_used: Optional[str] = None
    embedding_stats: Optional[Dict[str, Any]] = None
    firebase_url: Optional[str] = None
    firebase_path: Optional[str] = None
    firebase_uploaded: Optional[bool] = None
    user_id: Optional[str] = None

class SimilarImageResponse(BaseModel):
    """Response model for similar image search"""
    query_id: str
    similar_images: List[Dict[str, Any]]
    search_time: float
    total_found: int

class ErrorResponse(BaseModel):
    """Error response model"""
    error: str
    detail: str

class EmbeddingRetrievalResponse(BaseModel):
    """Response model for retrieving stored embeddings"""
    vector_id: str
    filename: str
    embedding_status: str
    vector_found: bool
    embeddings_preview: Optional[List[float]] = None
    embedding_full: Optional[List[float]] = None
    embedding_shape: Optional[List[int]] = None
    embedding_stats: Optional[Dict[str, Any]] = None
    metadata: Optional[Dict[str, Any]] = None
    model_used: Optional[str] = None

class CompleteSimilarityResponse(BaseModel):
    """Response model for complete similarity search with full embeddings"""
    query_id: str
    query_filename: str
    query_embedding_preview: Optional[List[float]] = None
    query_embedding_stats: Optional[Dict[str, Any]] = None
    search_time: float
    total_similar_found: int
    similarity_threshold: float
    similar_embeddings: List[Dict[str, Any]]  # Each contains full embedding data
    message: str

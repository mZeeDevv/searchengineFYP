"""
Qdrant Vector Database Service
Handles storing and retrieving image embeddings from Qdrant cloud
"""
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from qdrant_client.http import models
import uuid
from typing import List, Dict, Any, Optional
import logging
import asyncio
import functools
from app.config import config

logger = logging.getLogger(__name__)

class QdrantVectorService:
    def __init__(self):
        """Initialize Qdrant client with cloud credentials from environment"""
        try:
            self.client = QdrantClient(
                url=config.QDRANT_URL,
                api_key=config.QDRANT_API_KEY,
                timeout=30  # Increased timeout for serverless
            )
            self.collection_name = config.QDRANT_COLLECTION_NAME
            self.vector_size = config.VECTOR_SIZE
        except Exception as e:
            logger.error(f"Failed to initialize Qdrant client: {e}")
            # In serverless, we might want to handle this more gracefully
            raise
        
    async def initialize_collection(self):
        """Create the collection if it doesn't exist"""
        try:
            collections = self.client.get_collections()
            collection_names = [col.name for col in collections.collections]
            print(f"🔍 DEBUG: Existing collections: {collection_names}")
            
            if self.collection_name not in collection_names:
                print(f"📁 Creating new collection: {self.collection_name}")
                self.client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=VectorParams(
                        size=self.vector_size,
                        distance=Distance.COSINE
                    )
                )
                logger.info(f"Created new collection: {self.collection_name}")
            else:
                collection_info = self.client.get_collection(self.collection_name)
                print(f"📁 Collection {self.collection_name} exists:")
                print(f"   Vector size: {collection_info.config.params.vectors.size}")
                print(f"   Distance: {collection_info.config.params.vectors.distance}")
                print(f"   Points count: {collection_info.points_count}")
                logger.info(f"Collection {self.collection_name} already exists")
            return True
        except Exception as e:
            logger.error(f"Error initializing collection: {str(e)}")
            print(f"❌ Error initializing collection: {str(e)}")
            return False

    async def store_embedding(
        self,
        embedding: List[float],
        filename: str,
        file_size: int,
        content_type: str,
        processing_time: float,
        model_used: str,
        firebase_url: Optional[str] = None,
        firebase_path: Optional[str] = None,
        user_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """Store image embedding in Qdrant with optional user ID"""
        try:
            point_id = str(uuid.uuid4())
            payload = {
                "filename": filename,
                "file_size": file_size,
                "content_type": content_type,
                "processing_time": processing_time,
                "model_used": model_used,
                "upload_timestamp": "2025-06-24",
                "user_id": user_id  # Store user_id (will be None if not provided)
            }
            
            # Add Firebase information if provided
            if firebase_url:
                payload["firebase_url"] = firebase_url
            if firebase_path:
                payload["firebase_path"] = firebase_path
                
            if metadata:
                payload.update(metadata)

            print(f"🔍 DEBUG: About to store embedding:")
            print(f"   Point ID: {point_id}")
            print(f"   Embedding length: {len(embedding)}")
            print(f"   First 5 values: {embedding[:5]}")
            print(f"   User ID: {user_id if user_id else 'None (anonymous)'}")
            if firebase_url:
                print(f"   Firebase URL: {firebase_url}")
            if firebase_path:
                print(f"   Firebase Path: {firebase_path}")

            # Validation
            if not isinstance(embedding, list) or len(embedding) != self.vector_size:
                raise ValueError(f"❌ Invalid embedding shape. Expected 2048 floats, got {len(embedding)}")
            if any(x is None for x in embedding):
                raise ValueError("❌ Embedding contains None values")

            # Convert to float
            embedding = [float(x) for x in embedding]

            point = PointStruct(
                id=point_id,
                vector=embedding,
                payload=payload
            )

            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(
                None,
                functools.partial(
                    self.client.upsert,
                    collection_name=self.collection_name,
                    points=[point]
                )
            )

            print(f"   ✅ Qdrant upsert result: {result}")
            logger.info(f"Stored embedding for {filename} with ID: {point_id}")
            return point_id

        except Exception as e:
            logger.error(f"Error storing embedding: {str(e)}")
            raise Exception(f"Failed to store embedding in Qdrant: {str(e)}")

    async def search_similar_images(
        self,
        query_embedding: List[float],
        limit: int = 5,
        score_threshold: float = 0.7
    ) -> List[Dict[str, Any]]:
        """Search for similar images using embedding"""
        try:
            search_result = self.client.search(
                collection_name=self.collection_name,
                query_vector=query_embedding,
                limit=limit,
                score_threshold=score_threshold
            )
            results = [
                {
                    "id": hit.id,
                    "score": hit.score,
                    "metadata": hit.payload
                }
                for hit in search_result
            ]
            logger.info(f"Found {len(results)} similar images")
            return results

        except Exception as e:
            logger.error(f"Error searching similar images: {str(e)}")
            raise Exception(f"Failed to search Qdrant: {str(e)}")

    async def get_embedding_by_id(self, point_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific embedding by its ID"""
        try:
            result = self.client.retrieve(
                collection_name=self.collection_name,
                ids=[point_id],
                with_vectors=True
            )
            if result:
                point = result[0]
                return {
                    "id": point.id,
                    "vector": point.vector,
                    "metadata": point.payload
                }
            return None
        except Exception as e:
            logger.error(f"Error retrieving embedding: {str(e)}")
            return None

    async def get_collection_info(self) -> Dict[str, Any]:
        """Get information about the collection"""
        try:
            info = self.client.get_collection(self.collection_name)
            return {
                "name": self.collection_name,
                "vectors_count": info.vectors_count,
                "points_count": info.points_count,
                "status": info.status
            }
        except Exception as e:
            logger.error(f"Error getting collection info: {str(e)}")
            return {}

    async def delete_embedding(self, point_id: str) -> bool:
        """Delete an embedding by its ID"""
        try:
            self.client.delete(
                collection_name=self.collection_name,
                points_selector=models.PointIdsList(points=[point_id])
            )
            logger.info(f"Deleted embedding with ID: {point_id}")
            return True
        except Exception as e:
            logger.error(f"Error deleting embedding: {str(e)}")
            return False

    async def get_stored_embedding(self, vector_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve a stored embedding by its vector ID"""
        try:
            points = self.client.retrieve(
                collection_name=self.collection_name,
                ids=[vector_id],
                with_vectors=True,
                with_payload=True
            )
            if points:
                point = points[0]
                return {
                    "vector_id": str(point.id),
                    "embedding": point.vector,
                    "metadata": point.payload,
                    "embedding_length": len(point.vector) if point.vector else 0
                }
            return None
        except Exception as e:
            logger.error(f"Error retrieving embedding {vector_id}: {str(e)}")
            return None

# Global instance
vector_service = QdrantVectorService()

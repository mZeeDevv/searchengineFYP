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
from datetime import datetime
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
            self.search_embeddings_collection = "user_search_embeddings"  # New collection for search history
            self.vector_size = config.VECTOR_SIZE
        except Exception as e:
            logger.error(f"Failed to initialize Qdrant client: {e}")
            # In serverless, we might want to handle this more gracefully
            raise
        
    async def initialize_collection(self):
        """Create the collections if they don't exist"""
        try:
            collections = self.client.get_collections()
            collection_names = [col.name for col in collections.collections]
            print(f"🔍 DEBUG: Existing collections: {collection_names}")
            
            # Initialize main fashion embeddings collection
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
            
            # Initialize search embeddings collection
            if self.search_embeddings_collection not in collection_names:
                print(f"📁 Creating new search embeddings collection: {self.search_embeddings_collection}")
                self.client.create_collection(
                    collection_name=self.search_embeddings_collection,
                    vectors_config=VectorParams(
                        size=self.vector_size,
                        distance=Distance.COSINE
                    )
                )
                
                # Create payload index for user_uid field to enable filtering
                print(f"📇 Creating payload index for user_uid field...")
                self.client.create_payload_index(
                    collection_name=self.search_embeddings_collection,
                    field_name="user_uid",
                    field_schema=models.PayloadSchemaType.KEYWORD
                )
                
                logger.info(f"Created new search embeddings collection: {self.search_embeddings_collection}")
            else:
                search_collection_info = self.client.get_collection(self.search_embeddings_collection)
                print(f"📁 Search embeddings collection {self.search_embeddings_collection} exists:")
                print(f"   Vector size: {search_collection_info.config.params.vectors.size}")
                print(f"   Distance: {search_collection_info.config.params.vectors.distance}")
                print(f"   Points count: {search_collection_info.points_count}")
                
                # Check if payload index exists, create if not
                try:
                    collection_info = self.client.get_collection(self.search_embeddings_collection)
                    payload_indices = collection_info.payload_schema
                    if "user_uid" not in payload_indices:
                        print(f"📇 Creating missing payload index for user_uid field...")
                        self.client.create_payload_index(
                            collection_name=self.search_embeddings_collection,
                            field_name="user_uid",
                            field_schema=models.PayloadSchemaType.KEYWORD
                        )
                        print(f"✅ Payload index for user_uid created")
                    else:
                        print(f"✅ Payload index for user_uid already exists")
                except Exception as index_error:
                    print(f"⚠️ Could not check/create payload index: {index_error}")
                
                logger.info(f"Search embeddings collection {self.search_embeddings_collection} already exists")
                
            return True
        except Exception as e:
            logger.error(f"Error initializing collections: {str(e)}")
            print(f"❌ Error initializing collections: {str(e)}")
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
        price: Optional[float] = None,
        product_name: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """Store image embedding in Qdrant with price and product name"""
        try:
            point_id = str(uuid.uuid4())
            payload = {
                "filename": filename,
                "file_size": file_size,
                "content_type": content_type,
                "processing_time": processing_time,
                "model_used": model_used,
                "upload_timestamp": datetime.now().strftime("%Y-%m-%d"),
                "price": price,  # Store price
                "product_name": product_name  # Store product name
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
            print(f"   Product Name: {product_name}" if product_name else "   Product Name: Not specified")
            print(f"   Price: ${price:.2f}" if price else "   Price: Not specified")
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

    async def get_vector(self, vector_id: str) -> Optional[Dict[str, Any]]:
        """Get a vector by its ID (alias for get_stored_embedding)"""
        return await self.get_stored_embedding(vector_id)

    async def delete_vector(self, vector_id: str) -> bool:
        """Delete a vector by its ID (alias for delete_embedding)"""
        return await self.delete_embedding(vector_id)

    async def list_all_embeddings(self, limit: int = 100, offset: int = 0) -> List[Dict[str, Any]]:
        """List all stored embeddings with metadata"""
        try:
            # Use scroll to get all points with pagination
            points, _ = self.client.scroll(
                collection_name=self.collection_name,
                limit=limit,
                offset=offset,
                with_payload=True,
                with_vectors=False  # Don't return vectors for performance
            )
            
            results = []
            for point in points:
                # Convert point to dictionary format
                embedding_data = {
                    "vector_id": str(point.id),
                    "filename": point.payload.get("filename", "Unknown"),
                    "product_name": point.payload.get("product_name"),
                    "price": point.payload.get("price"),
                    "file_size": point.payload.get("file_size"),
                    "content_type": point.payload.get("content_type"),
                    "processing_time": point.payload.get("processing_time"),
                    "model_used": point.payload.get("model_used"),
                    "upload_timestamp": point.payload.get("upload_timestamp"),
                    "firebase_url": point.payload.get("firebase_url"),
                    "firebase_path": point.payload.get("firebase_path")
                }
                results.append(embedding_data)
            
            logger.info(f"Listed {len(results)} embeddings (limit: {limit}, offset: {offset})")
            return results
            
        except Exception as e:
            logger.error(f"Error listing embeddings: {str(e)}")
            raise Exception(f"Failed to list embeddings from Qdrant: {str(e)}")

    async def retrieve_embedding(self, vector_id: str, include_vector: bool = False) -> Optional[Dict[str, Any]]:
        """Retrieve a specific embedding by its vector ID"""
        try:
            points = self.client.retrieve(
                collection_name=self.collection_name,
                ids=[vector_id],
                with_vectors=include_vector,
                with_payload=True
            )
            
            if not points:
                return None
                
            point = points[0]
            result = {
                "vector_id": str(point.id),
                "filename": point.payload.get("filename", "Unknown"),
                "product_name": point.payload.get("product_name"),
                "embedding_status": "found",
                "vector_found": True,
                "metadata": point.payload,
                "model_used": point.payload.get("model_used")
            }
            
            if include_vector:
                result["embedding_full"] = point.vector
                result["embedding_shape"] = [len(point.vector)] if point.vector else [0]
                if point.vector:
                    result["embedding_stats"] = {
                        "min_value": round(min(point.vector), 6),
                        "max_value": round(max(point.vector), 6),
                        "avg_value": round(sum(point.vector) / len(point.vector), 6),
                        "non_zero_count": sum(1 for x in point.vector if x != 0),
                        "total_dimensions": len(point.vector)
                    }
            else:
                result["embeddings_preview"] = point.vector[:100] if point.vector else []
                
            return result
            
        except Exception as e:
            logger.error(f"Error retrieving embedding {vector_id}: {str(e)}")
            return None

    async def search_similar_complete(self, query_embedding: List[float], limit: int = 5, score_threshold: float = 0.7, include_embeddings: bool = False) -> List[Dict[str, Any]]:
        """Search for similar images with complete embedding data"""
        try:
            search_result = self.client.search(
                collection_name=self.collection_name,
                query_vector=query_embedding,
                limit=limit,
                score_threshold=score_threshold,
                with_payload=True,
                with_vectors=include_embeddings
            )
            
            results = []
            for hit in search_result:
                result_data = {
                    "vector_id": str(hit.id),
                    "similarity_score": round(hit.score, 6),
                    "filename": hit.payload.get("filename", "Unknown"),
                    "product_name": hit.payload.get("product_name"),
                    "price": hit.payload.get("price"),
                    "firebase_url": hit.payload.get("firebase_url"),
                    "metadata": hit.payload
                }
                
                if include_embeddings and hit.vector:
                    result_data["embedding"] = hit.vector
                    result_data["embedding_stats"] = {
                        "min_value": round(min(hit.vector), 6),
                        "max_value": round(max(hit.vector), 6),
                        "avg_value": round(sum(hit.vector) / len(hit.vector), 6),
                        "non_zero_count": sum(1 for x in hit.vector if x != 0),
                        "total_dimensions": len(hit.vector)
                    }
                    
                results.append(result_data)
            
            logger.info(f"Complete search found {len(results)} similar images")
            return results
            
        except Exception as e:
            logger.error(f"Error in complete similarity search: {str(e)}")
            raise Exception(f"Failed to perform complete similarity search: {str(e)}")

    async def store_search_embedding(
        self,
        embedding: List[float],
        user_uid: str,
        search_query_filename: str,
        similar_results_count: int,
        search_timestamp: str = None
    ) -> str:
        """Store user search embedding for future recommendations"""
        try:
            point_id = str(uuid.uuid4())
            
            if search_timestamp is None:
                from datetime import datetime
                search_timestamp = datetime.now().isoformat()
            
            payload = {
                "user_uid": user_uid,
                "search_query_filename": search_query_filename,
                "similar_results_count": similar_results_count,
                "search_timestamp": search_timestamp,
                "search_type": "similarity_search"
            }
            
            print(f"🔍 DEBUG: Storing search embedding:")
            print(f"   User UID: {user_uid}")
            print(f"   Query filename: {search_query_filename}")
            print(f"   Similar results found: {similar_results_count}")
            print(f"   Search timestamp: {search_timestamp}")
            print(f"   Embedding length: {len(embedding)}")
            
            # Validation
            if not isinstance(embedding, list) or len(embedding) != self.vector_size:
                raise ValueError(f"❌ Invalid embedding shape. Expected {self.vector_size} floats, got {len(embedding)}")
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
                    collection_name=self.search_embeddings_collection,
                    points=[point]
                )
            )

            print(f"   ✅ Search embedding stored with ID: {point_id}")
            logger.info(f"Stored search embedding for user {user_uid} with ID: {point_id}")
            return point_id

        except Exception as e:
            logger.error(f"Error storing search embedding: {str(e)}")
            raise Exception(f"Failed to store search embedding in Qdrant: {str(e)}")

    async def store_user_search_embedding(
        self, 
        user_id: str, 
        query_filename: str, 
        query_embedding: List[float], 
        similar_results_count: int
    ):
        """Store user search embedding for future recommendations"""
        try:
            from datetime import datetime
            
            # Generate unique ID for the search entry
            search_id = str(uuid.uuid4())
            
            # Create point data
            point_data = PointStruct(
                id=search_id,
                vector=query_embedding,
                payload={
                    "user_uid": user_id,
                    "search_query_filename": query_filename,
                    "similar_results_count": similar_results_count,
                    "search_timestamp": datetime.utcnow().isoformat(),
                    "search_type": "user_search"
                }
            )
            
            # Store in Qdrant
            result = self.client.upsert(
                collection_name=self.search_embeddings_collection,
                points=[point_data]
            )
            
            logger.info(f"Stored user search embedding for user {user_id}, search_id: {search_id}")
            return {
                "search_id": search_id,
                "status": "stored",
                "user_uid": user_id,
                "similar_results_count": similar_results_count
            }
            
        except Exception as e:
            logger.error(f"Error storing user search embedding: {str(e)}")
            raise Exception(f"Failed to store user search embedding: {str(e)}")

    async def get_user_search_history(self, user_uid: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Get user's search history for recommendations"""
        try:
            # Use scroll to get user's search history
            points, _ = self.client.scroll(
                collection_name=self.search_embeddings_collection,
                scroll_filter=models.Filter(
                    must=[
                        models.FieldCondition(
                            key="user_uid",
                            match=models.MatchValue(value=user_uid)
                        )
                    ]
                ),
                limit=limit,
                with_payload=True,
                with_vectors=True
            )
            
            results = []
            for point in points:
                search_data = {
                    "search_id": str(point.id),
                    "user_uid": point.payload.get("user_uid"),
                    "search_query_filename": point.payload.get("search_query_filename"),
                    "similar_results_count": point.payload.get("similar_results_count"),
                    "search_timestamp": point.payload.get("search_timestamp"),
                    "search_type": point.payload.get("search_type"),
                    "embedding": point.vector
                }
                results.append(search_data)
            
            # Sort by search_timestamp (most recent first)
            results.sort(key=lambda x: x.get("search_timestamp", ""), reverse=True)
            
            logger.info(f"Retrieved {len(results)} search history entries for user {user_uid}")
            return results
            
        except Exception as e:
            logger.error(f"Error retrieving user search history: {str(e)}")
            raise Exception(f"Failed to retrieve user search history: {str(e)}")

    async def get_user_recommendations(self, user_uid: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Get product recommendations based on user's search history"""
        try:
            # First, get user's search history
            search_history = await self.get_user_search_history(user_uid, limit=10)
            
            if not search_history:
                logger.info(f"No search history found for user {user_uid}")
                return []
            
            # Get the most recent search embeddings (last 3 searches)
            recent_searches = search_history[:3]
            recommendations = []
            
            for search in recent_searches:
                if search.get("embedding"):
                    # Search for similar products based on this search embedding
                    similar_products = await self.search_similar_images(
                        query_embedding=search["embedding"],
                        limit=10,  # Get more to have variety
                        score_threshold=0.5  # Lower threshold for recommendations
                    )
                    
                    # Add search context to each recommendation
                    for product in similar_products:
                        product["recommendation_source"] = {
                            "search_id": search["search_id"],
                            "search_filename": search["search_query_filename"],
                            "search_timestamp": search["search_timestamp"]
                        }
                        recommendations.append(product)
            
            # Remove duplicates based on product ID and sort by score
            seen_ids = set()
            unique_recommendations = []
            
            for rec in recommendations:
                if rec["id"] not in seen_ids:
                    seen_ids.add(rec["id"])
                    unique_recommendations.append(rec)
            
            # Sort by similarity score (highest first)
            unique_recommendations.sort(key=lambda x: x["score"], reverse=True)
            
            # Return top recommendations
            final_recommendations = unique_recommendations[:limit]
            
            logger.info(f"Generated {len(final_recommendations)} recommendations for user {user_uid}")
            return final_recommendations
            
        except Exception as e:
            logger.error(f"Error generating recommendations for user {user_uid}: {str(e)}")
            raise Exception(f"Failed to generate recommendations: {str(e)}")

# Global instance
vector_service = QdrantVectorService()

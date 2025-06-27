"""
Test script to verify user search embeddings functionality
"""
import asyncio
from app.services.vector_service import vector_service
from app.services.embedding_service import embedding_service
import numpy as np

async def test_user_search_embeddings():
    """Test storing and retrieving user search embeddings"""
    try:
        print("🧪 Testing user search embeddings functionality...")
        
        # Initialize collections
        await vector_service.initialize_collection()
        
        # Generate dummy embeddings (simulating a real search)
        dummy_embedding = np.random.rand(2048).tolist()
        
        # Test data
        test_user_id = "test_user_123"
        test_filename = "test_search_image.jpg"
        test_similar_count = 5
        
        print(f"📤 Storing search embedding for user: {test_user_id}")
        store_result = await vector_service.store_user_search_embedding(
            user_id=test_user_id,
            query_filename=test_filename,
            query_embedding=dummy_embedding,
            similar_results_count=test_similar_count
        )
        
        print(f"✅ Store result: {store_result}")
        
        # Retrieve search history
        print(f"📥 Retrieving search history for user: {test_user_id}")
        search_history = await vector_service.get_user_search_history(test_user_id, limit=5)
        
        print(f"✅ Found {len(search_history)} search history entries")
        for entry in search_history:
            print(f"  - Search ID: {entry['search_id']}")
            print(f"    Filename: {entry['search_query_filename']}")
            print(f"    Similar results: {entry['similar_results_count']}")
            print(f"    Timestamp: {entry['search_timestamp']}")
        
        print("🎉 User search embeddings test completed successfully!")
        
    except Exception as e:
        print(f"❌ Test failed: {str(e)}")
        raise

if __name__ == "__main__":
    asyncio.run(test_user_search_embeddings())

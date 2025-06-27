"""
Test script to create a user with search history and then test recommendations
"""
import asyncio
from app.services.vector_service import vector_service
import numpy as np
import requests

async def create_user_with_search_history():
    """Create a user with multiple search history entries"""
    try:
        print("🔧 Setting up test user with search history...")
        
        # Initialize collections
        await vector_service.initialize_collection()
        
        # Test user ID
        test_user_id = "test_user_with_history"
        
        # Create multiple search history entries
        search_entries = [
            {"filename": "red_dress.jpg", "similar_count": 8},
            {"filename": "blue_jeans.jpg", "similar_count": 6},
            {"filename": "white_shirt.jpg", "similar_count": 4},
            {"filename": "black_shoes.jpg", "similar_count": 7},
            {"filename": "summer_dress.jpg", "similar_count": 5},
        ]
        
        print(f"📤 Creating {len(search_entries)} search history entries...")
        
        for i, entry in enumerate(search_entries):
            # Generate unique embeddings for each search
            dummy_embedding = np.random.rand(2048).tolist()
            
            # Store search embedding
            result = await vector_service.store_user_search_embedding(
                user_id=test_user_id,
                query_filename=entry["filename"],
                query_embedding=dummy_embedding,
                similar_results_count=entry["similar_count"]
            )
            
            print(f"   ✅ Created search entry {i+1}: {entry['filename']} -> {result['search_id']}")
        
        print(f"🎯 Testing recommendations for user with search history...")
        
        # Test recommendations API
        response = requests.get(
            f'http://localhost:8000/api/v1/vectors/recommendations/{test_user_id}?limit=10',
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Recommendations API successful!")
            print(f"   User ID: {result['user_id']}")
            print(f"   Total recommendations: {result['total_found']}")
            print(f"   Message: {result['message']}")
            
            # Show first few recommendations
            for i, rec in enumerate(result['recommendations'][:5]):
                print(f"   Recommendation {i+1}:")
                print(f"     Product: {rec.get('product_name', 'N/A')}")
                price = rec.get('price')
                if price is not None:
                    print(f"     Price: ${price:.2f}")
                else:
                    print(f"     Price: N/A")
                print(f"     Match Score: {(rec.get('score', 0) * 100):.1f}%")
                if rec.get('recommendation_source'):
                    source = rec['recommendation_source']
                    print(f"     Based on: {source.get('search_filename', 'N/A')}")
                print()
            
        else:
            print(f"❌ API failed: {response.status_code} - {response.text}")
        
        print("🎉 Test completed successfully!")
        
    except Exception as e:
        print(f"❌ Test failed: {str(e)}")
        raise

if __name__ == "__main__":
    asyncio.run(create_user_with_search_history())

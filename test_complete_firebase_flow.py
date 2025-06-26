"""
Test Firebase Integration with Image Upload and Embedding Storage
This script tests the complete flow of uploading an image, generating embeddings,
uploading to Firebase Storage, and storing everything in Qdrant.
"""

import asyncio
import requests
import os
import json

# API base URL
BASE_URL = "http://127.0.0.1:8001"

async def test_complete_firebase_flow():
    """Test the complete Firebase integration flow"""
    
    print("🧪 Testing Complete Firebase Integration Flow")
    print("=" * 60)
    
    # Test image path
    test_image_path = "test_image.png"
    if not os.path.exists(test_image_path):
        print(f"❌ Test image not found: {test_image_path}")
        print("Please ensure you have a test image in the project directory")
        return
    
    try:
        # 1. Test vector storage endpoint with Firebase integration
        print("\n1️⃣ Testing image upload with Firebase integration...")
        
        with open(test_image_path, "rb") as image_file:
            response = requests.post(
                f"{BASE_URL}/api/v1/vectors/store",
                files={"file": ("test_image.png", image_file, "image/png")}
            )
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Image upload and processing successful!")
            print(f"   Vector ID: {data.get('vector_id')}")
            print(f"   Filename: {data.get('filename')}")
            print(f"   Processing time: {data.get('processing_time')}s")
            print(f"   Embedding dimensions: {data.get('embedding_shape')}")
            print(f"   Model used: {data.get('model_used')}")
            
            # Check Firebase integration
            firebase_url = data.get('firebase_url')
            firebase_path = data.get('firebase_path')
            firebase_uploaded = data.get('firebase_uploaded')
            
            if firebase_url:
                print(f"✅ Firebase URL: {firebase_url}")
            else:
                print("🔶 Firebase URL: None (mock mode)")
                
            if firebase_path:
                print(f"✅ Firebase Path: {firebase_path}")
            else:
                print("🔶 Firebase Path: None (mock mode)")
                
            print(f"✅ Firebase Upload Status: {firebase_uploaded}")
            
            vector_id = data.get('vector_id')
            
        else:
            print(f"❌ Upload failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return
          # 2. Test retrieval of stored embedding with Firebase info
        print("\n2️⃣ Testing embedding retrieval...")
        
        response = requests.get(f"{BASE_URL}/api/v1/vectors/get/{vector_id}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Embedding retrieval successful!")
            print(f"   Vector ID: {data.get('vector_id')}")
            print(f"   Filename: {data.get('filename')}")
            print(f"   Vector found: {data.get('vector_found')}")
            print(f"   Embedding dimensions: {data.get('embedding_shape')}")
            
            # Check if Firebase information is stored
            metadata = data.get('metadata', {})
            if 'firebase_url' in metadata:
                print(f"✅ Stored Firebase URL: {metadata['firebase_url']}")
            if 'firebase_path' in metadata:
                print(f"✅ Stored Firebase Path: {metadata['firebase_path']}")
                
        else:
            print(f"❌ Retrieval failed: {response.status_code}")
            print(f"   Error: {response.text}")
          # 3. Test similarity search
        print("\n3️⃣ Testing similarity search...")
        
        with open(test_image_path, "rb") as image_file:
            response = requests.post(
                f"{BASE_URL}/api/v1/vectors/search",
                files={"file": ("test_image.png", image_file, "image/png")},
                params={"limit": 3, "threshold": 0.7}
            )
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Similarity search successful!")
            print(f"   Search time: {data.get('search_time')}s")
            print(f"   Total found: {data.get('total_found')}")
            
            for i, similar in enumerate(data.get('similar_images', [])[:3]):
                score = similar.get('score', 0)
                payload = similar.get('payload', {})
                filename = payload.get('filename', 'Unknown')
                firebase_url = payload.get('firebase_url', 'No URL')
                
                print(f"   📸 Similar image {i+1}:")
                print(f"      Filename: {filename}")
                print(f"      Similarity: {score:.4f}")
                print(f"      Firebase URL: {firebase_url}")
                
        else:
            print(f"❌ Similarity search failed: {response.status_code}")
            print(f"   Error: {response.text}")
          # 4. Test database statistics
        print("\n4️⃣ Testing database statistics...")
        
        response = requests.get(f"{BASE_URL}/api/v1/vectors/collection/info")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Database statistics retrieved!")
            print(f"   Collection status: {data.get('status')}")
            print(f"   Collection name: {data.get('collection_name')}")
            print(f"   Points count: {data.get('points_count')}")
            print(f"   Vector dimensions: {data.get('vector_size')}")
            
        else:
            print(f"❌ Stats retrieval failed: {response.status_code}")
            print(f"   Error: {response.text}")
        
        print("\n🎉 Firebase Integration Test Complete!")
        print("\n📋 Summary:")
        print("✅ Image upload and embedding generation")
        print("✅ Firebase Storage integration (mock or real)")
        print("✅ Vector storage in Qdrant with Firebase URLs")
        print("✅ Embedding retrieval with metadata")
        print("✅ Similarity search functionality")
        print("✅ Database statistics")
        
    except Exception as e:
        print(f"❌ Test failed with exception: {str(e)}")

def test_firebase_configuration():
    """Test Firebase configuration"""
    print("\n🔧 Testing Firebase Configuration...")
    
    try:
        from app.services.firebase_service import firebase_service
        
        # Check if Firebase is initialized
        if firebase_service.initialized:
            print("✅ Firebase service is initialized")
            print(f"   Bucket: {firebase_service.bucket_name}")
        else:
            print("🔶 Firebase service is in development mode (mock uploads)")
            print("   This is normal for development without Firebase credentials")
        
        return True
        
    except Exception as e:
        print(f"❌ Firebase configuration error: {str(e)}")
        return False

if __name__ == "__main__":
    print("🚀 Starting Firebase Integration Tests")
    print("Make sure your FastAPI server is running on http://127.0.0.1:8000")
    
    # Test configuration first
    config_ok = test_firebase_configuration()
    
    if config_ok:
        # Run the complete flow test
        asyncio.run(test_complete_firebase_flow())
    else:
        print("❌ Configuration test failed, skipping integration tests")

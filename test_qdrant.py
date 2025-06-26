"""
Test Qdrant Vector Database Integration
"""
import requests
import json
from PIL import Image
import io
import numpy as np

def create_test_image():
    """Create a simple test image"""
    img_array = np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8)
    img = Image.fromarray(img_array)
    
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='JPEG')
    img_bytes.seek(0)
    
    return img_bytes.getvalue()

def test_vector_storage():
    """Test storing an image in Qdrant vector database"""
    print("🔍 Testing Qdrant vector storage...")
    
    try:
        image_data = create_test_image()
        
        files = {
            'file': ('test_fashion_image.jpg', image_data, 'image/jpeg')
        }
        
        response = requests.post("http://localhost:8000/api/v1/vectors/store", files=files)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Success! Image stored in Qdrant:")
            print(f"   Processing ID: {result['id']}")
            print(f"   Vector ID: {result['vector_id']}")
            print(f"   Vector Stored: {result['vector_stored']}")
            print(f"   Model Used: {result.get('model_used', 'N/A')}")
            print(f"   Processing Time: {result.get('processing_time', 'N/A')} seconds")
            
            return result['vector_id']
        else:
            error_detail = response.json() if response.headers.get('content-type') == 'application/json' else response.text
            print(f"❌ Error: {error_detail}")
            return None
            
    except Exception as e:
        print(f"❌ Request failed: {str(e)}")
        return None

def test_similarity_search():
    """Test searching for similar images"""
    print("\n🔍 Testing similarity search...")
    
    try:
        image_data = create_test_image()
        
        files = {
            'file': ('query_image.jpg', image_data, 'image/jpeg')
        }
        
        # Search with limit=5 and threshold=0.5
        response = requests.post("http://localhost:8000/api/v1/vectors/search?limit=5&threshold=0.5", files=files)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Success! Similarity search completed:")
            print(f"   Query ID: {result['query_id']}")
            print(f"   Similar Images Found: {result['total_found']}")
            print(f"   Search Time: {result['search_time']} seconds")
            
            if result['similar_images']:
                print("   Top Results:")
                for i, img in enumerate(result['similar_images'][:3]):
                    print(f"     {i+1}. Similarity: {img['score']:.3f}, Filename: {img['metadata']['filename']}")
            else:
                print("   No similar images found (database might be empty)")
            
            return True
        else:
            error_detail = response.json() if response.headers.get('content-type') == 'application/json' else response.text
            print(f"❌ Error: {error_detail}")
            return False
            
    except Exception as e:
        print(f"❌ Request failed: {str(e)}")
        return False

def test_database_info():
    """Test getting database information"""
    print("\n🔍 Testing database info...")
    
    try:
        response = requests.get("http://localhost:8000/api/v1/vectors/collection/info")
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Success! Database info retrieved:")
            print(f"   Collection: {result['collection_name']}")
            print(f"   Status: {result['status']}")
            print(f"   Info: {result['info']}")
            
            return True
        else:
            print(f"❌ Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Request failed: {str(e)}")
        return False

def test_health_check():
    """Test vector service health"""
    print("\n🔍 Testing vector service health...")
    
    try:
        response = requests.get("http://localhost:8000/api/v1/vectors/health")
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Vector service health check:")
            print(f"   Status: {result['status']}")
            print(f"   Service: {result['service']}")
            print(f"   Qdrant Connection: {result.get('qdrant_connection', 'unknown')}")
            
            return True
        else:
            print(f"❌ Health check failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Request failed: {str(e)}")
        return False

if __name__ == "__main__":
    print("🚀 Testing Fashion FYP Qdrant Vector Database Integration")
    print("=" * 60)
    
    # Test health check first
    health_ok = test_health_check()
    
    if health_ok:
        # Test storing an image
        vector_id = test_vector_storage()
        
        # Test database info
        test_database_info()
        
        # Test similarity search
        test_similarity_search()
        
        print("\n🎉 Qdrant integration tests completed!")
        print("🌐 Open http://localhost:8000 to use the full vector database interface!")
        print("📊 You can now:")
        print("   - Store fashion images as embeddings")
        print("   - Search for similar images")
        print("   - View database statistics")
    else:
        print("\n❌ Vector service health check failed. Please check the Qdrant connection.")

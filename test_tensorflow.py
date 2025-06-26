"""
Test the new TensorFlow embeddings endpoint
"""
import requests
import json

# Test with a small sample image
def test_embeddings_endpoint():
    """Test the embeddings endpoint with TensorFlow"""
    print("🔍 Testing TensorFlow embeddings endpoint...")
    
    # Create a simple test image file
    test_image_content = b"fake_image_content_for_testing"
    
    files = {
        'file': ('test_fashion_image.jpg', test_image_content, 'image/jpeg')
    }
    
    try:
        response = requests.post("http://localhost:8000/api/v1/getembeddings", files=files)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Success! TensorFlow embeddings generated:")
            print(f"   Processing ID: {result['id']}")
            print(f"   Model Used: {result.get('model_used', 'N/A')}")
            print(f"   Embedding Shape: {result.get('embedding_shape', 'N/A')}")
            print(f"   Processing Time: {result.get('processing_time', 'N/A')} seconds")
            print(f"   Status: {result.get('embedding_status', 'N/A')}")
            
            if result.get('embeddings'):
                print(f"   First 10 embedding values: {result['embeddings'][:10]}")
            
            return True
        else:
            print(f"❌ Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Request failed: {str(e)}")
        return False

if __name__ == "__main__":
    print("🚀 Testing Fashion FYP TensorFlow Integration")
    print("=" * 50)
    
    success = test_embeddings_endpoint()
    
    if success:
        print("\n🎉 TensorFlow integration is working!")
        print("🌐 Open http://localhost:8000 to use the web interface")
    else:
        print("\n❌ There was an issue with the integration")

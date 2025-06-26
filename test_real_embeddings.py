"""
Test the new TensorFlow embeddings endpoint with a real image
"""
import requests
import json
from PIL import Image
import io
import numpy as np

def create_test_image():
    """Create a simple test image"""
    # Create a simple 224x224 RGB image
    img_array = np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8)
    img = Image.fromarray(img_array)
    
    # Save to bytes
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='JPEG')
    img_bytes.seek(0)
    
    return img_bytes.getvalue()

def test_embeddings_endpoint():
    """Test the embeddings endpoint with TensorFlow"""
    print("🔍 Testing TensorFlow embeddings endpoint...")
    
    try:
        # Create a real test image
        image_data = create_test_image()
        
        files = {
            'file': ('test_image.jpg', image_data, 'image/jpeg')
        }
        
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
                embeddings = result['embeddings']
                print(f"   Number of embedding values shown: {len(embeddings)}")
                print(f"   First 5 embedding values: {embeddings[:5]}")
                print(f"   Embedding range: {min(embeddings):.4f} to {max(embeddings):.4f}")
            
            return True
        else:
            error_detail = response.json() if response.headers.get('content-type') == 'application/json' else response.text
            print(f"❌ Error: {error_detail}")
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
        print("📊 Upload any fashion image to see real embeddings!")
    else:
        print("\n❌ There was an issue with the integration")

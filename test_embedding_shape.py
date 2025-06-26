"""
Test the fixed embedding shape
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

def test_embedding_shape():
    """Test that embedding shape is correctly reported"""
    print("🔍 Testing embedding shape fix...")
    
    try:
        image_data = create_test_image()
        
        files = {
            'file': ('test_shape_fix.jpg', image_data, 'image/jpeg')
        }
        
        # Test regular embeddings endpoint first
        response = requests.post("http://localhost:8000/api/v1/getembeddings", files=files)
        print(f"Embeddings endpoint status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Regular embeddings endpoint:")
            print(f"   Embedding Shape: {result.get('embedding_shape', 'N/A')}")
            print(f"   Expected: [2048] (not [1, 2048])")
            
            # Check if shape is correct
            shape = result.get('embedding_shape', [])
            if shape == [2048]:
                print("   ✅ Shape is CORRECT!")
            elif shape == [1, 2048]:
                print("   ❌ Shape still has batch dimension")
            else:
                print(f"   ⚠️ Unexpected shape: {shape}")
        
        # Test vector storage endpoint
        files_fresh = {
            'file': ('test_vector_shape.jpg', create_test_image(), 'image/jpeg')
        }
        
        response = requests.post("http://localhost:8000/api/v1/vectors/store", files=files_fresh)
        print(f"\nVector storage endpoint status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Vector storage endpoint:")
            print(f"   Embedding Shape: {result.get('embedding_shape', 'N/A')}")
            print(f"   Vector Stored: {result.get('vector_stored', False)}")
            print(f"   Vector ID: {result.get('vector_id', 'N/A')}")
            
            # Check if shape is correct
            shape = result.get('embedding_shape', [])
            if shape == [2048]:
                print("   ✅ Vector storage shape is CORRECT!")
                return True
            elif shape == [1, 2048]:
                print("   ❌ Vector storage shape still has batch dimension")
                return False
            else:
                print(f"   ⚠️ Unexpected vector storage shape: {shape}")
                return False
        else:
            error_detail = response.json() if response.headers.get('content-type') == 'application/json' else response.text
            print(f"❌ Vector storage error: {error_detail}")
            return False
            
    except Exception as e:
        print(f"❌ Request failed: {str(e)}")
        return False

if __name__ == "__main__":
    print("🚀 Testing Embedding Shape Fix")
    print("=" * 40)
    
    success = test_embedding_shape()
    
    if success:
        print("\n🎉 Embedding shape fix is working correctly!")
        print("✅ Shape is now [2048] instead of [1, 2048]")
        print("🌐 Open http://localhost:8000 to test with the UI")
    else:
        print("\n❌ Shape fix needs more work")

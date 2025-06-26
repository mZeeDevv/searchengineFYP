#!/usr/bin/env python3
"""
Debug script to test the vector store endpoint
"""
import requests
import json
from pathlib import Path

def test_vector_store():
    """Test the vector store endpoint"""
    
    # Create a simple test image file (we'll use a small PNG)
    test_image_path = Path(__file__).parent / "test_image.png"
    
    # If test image doesn't exist, create a minimal one
    if not test_image_path.exists():
        from PIL import Image
        import numpy as np
        
        # Create a simple 100x100 colored image
        img_array = np.random.randint(0, 255, (100, 100, 3), dtype=np.uint8)
        img = Image.fromarray(img_array)
        img.save(test_image_path)
        print(f"Created test image: {test_image_path}")
    
    # Test the vector store endpoint
    url = "http://localhost:8000/api/v1/vectors/store"
    
    with open(test_image_path, 'rb') as f:
        files = {'file': ('test_image.png', f, 'image/png')}
        
        try:
            print("Testing vector store endpoint...")
            response = requests.post(url, files=files, timeout=30)
            
            print(f"Status Code: {response.status_code}")
            print(f"Response Headers: {dict(response.headers)}")
            
            if response.status_code == 200:
                data = response.json()
                print("\n=== SUCCESS ===")
                print(f"Processing ID: {data.get('id')}")
                print(f"Vector ID: {data.get('vector_id')}")
                print(f"Filename: {data.get('filename')}")
                print(f"Message: {data.get('message')}")
                print(f"Embedding Status: {data.get('embedding_status')}")
                print(f"Vector Stored: {data.get('vector_stored')}")
                print(f"Processing Time: {data.get('processing_time')}s")
                print(f"Embedding Shape: {data.get('embedding_shape')}")
                print(f"Model Used: {data.get('model_used')}")
                
                # Show first few embedding values
                preview = data.get('embeddings_preview', [])
                if preview:
                    print(f"Embedding Preview (first 10): {preview[:10]}")
                    print(f"Total preview length: {len(preview)}")
                else:
                    print("ERROR: No embedding preview returned!")
                
            else:
                print(f"\n=== ERROR ===")
                print(f"Status: {response.status_code}")
                print(f"Response: {response.text}")
                
        except Exception as e:
            print(f"Request failed: {e}")

if __name__ == "__main__":
    test_vector_store()

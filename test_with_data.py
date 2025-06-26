"""
Add some test data and then test retrieval
"""
import requests
from PIL import Image, ImageDraw
import io

def add_test_data():
    print("📤 Adding Test Data to Database")
    print("=" * 40)
    
    base_url = "http://localhost:8002"
    
    # Create test images
    test_images = []
    
    # Red circle
    img1 = Image.new('RGB', (224, 224), color=(255, 255, 255))
    draw1 = ImageDraw.Draw(img1)
    draw1.ellipse([50, 50, 174, 174], fill=(255, 0, 0))
    img1_bytes = io.BytesIO()
    img1.save(img1_bytes, format='JPEG')
    test_images.append(('red_circle.jpg', img1_bytes.getvalue()))
    
    # Blue square
    img2 = Image.new('RGB', (224, 224), color=(255, 255, 255))
    draw2 = ImageDraw.Draw(img2)
    draw2.rectangle([50, 50, 174, 174], fill=(0, 0, 255))
    img2_bytes = io.BytesIO()
    img2.save(img2_bytes, format='JPEG')
    test_images.append(('blue_square.jpg', img2_bytes.getvalue()))
    
    # Store test images
    stored_ids = []
    for filename, image_data in test_images:
        print(f"\n📸 Storing {filename}...")
        
        files = {'file': (filename, image_data, 'image/jpeg')}
        
        try:
            response = requests.post(f"{base_url}/api/v1/vectors/store", files=files)
            
            if response.status_code == 200:
                result = response.json()
                vector_id = result.get('vector_id')
                print(f"   ✅ Stored successfully!")
                print(f"   Vector ID: {vector_id}")
                print(f"   Preview: {result.get('embeddings_preview', [])[:5]}")
                stored_ids.append(vector_id)
            else:
                print(f"   ❌ Failed: {response.text}")
                
        except Exception as e:
            print(f"   ❌ Error: {e}")
    
    return stored_ids

def test_retrieval_endpoints(stored_ids):
    print(f"\n🔍 Testing Retrieval Endpoints")
    print("=" * 35)
    
    base_url = "http://localhost:8002"
    
    # Test list endpoint
    print("\n📋 Testing List Endpoint...")
    try:
        response = requests.get(f"{base_url}/api/v1/vectors/list", 
                              params={"limit": 5, "include_previews": True})
        
        if response.status_code == 200:
            result = response.json()
            print(f"   ✅ List successful!")
            print(f"   Total embeddings: {result.get('total_embeddings', 0)}")
            
            embeddings = result.get('embeddings', [])
            for i, emb in enumerate(embeddings):
                print(f"   - {emb.get('filename')}: {emb.get('vector_id')}")
        else:
            print(f"   ❌ List failed: {response.text}")
    except Exception as e:
        print(f"   ❌ List error: {e}")
    
    # Test get specific embedding
    if stored_ids:
        test_id = stored_ids[0]
        print(f"\n📄 Testing Get Endpoint with ID: {test_id}")
        
        try:
            response = requests.get(f"{base_url}/api/v1/vectors/get/{test_id}")
            
            if response.status_code == 200:
                result = response.json()
                print(f"   ✅ Get successful!")
                print(f"   Filename: {result.get('filename')}")
                print(f"   Vector found: {result.get('vector_found')}")
                print(f"   Preview length: {len(result.get('embeddings_preview', []))}")
                
                # Test with full embedding
                response2 = requests.get(f"{base_url}/api/v1/vectors/get/{test_id}",
                                       params={"include_full_embedding": True})
                
                if response2.status_code == 200:
                    result2 = response2.json()
                    print(f"   ✅ Full embedding retrieved!")
                    if 'embedding_full' in result2:
                        full_emb = result2['embedding_full']
                        print(f"   Full embedding length: {len(full_emb)}")
                else:
                    print(f"   ❌ Full embedding failed: {response2.text}")
                    
            else:
                print(f"   ❌ Get failed: {response.text}")
        except Exception as e:
            print(f"   ❌ Get error: {e}")

if __name__ == "__main__":
    stored_ids = add_test_data()
    test_retrieval_endpoints(stored_ids)

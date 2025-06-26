"""
Test Firebase integration with vector storage
"""
import requests
from PIL import Image, ImageDraw
import io
import json

def create_test_image(name="test", color=(255, 0, 0)):
    """Create a test image"""
    img = Image.new('RGB', (224, 224), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    draw.ellipse([50, 50, 174, 174], fill=color)
    
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='JPEG')
    return img_bytes.getvalue()

def test_firebase_integration():
    print("🔥 Testing Firebase Integration")
    print("=" * 40)
    
    base_url = "http://localhost:8002"
    
    # Create test image
    image_data = create_test_image("red_circle", (255, 100, 50))
    filename = "firebase_test_image.jpg"
    
    files = {'file': (filename, image_data, 'image/jpeg')}
    
    print(f"📤 Uploading {filename} to test Firebase integration...")
    
    try:
        response = requests.post(f"{base_url}/api/v1/vectors/store", files=files)
        
        if response.status_code == 200:
            result = response.json()
            
            print(f"✅ Upload successful!")
            print(f"   Vector ID: {result.get('vector_id')}")
            print(f"   Filename: {result.get('filename')}")
            print(f"   Firebase uploaded: {result.get('firebase_uploaded')}")
            print(f"   Firebase URL: {result.get('firebase_url')}")
            print(f"   Firebase path: {result.get('firebase_path')}")
            print(f"   Processing time: {result.get('processing_time')} seconds")
            print(f"   Embedding preview: {result.get('embeddings_preview', [])[:5]}")
            
            vector_id = result.get('vector_id')
            
            # Now test retrieval to see if Firebase info is stored
            print(f"\n🔍 Testing retrieval to verify Firebase data storage...")
            
            retrieval_response = requests.get(f"{base_url}/api/v1/vectors/get/{vector_id}")
            
            if retrieval_response.status_code == 200:
                retrieval_result = retrieval_response.json()
                metadata = retrieval_result.get('metadata', {})
                
                print(f"✅ Retrieval successful!")
                print(f"   Filename: {retrieval_result.get('filename')}")
                print(f"   Firebase URL in metadata: {metadata.get('firebase_url', 'Not found')}")
                print(f"   Firebase path in metadata: {metadata.get('firebase_path', 'Not found')}")
                print(f"   Other metadata keys: {list(metadata.keys())}")
                
                # Test if Firebase URL is accessible (in development mode it will be a mock URL)
                firebase_url = metadata.get('firebase_url')
                if firebase_url:
                    print(f"\n🌐 Firebase URL generated: {firebase_url}")
                    if firebase_url.startswith("https://mock-firebase-storage.com"):
                        print(f"   🔶 This is a mock URL (development mode)")
                    else:
                        print(f"   🔥 This is a real Firebase URL")
                
            else:
                print(f"❌ Retrieval failed: {retrieval_response.text}")
                
        else:
            print(f"❌ Upload failed: {response.text}")
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")

def test_list_with_firebase():
    print(f"\n📋 Testing List Endpoint with Firebase URLs")
    print("-" * 45)
    
    base_url = "http://localhost:8002"
    
    try:
        response = requests.get(f"{base_url}/api/v1/vectors/list", 
                              params={"limit": 3, "include_previews": True})
        
        if response.status_code == 200:
            result = response.json()
            embeddings = result.get('embeddings', [])
            
            print(f"✅ Found {len(embeddings)} embeddings:")
            
            for i, emb in enumerate(embeddings):
                print(f"\n   {i+1}. {emb.get('filename', 'Unknown')}")
                print(f"      Vector ID: {emb.get('vector_id', 'N/A')}")
                print(f"      Model: {emb.get('model_used', 'N/A')}")
                print(f"      File size: {emb.get('file_size', 0)} bytes")
                
                # Check if Firebase URL is in the data (we'd need to get individual embedding for metadata)
                vector_id = emb.get('vector_id')
                if vector_id:
                    detail_response = requests.get(f"{base_url}/api/v1/vectors/get/{vector_id}")
                    if detail_response.status_code == 200:
                        detail_data = detail_response.json()
                        firebase_url = detail_data.get('metadata', {}).get('firebase_url')
                        if firebase_url:
                            print(f"      🔥 Firebase URL: {firebase_url}")
                        else:
                            print(f"      ⚠️ No Firebase URL found")
        else:
            print(f"❌ List failed: {response.text}")
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    test_firebase_integration()
    test_list_with_firebase()

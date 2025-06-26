"""
Test the new Firebase URL endpoint
This tests storing embeddings with a Firebase URL provided by the client
"""

import requests
import json

def test_firebase_url_endpoint():
    """Test the new Firebase URL endpoint"""
    
    print("🧪 Testing Firebase URL Endpoint")
    print("=" * 50)
    
    # Example Firebase URL (this would come from the frontend)
    test_firebase_url = "https://firebasestorage.googleapis.com/v0/b/visual-search-fyp-a5eb6.firebasestorage.app/o/fashion_images%2F1735019234567_abc123_test.jpg?alt=media"
    test_firebase_path = "fashion_images/1735019234567_abc123_test.jpg"
    test_filename = "test_image.jpg"
    test_content_type = "image/jpeg"
    
    try:
        # Test the new endpoint
        response = requests.post(
            "http://127.0.0.1:8000/api/v1/vectors/store-with-firebase-url",
            data={
                "firebase_url": test_firebase_url,
                "firebase_path": test_firebase_path,
                "filename": test_filename,
                "content_type": test_content_type
            }
        )
        
        print(f"Status code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Endpoint working!")
            print(f"   Vector ID: {data.get('vector_id')}")
            print(f"   Firebase URL: {data.get('firebase_url')}")
            print(f"   Processing time: {data.get('processing_time')}s")
            print(f"   Embedding shape: {data.get('embedding_shape')}")
            
        else:
            print(f"❌ Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Test failed: {str(e)}")

def test_real_firebase_flow():
    """Show the complete flow"""
    
    print("\n🔥 REAL FIREBASE INTEGRATION FLOW")
    print("=" * 50)
    print()
    print("Here's how it works now:")
    print()
    print("1. 📱 Frontend uploads image directly to Firebase Storage")
    print("   → Uses your Firebase config (visual-search-fyp-a5eb6)")
    print("   → Gets real Firebase URL")
    print()
    print("2. 🔗 Frontend sends Firebase URL to backend")
    print("   → POST /api/v1/vectors/store-with-firebase-url")
    print("   → Includes firebase_url, firebase_path, filename")
    print()
    print("3. 🧠 Backend downloads image from Firebase URL")
    print("   → Generates embeddings with TensorFlow")
    print("   → Stores embedding + Firebase URL in Qdrant")
    print()
    print("4. ✅ User gets back working Firebase URL + Vector ID")
    print("   → Firebase URL works and displays the image")
    print("   → Vector ID for similarity search")
    print()
    print("🌐 Try it: http://localhost:8000/static/firebase_upload.html")
    print()
    print("Benefits:")
    print("✅ Real Firebase Storage uploads")
    print("✅ Working Firebase URLs")
    print("✅ No service account needed on backend")
    print("✅ Client-side Firebase authentication")
    print("✅ Scalable architecture")

if __name__ == "__main__":
    test_real_firebase_flow()
    test_firebase_url_endpoint()

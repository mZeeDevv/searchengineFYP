"""
Test the Firebase URL endpoint
"""

import requests
import time

def test_firebase_url_endpoint():
    """Test the Firebase URL endpoint"""
    
    print("🧪 Testing Firebase URL Endpoint")
    print("=" * 50)
    
    # Wait a moment for server to start
    time.sleep(2)
    
    # Test data - using a real image URL that might exist
    test_data = {
        'firebase_url': 'https://via.placeholder.com/300x300.jpg',  # Use a working test URL
        'firebase_path': 'fashion_images/test.jpg',
        'filename': 'test.jpg',
        'content_type': 'image/jpeg'
    }
    
    try:
        print(f"Testing URL: http://127.0.0.1:8000/api/v1/vectors/store-with-firebase-url")
        
        # Test health first
        health_response = requests.get("http://127.0.0.1:8000/api/v1/vectors/health")
        print(f"Health check: {health_response.status_code}")
        
        if health_response.status_code != 200:
            print("❌ Server not responding properly")
            return
        
        # Test the Firebase URL endpoint
        response = requests.post(
            "http://127.0.0.1:8000/api/v1/vectors/store-with-firebase-url",
            data=test_data
        )
        
        print(f"Status code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Firebase URL endpoint working!")
            print(f"   Vector ID: {result.get('vector_id')}")
            print(f"   Firebase URL: {result.get('firebase_url')}")
            print(f"   Processing time: {result.get('processing_time')}s")
        else:
            print("❌ Firebase URL endpoint error:")
            print(f"   Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to server. Make sure it's running on port 8000")
    except Exception as e:
        print(f"❌ Test error: {str(e)}")

def test_regular_upload():
    """Test the regular upload endpoint for comparison"""
    
    print("\n🧪 Testing Regular Upload Endpoint")
    print("=" * 50)
    
    try:
        # Test with test image
        with open("test_image.png", "rb") as f:
            files = {"file": ("test_image.png", f, "image/png")}
            response = requests.post(
                "http://127.0.0.1:8000/api/v1/vectors/store",
                files=files
            )
        
        print(f"Status code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Regular upload working!")
            print(f"   Vector ID: {result.get('vector_id')}")
            print(f"   Firebase URL: {result.get('firebase_url')}")
        else:
            print("❌ Regular upload error:")
            print(f"   Response: {response.text}")
            
    except FileNotFoundError:
        print("❌ test_image.png not found - skipping regular upload test")
    except Exception as e:
        print(f"❌ Test error: {str(e)}")

if __name__ == "__main__":
    test_firebase_url_endpoint()
    test_regular_upload()

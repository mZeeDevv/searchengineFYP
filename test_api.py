"""
Test script for Fashion FYP API endpoints
"""
import requests
import json

# API base URL
BASE_URL = "http://localhost:8000"

def test_health_endpoint():
    """Test the health endpoint"""
    print("🔍 Testing health endpoint...")
    response = requests.get(f"{BASE_URL}/api/v1/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    print()

def test_info_endpoint():
    """Test the info endpoint"""
    print("🔍 Testing info endpoint...")
    response = requests.get(f"{BASE_URL}/api/v1/info")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    print()

def test_image_upload_with_sample():
    """Test image upload endpoint with a sample image"""
    print("🔍 Testing image upload endpoint...")
    
    # Create a simple test image file (you can replace this with an actual image)
    test_image_content = b"fake_image_content_for_testing"
    
    files = {
        'file': ('test_image.jpg', test_image_content, 'image/jpeg')
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/v1/upload", files=files)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print(f"Success: {json.dumps(response.json(), indent=2)}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Request failed: {str(e)}")
    print()

def test_embeddings_endpoint():
    """Test the embeddings endpoint"""
    print("🔍 Testing embeddings endpoint...")
    
    # Create a simple test image file
    test_image_content = b"fake_image_content_for_testing"
    
    files = {
        'file': ('test_fashion_image.jpg', test_image_content, 'image/jpeg')
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/v1/getembeddings", files=files)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print(f"Success: {json.dumps(response.json(), indent=2)}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Request failed: {str(e)}")
    print()

if __name__ == "__main__":
    print("🚀 Testing Fashion FYP API Endpoints")
    print("=" * 50)
    
    test_health_endpoint()
    test_info_endpoint()
    test_image_upload_with_sample()
    test_embeddings_endpoint()
    
    print("✅ Testing completed!")
    print("\n📝 Note: To test with real images, replace the test_image_content")
    print("with actual image files using:")
    print("with open('your_image.jpg', 'rb') as f:")
    print("    files = {'file': ('image.jpg', f, 'image/jpeg')}")

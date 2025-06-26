"""
Simple test to debug Firebase URL issue
"""

import requests
import os

def test_single_upload():
    """Test a single upload and print the raw response"""
    
    BASE_URL = "http://127.0.0.1:8001"
    test_image_path = "test_image.png"
    
    if not os.path.exists(test_image_path):
        print(f"❌ Test image not found: {test_image_path}")
        return
    
    try:
        print("🧪 Testing single image upload...")
        
        with open(test_image_path, "rb") as image_file:
            response = requests.post(
                f"{BASE_URL}/api/v1/vectors/store",
                files={"file": ("test_image.png", image_file, "image/png")}
            )
        
        print(f"Status code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("Raw response:")
            for key, value in data.items():
                print(f"  {key}: {value}")
        else:
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Test failed: {str(e)}")

if __name__ == "__main__":
    test_single_upload()

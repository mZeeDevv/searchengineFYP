#!/usr/bin/env python3
"""
Test script to demonstrate the difference between the two upload endpoints:
1. /api/v1/vectors/store - Server-side upload (generates localhost URLs)
2. /api/v1/vectors/store-with-firebase-url - Client-side upload (uses real Firebase URLs)
"""

import requests
import json
import os

def test_server_side_upload():
    """Test the old /store endpoint (generates localhost URLs)"""
    print("=" * 60)
    print("🔴 TESTING SERVER-SIDE UPLOAD (/store endpoint)")
    print("=" * 60)
    
    # Use a test image
    test_image_path = "test_image.png"
    if not os.path.exists(test_image_path):
        print(f"❌ Test image not found: {test_image_path}")
        return
    
    url = "http://localhost:8000/api/v1/vectors/store"
    
    with open(test_image_path, 'rb') as f:
        files = {'file': (test_image_path, f, 'image/png')}
        response = requests.post(url, files=files)
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Upload successful!")
        print(f"📋 Vector ID: {result.get('vector_id')}")
        print(f"🌐 Firebase URL: {result.get('firebase_url')}")
        print(f"⚠️  NOTE: This URL contains 'localhost' - not a real Firebase URL!")
        print()
        return result
    else:
        print(f"❌ Upload failed: {response.status_code}")
        print(f"Error: {response.text}")
        return None

def test_firebase_url_endpoint():
    """Test the new /store-with-firebase-url endpoint (uses real Firebase URLs)"""
    print("=" * 60)
    print("🟢 TESTING FIREBASE URL ENDPOINT (/store-with-firebase-url)")
    print("=" * 60)
    
    # Use a real Firebase URL (this would come from client-side upload)
    firebase_url = "https://firebasestorage.googleapis.com/v0/b/visual-search-fyp-a5eb6.firebasestorage.app/o/fashion_images%2Ftest_image.jpg?alt=media&token=example-token"
    
    url = "http://localhost:8000/api/v1/vectors/store-with-firebase-url"
    
    data = {
        'firebase_url': firebase_url,
        'firebase_path': 'fashion_images/test_image.jpg',
        'filename': 'test_image.jpg',
        'content_type': 'image/jpeg'
    }
    
    response = requests.post(url, data=data)
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Processing successful!")
        print(f"📋 Vector ID: {result.get('vector_id')}")
        print(f"🌐 Firebase URL: {result.get('firebase_url')}")
        print(f"✅ NOTE: This URL is the REAL Firebase URL provided by the client!")
        print()
        return result
    else:
        print(f"❌ Processing failed: {response.status_code}")
        print(f"Error: {response.text}")
        return None

def main():
    print("🧪 ENDPOINT COMPARISON TEST")
    print("=" * 60)
    print("This script demonstrates the difference between:")
    print("1. Server-side upload (old method) - generates localhost URLs")
    print("2. Client-side Firebase upload (new method) - uses real Firebase URLs")
    print()
    
    # Test 1: Server-side upload
    result1 = test_server_side_upload()
    
    # Test 2: Firebase URL endpoint
    result2 = test_firebase_url_endpoint()
    
    print("=" * 60)
    print("📝 SUMMARY")
    print("=" * 60)
    print("🔴 /store endpoint:")
    print("   - Uploads to server-side Firebase service")
    print("   - In development mode, generates localhost URLs")
    print("   - NOT suitable for production with real Firebase URLs")
    print()
    print("🟢 /store-with-firebase-url endpoint:")
    print("   - Expects image already uploaded to Firebase")
    print("   - Uses the real Firebase URL provided by client")
    print("   - Suitable for production with real Firebase URLs")
    print()
    print("💡 RECOMMENDATION:")
    print("   Use the Firebase Upload page: http://localhost:8000/static/firebase_upload.html")
    print("   This uploads directly to Firebase and uses the correct endpoint.")

if __name__ == "__main__":
    main()

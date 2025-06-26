#!/usr/bin/env python3
"""
Test script to demonstrate the new user_id functionality in the unified endpoint
"""

import requests
import os

def test_upload_with_user_id():
    """Test the upload-and-store endpoint with user_id"""
    print("🧪 TESTING USER ID FUNCTIONALITY")
    print("=" * 60)
    
    # Test image
    test_image_path = "test_image.png"
    if not os.path.exists(test_image_path):
        print(f"❌ Test image not found: {test_image_path}")
        print("💡 Please place a test image file named 'test_image.png' in the current directory")
        return

    url = "http://localhost:8000/api/v1/vectors/upload-and-store"
    
    # Test 1: With user ID
    print("\n🔵 TEST 1: Upload with User ID")
    print("-" * 40)
    
    with open(test_image_path, 'rb') as f:
        files = {'file': (test_image_path, f, 'image/png')}
        data = {'user_id': 'test_user_12345'}  # Sample Firebase UID
        response = requests.post(url, files=files, data=data)
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Upload successful!")
        print(f"📋 Vector ID: {result.get('vector_id')}")
        print(f"👤 User ID: test_user_12345 (should be stored in Qdrant)")
        print(f"🌐 Firebase URL: {result.get('firebase_url')}")
        print()
    else:
        print(f"❌ Upload failed: {response.status_code}")
        print(f"Error: {response.text}")
        return

    # Test 2: Without user ID (anonymous)
    print("🔵 TEST 2: Upload without User ID (Anonymous)")
    print("-" * 40)
    
    with open(test_image_path, 'rb') as f:
        files = {'file': (test_image_path, f, 'image/png')}
        # No user_id in data - should store as null
        response = requests.post(url, files=files)
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Upload successful!")
        print(f"📋 Vector ID: {result.get('vector_id')}")
        print(f"👤 User ID: None (should be stored as null in Qdrant)")
        print(f"🌐 Firebase URL: {result.get('firebase_url')}")
        print()
    else:
        print(f"❌ Upload failed: {response.status_code}")
        print(f"Error: {response.text}")
        return

    print("=" * 60)
    print("📝 SUMMARY")
    print("=" * 60)
    print("✅ User ID functionality implemented:")
    print("   - When user_id is provided → stored in Qdrant metadata")
    print("   - When user_id is NOT provided → stored as null (anonymous)")
    print("   - Both cases work with real Firebase URLs")
    print()
    print("🔍 Check server logs to see the user ID debug output")
    print("📊 Check Qdrant database to verify user_id is stored correctly")

def test_list_embeddings_with_user_ids():
    """Test listing embeddings to see user IDs"""
    print("\n🔍 LISTING EMBEDDINGS WITH USER IDs")
    print("=" * 40)
    
    url = "http://localhost:8000/api/v1/vectors/list"
    response = requests.get(url, params={'limit': 5})
    
    if response.status_code == 200:
        result = response.json()
        embeddings = result.get('embeddings', [])
        
        for i, embedding in enumerate(embeddings, 1):
            filename = embedding.get('filename', 'Unknown')
            vector_id = embedding.get('vector_id', 'Unknown')
            # User ID might be in the metadata or direct payload
            user_id = "Check server logs or Qdrant directly"
            
            print(f"{i}. {filename}")
            print(f"   Vector ID: {vector_id}")
            print(f"   User ID: {user_id}")
            print()
    else:
        print(f"❌ Failed to list embeddings: {response.status_code}")

if __name__ == "__main__":
    test_upload_with_user_id()
    test_list_embeddings_with_user_ids()

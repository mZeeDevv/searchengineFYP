#!/usr/bin/env python3
"""
Test script for the similar image search functionality
"""

import requests
import json
import os

def test_similar_search():
    """Test the similar image search endpoint"""
    print("🔍 TESTING SIMILAR IMAGE SEARCH")
    print("=" * 50)
    
    # Check if test image exists
    test_image_path = "test_image.png"
    if not os.path.exists(test_image_path):
        print(f"❌ Test image not found: {test_image_path}")
        print("💡 Please add a test image file to test the search functionality")
        return
    
    url = "http://localhost:8000/api/v1/vectors/find-similar-complete"
    
    # Test parameters
    params = {
        'threshold': 0.7,
        'limit': 5,
        'include_query_embedding': False
    }
    
    # Upload file for search
    with open(test_image_path, 'rb') as f:
        files = {'file': (test_image_path, f, 'image/png')}
        response = requests.post(url, files=files, params=params)
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Search successful!")
        print(f"📋 Query ID: {result.get('query_id')}")
        print(f"📁 Query Filename: {result.get('query_filename')}")
        print(f"⏱️  Search Time: {result.get('search_time')}s")
        print(f"🎯 Similarity Threshold: {result.get('similarity_threshold')}")
        print(f"📊 Total Similar Found: {result.get('total_similar_found')}")
        print()
        
        similar_images = result.get('similar_embeddings', [])
        if similar_images:
            print("🖼️  SIMILAR IMAGES FOUND:")
            print("-" * 30)
            for i, item in enumerate(similar_images, 1):
                print(f"{i}. {item.get('filename', 'Unknown')}")
                print(f"   Similarity: {item.get('similarity_score', 0):.3f}")
                print(f"   Vector ID: {item.get('vector_id', 'Unknown')}")
                
                # Check for Firebase URL
                firebase_url = item.get('metadata', {}).get('firebase_url') or item.get('firebase_url')
                if firebase_url:
                    if 'firebasestorage.googleapis.com' in firebase_url:
                        print(f"   ✅ Firebase URL: {firebase_url[:80]}...")
                    else:
                        print(f"   ⚠️  Local URL: {firebase_url}")
                else:
                    print(f"   ❌ No Firebase URL found")
                print()
        else:
            print("😔 No similar images found")
            print("💡 Try uploading some images first using the Firebase upload page")
        
        return result
    else:
        print(f"❌ Search failed: {response.status_code}")
        print(f"Error: {response.text}")
        return None

def test_database_status():
    """Test if there are any images in the database"""
    print("📊 CHECKING DATABASE STATUS")
    print("=" * 50)
    
    # Check collection info
    url = "http://localhost:8000/api/v1/vectors/collection/info"
    response = requests.get(url)
    
    if response.status_code == 200:
        info = response.json()
        print(f"✅ Database accessible")
        print(f"📁 Collection: {info.get('collection_name')}")
        print(f"🔄 Status: {info.get('status')}")
        print()
        
        # List stored images
        list_url = "http://localhost:8000/api/v1/vectors/list?limit=5"
        list_response = requests.get(list_url)
        
        if list_response.status_code == 200:
            list_data = list_response.json()
            total_embeddings = list_data.get('total_embeddings', 0)
            print(f"📈 Total embeddings in database: {total_embeddings}")
            
            if total_embeddings > 0:
                print("📋 Recent uploads:")
                embeddings = list_data.get('embeddings', [])
                for i, emb in enumerate(embeddings[:3], 1):
                    print(f"   {i}. {emb.get('filename')} (ID: {emb.get('vector_id')})")
            else:
                print("💡 Database is empty. Upload some images first!")
            print()
        
    else:
        print(f"❌ Database check failed: {response.status_code}")

def main():
    print("🧪 SIMILAR SEARCH TESTING SUITE")
    print("=" * 50)
    
    # Test 1: Check database status
    test_database_status()
    
    # Test 2: Test similar search
    test_similar_search()
    
    print("💡 USAGE INSTRUCTIONS:")
    print("1. Upload images using: http://localhost:8000/firebase-upload")
    print("2. Search for similar images: http://localhost:8000/search")
    print("3. View all embeddings: http://localhost:8000/embeddings")

if __name__ == "__main__":
    main()

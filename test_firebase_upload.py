#!/usr/bin/env python3
"""
Test Firebase upload functionality with environment configuration
"""

import asyncio
import os
from app.services.firebase_service import firebase_service
from app.config import config

async def test_firebase_upload():
    """Test Firebase upload functionality"""
    print("🔥 TESTING FIREBASE UPLOAD FUNCTIONALITY")
    print("=" * 60)
    
    # Check configuration
    print(f"🔧 Configuration:")
    print(f"   Project ID: {config.FIREBASE_PROJECT_ID}")
    print(f"   Storage Bucket: {config.FIREBASE_STORAGE_BUCKET_NAME}")
    print(f"   Mock Mode: {config.FIREBASE_MOCK_MODE}")
    print(f"   API Key: {config.FIREBASE_API_KEY[:20]}..." if config.FIREBASE_API_KEY else "   API Key: NOT SET")
    print()
    
    # Test image path
    test_image_path = "test_image.png"
    if not os.path.exists(test_image_path):
        print(f"❌ Test image not found: {test_image_path}")
        print("💡 Please place a test image file named 'test_image.png' in the current directory")
        return
    
    # Read test image
    with open(test_image_path, 'rb') as f:
        image_bytes = f.read()
    
    print(f"📁 Test image loaded: {len(image_bytes)} bytes")
    print()
    
    # Test Firebase upload
    print("🚀 Starting Firebase upload test...")
    success, firebase_url, firebase_path = await firebase_service.upload_image(
        image_bytes=image_bytes,
        filename="test_upload.png",
        content_type="image/png"
    )
    
    print()
    print("📋 RESULTS:")
    print(f"   Success: {success}")
    print(f"   Firebase URL: {firebase_url}")
    print(f"   Firebase Path: {firebase_path}")
    
    if success and firebase_url:
        print()
        print("✅ Firebase upload test PASSED")
        print(f"🔗 You can verify the image at: {firebase_url}")
    else:
        print()
        print("❌ Firebase upload test FAILED")
        print("💡 Check your Firebase configuration and credentials")

if __name__ == "__main__":
    asyncio.run(test_firebase_upload())

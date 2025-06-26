"""
Direct Firebase Service Test
Tests the Firebase service independently to debug mock URL generation
"""

import asyncio
import os
from app.services.firebase_service import firebase_service

async def test_firebase_directly():
    """Test Firebase service directly"""
    print("🧪 Testing Firebase Service Directly")
    print("=" * 50)
    
    # Check initialization status
    print(f"Firebase initialized: {firebase_service.initialized}")
    print(f"Firebase bucket: {firebase_service.bucket_name}")
    
    # Test with a small image data
    test_image_path = "test_image.png"
    if os.path.exists(test_image_path):
        with open(test_image_path, "rb") as f:
            image_bytes = f.read()
        
        print(f"\nTesting upload with {len(image_bytes)} bytes of image data...")
        
        # Try to upload
        success, firebase_url, firebase_path = await firebase_service.upload_image(
            image_bytes=image_bytes,
            filename="test_image.png",
            content_type="image/png"
        )
        
        print(f"Upload success: {success}")
        print(f"Firebase URL: {firebase_url}")
        print(f"Firebase path: {firebase_path}")
        
        if firebase_url:
            print("✅ Firebase URL generated successfully!")
        else:
            print("❌ No Firebase URL generated")
            
    else:
        print("❌ test_image.png not found")

if __name__ == "__main__":
    asyncio.run(test_firebase_directly())

"""
Firebase Storage Service for handling image uploads
Updated to use Firebase REST API for server-side uploads with environment configuration
"""
import requests
import uuid
import tempfile
import os
import time
from typing import Tuple, Optional
import logging
import json
import base64
from app.config import config

logger = logging.getLogger(__name__)

class FirebaseStorageService:
    def __init__(self):
        """Initialize Firebase Storage service with environment configuration"""
        self.bucket_name = config.FIREBASE_STORAGE_BUCKET_NAME
        self.project_id = config.FIREBASE_PROJECT_ID
        self.api_key = config.FIREBASE_API_KEY
        self.mock_mode = config.FIREBASE_MOCK_MODE
        self.initialized = True  # We'll use REST API, so always "initialized"
        
    def initialize_firebase(self, service_account_path: str = None, bucket_name: str = None):
        """
        Initialize Firebase with REST API configuration from environment
        """
        if bucket_name:
            self.bucket_name = bucket_name
        elif not self.bucket_name:
            self.bucket_name = config.FIREBASE_STORAGE_BUCKET_NAME
        
        print(f"✅ Firebase Storage initialized using REST API: {self.bucket_name}")
        return True
    
    async def upload_image(
        self, 
        image_bytes: bytes, 
        filename: str, 
        content_type: str = "image/jpeg"
    ) -> Tuple[bool, Optional[str], Optional[str]]:
        """
        Upload image to Firebase Storage using REST API and get real download URL
        
        Args:
            image_bytes: Image data as bytes
            filename: Original filename
            content_type: MIME type of the image
            
        Returns:
            Tuple of (success, download_url, firebase_path)
        """
        try:
            # Check if in mock mode
            if self.mock_mode:
                print(f"🔥 MOCK Firebase upload (development mode)")
                print(f"   File: {filename}")
                print(f"   Size: {len(image_bytes)} bytes")
                # Return mock URL
                mock_url = f"https://firebasestorage.googleapis.com/v0/b/{self.bucket_name}/o/mock_fashion_images%2F{filename}?alt=media"
                return True, mock_url, f"mock_fashion_images/{filename}"
            
            # Generate unique filename with timestamp
            timestamp = int(time.time() * 1000)  # milliseconds
            unique_id = str(uuid.uuid4())[:8]
            file_extension = os.path.splitext(filename)[1] or '.jpg'
            unique_filename = f"{timestamp}_{unique_id}_{filename}"
            firebase_path = f"fashion_images/{unique_filename}"
            
            print(f"🔥 REAL Firebase upload starting...")
            print(f"   Original file: {filename}")
            print(f"   Firebase path: {firebase_path}")
            print(f"   Content type: {content_type}")
            print(f"   File size: {len(image_bytes)} bytes")
            
            # Encode the path for Firebase URL
            encoded_path = firebase_path.replace("/", "%2F")
            
            # Firebase Storage REST API endpoint for upload (with auth)
            upload_url = f"https://firebasestorage.googleapis.com/v0/b/{self.bucket_name}/o/{encoded_path}?uploadType=media&key={self.api_key}"
            
            # Headers for the request
            headers = {
                'Content-Type': content_type,
                'Content-Length': str(len(image_bytes))
            }
            
            print(f"🌐 Uploading to: {upload_url}")
            print(f"🔑 Using bucket: {self.bucket_name}")
            print(f"📁 Encoded path: {encoded_path}")
            
            # Make the actual upload request to Firebase
            response = requests.post(
                upload_url,
                data=image_bytes,
                headers=headers,
                timeout=30  # 30 second timeout
            )
            
            print(f"� Firebase response status: {response.status_code}")
            
            if response.status_code in [200, 201]:
                # Parse the response
                try:
                    response_data = response.json()
                    print(f"📄 Firebase response data: {response_data}")
                except:
                    print("📄 Firebase response (not JSON):", response.text[:200])
                
                # Generate the public download URL
                download_url = f"https://firebasestorage.googleapis.com/v0/b/{self.bucket_name}/o/{encoded_path}?alt=media"
                
                print(f"✅ REAL Firebase upload successful!")
                print(f"   Public download URL: {download_url}")
                
                # Verify the URL is accessible
                verify_response = requests.head(download_url, timeout=10)
                if verify_response.status_code == 200:
                    print(f"✅ Download URL verified and accessible")
                else:
                    print(f"⚠️ Download URL returned status {verify_response.status_code}")
                
                logger.info(f"Real Firebase upload successful: {firebase_path}")
                return True, download_url, firebase_path
                
            else:
                print(f"❌ Firebase upload failed with status {response.status_code}")
                print(f"   Response text: {response.text}")
                logger.error(f"Firebase upload failed: {response.status_code} - {response.text}")
                return False, None, None
                
        except requests.exceptions.Timeout:
            print(f"❌ Firebase upload timed out")
            logger.error("Firebase upload timeout")
            return False, None, None
        except requests.exceptions.RequestException as e:
            print(f"❌ Firebase upload request error: {str(e)}")
            logger.error(f"Firebase upload request error: {str(e)}")
            return False, None, None
        except Exception as e:
            print(f"❌ Unexpected error during Firebase upload: {str(e)}")
            logger.error(f"Unexpected Firebase upload error: {str(e)}")
            return False, None, None
    
    async def delete_image(self, firebase_path: str) -> bool:
        """
        Delete image from Firebase Storage using REST API
        
        Args:
            firebase_path: Path to the image in Firebase Storage
            
        Returns:
            True if successful, False otherwise
        """
        try:
            delete_url = f"https://firebasestorage.googleapis.com/v0/b/{self.bucket_name}/o/{firebase_path.replace('/', '%2F')}"
            
            headers = {
                'Authorization': f'Firebase {self.api_key}'
            }
            
            response = requests.delete(delete_url, headers=headers)
            
            if response.status_code == 204:
                logger.info(f"Image deleted successfully: {firebase_path}")
                return True
            else:
                logger.error(f"Failed to delete image: {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"Failed to delete image: {str(e)}")
            return False
    
    def get_public_url(self, firebase_path: str) -> Optional[str]:
        """
        Get public URL for an image
        
        Args:
            firebase_path: Path to the image in Firebase Storage
            
        Returns:
            Public URL or None if failed
        """
        try:
            # Construct the public download URL
            download_url = f"https://firebasestorage.googleapis.com/v0/b/{self.bucket_name}/o/{firebase_path.replace('/', '%2F')}?alt=media"
            return download_url
            
        except Exception as e:
            logger.error(f"Failed to get public URL: {str(e)}")
            return None

# Global instance
firebase_service = FirebaseStorageService()

# Configuration function
def configure_firebase(service_account_path: str = None, bucket_name: str = None):
    """Configure Firebase Storage"""
    return firebase_service.initialize_firebase(service_account_path, bucket_name)

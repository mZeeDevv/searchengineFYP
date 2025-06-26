#!/usr/bin/env python3
"""
Debug configuration loading
"""

from app.config import config
from app.services.firebase_service import firebase_service

print("🔧 DEBUG: Configuration Values")
print("=" * 50)
print(f"FIREBASE_STORAGE_BUCKET_NAME: {config.FIREBASE_STORAGE_BUCKET_NAME}")
print(f"FIREBASE_PROJECT_ID: {config.FIREBASE_PROJECT_ID}")
print(f"FIREBASE_API_KEY: {config.FIREBASE_API_KEY[:20]}...")
print(f"FIREBASE_MOCK_MODE: {config.FIREBASE_MOCK_MODE}")
print()
print("🔧 DEBUG: Firebase Service Values")
print("=" * 50)
print(f"firebase_service.bucket_name: {firebase_service.bucket_name}")
print(f"firebase_service.project_id: {firebase_service.project_id}")
print(f"firebase_service.api_key: {firebase_service.api_key[:20]}...")
print(f"firebase_service.mock_mode: {firebase_service.mock_mode}")

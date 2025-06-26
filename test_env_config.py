#!/usr/bin/env python3
"""
Test script to verify environment configuration setup
"""

try:
    from app.config import config
    print("✅ Configuration module imported successfully")
    
    print("\n🔍 Configuration Values:")
    print(f"QDRANT_URL: {config.QDRANT_URL[:50]}..." if config.QDRANT_URL else "QDRANT_URL: Not set")
    print(f"QDRANT_API_KEY: {'*' * 20}" if config.QDRANT_API_KEY else "QDRANT_API_KEY: Not set")
    print(f"QDRANT_COLLECTION_NAME: {config.QDRANT_COLLECTION_NAME}")
    print(f"FIREBASE_PROJECT_ID: {config.FIREBASE_PROJECT_ID}")
    print(f"FIREBASE_MOCK_MODE: {config.FIREBASE_MOCK_MODE}")
    print(f"MAX_FILE_SIZE: {config.MAX_FILE_SIZE} bytes")
    print(f"ALLOWED_IMAGE_TYPES: {config.ALLOWED_IMAGE_TYPES}")
    print(f"VECTOR_SIZE: {config.VECTOR_SIZE}")
    
    # Test configuration validation
    print("\n🔍 Configuration Validation:")
    errors = config.validate_config()
    if errors:
        print("❌ Configuration errors found:")
        for error in errors:
            print(f"  - {error}")
    else:
        print("✅ Configuration is valid")
    
    # Test Firebase config
    print("\n🔍 Firebase Configuration:")
    firebase_config = config.get_firebase_config()
    for key, value in firebase_config.items():
        if key == "apiKey":
            print(f"  {key}: {'*' * 20}")
        else:
            print(f"  {key}: {value}")
    
    print("\n✅ Environment configuration test completed successfully!")
    
except Exception as e:
    print(f"❌ Error testing configuration: {e}")
    import traceback
    traceback.print_exc()

# 🔥 Firebase Integration Guide

## Problem Fixed: Local URLs vs Real Firebase URLs

### 🔴 WRONG WAY: Using `/api/v1/vectors/store` endpoint
This endpoint uses server-side Firebase upload, which in development mode generates **localhost URLs** like:
```
http://localhost:8000/static/uploads/39d7d94b-5541-4c42-81a3-6561477a4a46.png
```

### ✅ CORRECT WAY: Using Firebase Upload Page
Use the **Firebase Upload page** at: `http://localhost:8000/static/firebase_upload.html`

This page:
1. ✅ Uploads images directly to **REAL Firebase Storage**
2. ✅ Uses the `/api/v1/vectors/store-with-firebase-url` endpoint
3. ✅ Generates **real Firebase URLs** like:
   ```
   https://firebasestorage.googleapis.com/v0/b/visual-search-fyp-a5eb6.firebasestorage.app/o/fashion_images%2F1719199123456_abc123_image.jpg?alt=media&token=xyz789
   ```

## How to Use the Correct Method

### Step 1: Open Firebase Upload Page
Navigate to: `http://localhost:8000/static/firebase_upload.html`

### Step 2: Upload Process
1. **Select Image** - Choose your image file
2. **Upload to Firebase** - Click "Upload to Firebase" (uploads directly to Firebase Storage)
3. **Generate Embeddings** - Click "Generate Embeddings" (calls `/store-with-firebase-url` endpoint)

### Step 3: Verify Real Firebase URL
The response will contain a **real Firebase URL** like:
```json
{
  "firebase_url": "https://firebasestorage.googleapis.com/v0/b/visual-search-fyp-a5eb6.firebasestorage.app/o/fashion_images%2F...",
  "vector_id": "uuid-here",
  "firebase_uploaded": true
}
```

## API Endpoints Explained

### `/api/v1/vectors/store` ❌ (Deprecated for real Firebase URLs)
- Uses server-side Firebase upload
- Generates localhost URLs in development
- Not suitable for production

### `/api/v1/vectors/store-with-firebase-url` ✅ (Recommended)
- Expects pre-uploaded Firebase image
- Uses real Firebase download URLs
- Production-ready

## Frontend Implementation

The `firebase_upload.html` page correctly:
1. Uploads to Firebase using Firebase JS SDK
2. Gets real Firebase download URL
3. Sends URL to `/store-with-firebase-url` endpoint
4. Stores embedding with real Firebase URL

## Testing

Run the comparison test:
```bash
python test_endpoints_comparison.py
```

This will show the difference between localhost URLs and real Firebase URLs.

## Summary

- 🔴 **Don't use**: `/static/vector_database.html` (generates localhost URLs)
- ✅ **Use**: `/static/firebase_upload.html` (generates real Firebase URLs)
- 🔴 **Don't use**: `/api/v1/vectors/store` endpoint directly
- ✅ **Use**: `/api/v1/vectors/store-with-firebase-url` endpoint via frontend

The localStorage issue has been removed, and the system now properly generates real Firebase URLs when using the correct upload method.

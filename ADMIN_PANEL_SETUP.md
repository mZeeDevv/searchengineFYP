# Admin Panel Setup Guide

## Overview
The Fashion FYP Admin Panel allows administrators to manage products in the fashion search system. It includes features for viewing statistics, adding new products, and deleting existing products.

## Setting Up Admin Access

### 1. Firebase Admin Collection Setup
To give a user admin access, you need to add their Firebase UID to the `admins` collection in Firestore.

**Steps:**
1. Go to Firebase Console → Firestore Database
2. Create a collection called `admins`
3. Add a document with the document ID being the user's Firebase UID
4. You can add any additional data to the document (it just needs to exist)

**Example:**
```
Collection: admins
Document ID: abc123def456ghi789 (user's Firebase UID)
Data: {
  name: "Admin User",
  role: "super_admin",
  created_at: "2025-06-27T10:00:00Z"
}
```

### 2. Getting User Firebase UID
To find a user's Firebase UID:
1. The user must first register/login through the app
2. Check Firebase Console → Authentication → Users
3. Copy the UID from the users list
4. Use this UID as the document ID in the `admins` collection

### 3. Admin Panel Access
Once a user is added to the `admins` collection:
1. They can access the admin panel at `/admin`
2. All admin routes (`/admin/add-product`, `/admin/delete-product`) will be accessible
3. Non-admin users will see an "Access Denied" message

## Admin Panel Features

### Dashboard (`/admin`)
- View total number of products
- View total number of users
- View recent uploads count
- Browse recent products with images

### Add Product (`/admin/add-product`)
- Upload new fashion images
- Specify user ID (optional)
- View detailed upload results including:
  - Firebase URL
  - Vector ID
  - AI embedding information
  - Processing time

### Delete Product (`/admin/delete-product`)
- View all products in the database
- Search products by filename, vector ID, or user ID
- Delete products with confirmation
- View product details before deletion

### Homepage Link
- Quick access back to the main website

## Security Features
- Authentication required (must be logged in)
- Admin role verification (must be in `admins` collection)
- Protected routes with proper error handling
- Confirmation dialogs for destructive actions

## Technical Details

### Frontend Components
- `AdminContext.jsx` - Manages admin authentication state
- `AdminRoute.jsx` - Protects admin routes
- `AdminLayout.jsx` - Provides sidebar layout
- `AdminDashboard.jsx` - Dashboard with statistics
- `AdminAddProduct.jsx` - Product upload interface
- `AdminDeleteProduct.jsx` - Product management interface

### Backend Endpoints
- `GET /api/v1/vectors/list` - List all products
- `POST /api/v1/vectors/upload-and-store` - Add new product
- `DELETE /api/v1/vectors/delete/{vector_id}` - Delete product

### Database Collections
- `admins` - Contains admin user IDs
- Vector database (Qdrant) - Stores product embeddings
- Firebase Storage - Stores product images

## Styling
The admin panel uses a professional, minimal design with:
- Dark sidebar navigation
- Clean white content areas
- Subtle gray color scheme
- No bright colors (as requested)
- Responsive grid layouts
- Hover effects and transitions

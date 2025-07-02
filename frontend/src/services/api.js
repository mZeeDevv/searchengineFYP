// Fashion FYP API Service
// Updated to work with FastAPI backend

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const fetchFromAPI = async (endpoint, options = {}) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  return response.json();
};

// Upload image and store in Firebase + Qdrant (Complete Pipeline)
export const uploadAndStoreImage = async (file, price, productName) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('price', price);
  formData.append('product_name', productName);

  const response = await fetch(`${API_URL}/api/v1/vectors/upload-and-store`, {
    method: 'POST',
    body: formData,
    // No Content-Type header as it will be set automatically for FormData
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Upload failed: ${response.status} - ${errorText}`);
  }
  
  return response.json();
};

// Search for similar images
export const searchSimilarImages = async (file, limit = 5, threshold = 0.7, userId = null) => {
  const formData = new FormData();
  formData.append('file', file);

  // Build query parameters
  const queryParams = new URLSearchParams({
    limit: limit.toString(),
    threshold: threshold.toString()
  });
  
  // Add user_id if provided
  if (userId) {
    queryParams.append('user_id', userId);
  }

  const response = await fetch(`${API_URL}/api/v1/vectors/search?${queryParams}`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Search failed: ${response.status} - ${errorText}`);
  }
  
  return response.json();
};

// Get Firebase configuration from backend
export const getFirebaseConfig = async () => {
  const response = await fetch(`${API_URL}/api/v1/config/firebase`);
  
  if (!response.ok) {
    throw new Error(`Config fetch failed: ${response.status}`);
  }
  
  return response.json();
};

// List all embeddings (for debugging/admin)
export const listAllEmbeddings = async () => {
  const response = await fetch(`${API_URL}/api/v1/vectors/list`);
  
  if (!response.ok) {
    throw new Error(`List failed: ${response.status}`);
  }
  
  return response.json();
};

// Delete a product by vector ID (Admin only)
export const deleteProduct = async (vectorId) => {
  const response = await fetch(`${API_URL}/api/v1/vectors/delete/${vectorId}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Delete failed: ${response.status} - ${errorText}`);
  }
  
  return response.json();
};

// Get product details by vector ID
export const getProductById = async (vectorId) => {
  const response = await fetch(`${API_URL}/api/v1/vectors/retrieve/${vectorId}`);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Get product failed: ${response.status} - ${errorText}`);
  }
  
  return response.json();
};

// Get user recommendations based on search history
export const getUserRecommendations = async (userId, limit = 5) => {
  const response = await fetch(`${API_URL}/api/v1/vectors/recommendations/${userId}?limit=${limit}`, {
    method: 'GET',
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Recommendations failed: ${response.status} - ${errorText}`);
  }
  
  return response.json();
};

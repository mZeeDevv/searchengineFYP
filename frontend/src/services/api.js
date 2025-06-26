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
export const uploadAndStoreImage = async (file, userId = null) => {
  const formData = new FormData();
  formData.append('file', file);
  if (userId) {
    formData.append('user_id', userId);
  }

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
export const searchSimilarImages = async (file, limit = 5, threshold = 0.7) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}/api/v1/vectors/search?limit=${limit}&threshold=${threshold}`, {
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


// Firebase configuration loaded dynamically from backend
// This ensures sensitive config is managed through environment variables

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

let firebaseApp = null;
let storage = null;
let analytics = null;
let isFirebaseInitialized = false;
let isMockMode = false;

/**
 * Initialize Firebase with configuration from backend
 */
async function initializeFirebaseFromConfig() {
  try {
    console.log("🔥 Loading Firebase configuration from backend...");
    
    const response = await fetch('/api/v1/config/firebase');
    const configData = await response.json();
    
    isMockMode = configData.mockMode;
    
    if (isMockMode) {
      console.log("🔥 Firebase initialized in MOCK mode (development)");
      isFirebaseInitialized = true;
      return true;
    }
    
    // Initialize Firebase with loaded configuration
    firebaseApp = initializeApp(configData.firebaseConfig);
    analytics = getAnalytics(firebaseApp);
    storage = getStorage(firebaseApp);
    isFirebaseInitialized = true;
    
    console.log("✅ Firebase initialized successfully");
    console.log("📋 Project ID:", configData.firebaseConfig.projectId);
    console.log("🪣 Storage Bucket:", configData.firebaseConfig.storageBucket);
    
    return true;
  } catch (error) {
    console.error("❌ Failed to initialize Firebase:", error);
    console.log("🔄 Falling back to mock mode");
    isMockMode = true;
    isFirebaseInitialized = true;
    return false;
  }
}

// Function to upload image to Firebase Storage
async function uploadImageToFirebase(file) {
  try {
    // Ensure Firebase is initialized
    if (!isFirebaseInitialized) {
      await initializeFirebaseFromConfig();
    }
    
    // Handle mock mode
    if (isMockMode) {
      console.log("🔥 MOCK Firebase upload (development mode)");
      console.log("📁 File:", file.name);
      console.log("📏 Size:", file.size, "bytes");
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUrl = `https://firebasestorage.googleapis.com/v0/b/mock-bucket/o/mock_fashion_images%2F${file.name}?alt=media`;
      return {
        success: true,
        url: mockUrl,
        path: `mock_fashion_images/${file.name}`,
        fileName: file.name,
        mockMode: true
      };
    }
    
    // Real Firebase upload
    // Create a unique filename
    const timestamp = Date.now();
    const uniqueId = Math.random().toString(36).substr(2, 9);
    const fileName = `${timestamp}_${uniqueId}_${file.name}`;
    
    // Create a reference to the file location in Firebase Storage
    const storageRef = ref(storage, `fashion_images/${fileName}`);
    
    // Upload the file
    console.log("🔥 Uploading to Firebase Storage...");
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    console.log("✅ Firebase upload successful!");
    console.log("📁 File path:", snapshot.ref.fullPath);
    console.log("🔗 Download URL:", downloadURL);
    
    return {
      success: true,
      url: downloadURL,
      path: snapshot.ref.fullPath,
      fileName: fileName,
      mockMode: false
    };
  } catch (error) {
    console.error("❌ Error uploading to Firebase:", error);
    return {
      success: false,
      error: error.message,
      mockMode: isMockMode
    };
  }
}

// Export functions
export { 
  initializeFirebaseFromConfig, 
  uploadImageToFirebase, 
  storage,
  isFirebaseInitialized,
  isMockMode
};
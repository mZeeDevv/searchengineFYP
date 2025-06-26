"""
Image Embedding Service using TensorFlow/Keras
"""
import tensorflow as tf
from tensorflow.keras.applications import ResNet50
from tensorflow.keras.applications.resnet50 import preprocess_input
from tensorflow.keras.preprocessing import image
import numpy as np
from PIL import Image
import io
from typing import List, Tuple

# Set TensorFlow to be deterministic
tf.config.experimental.enable_op_determinism()
# Set random seeds for reproducibility
tf.random.set_seed(42)
np.random.seed(42)

class ImageEmbeddingService:
    def __init__(self):
        """Initialize the embedding service with a pre-trained model"""
        # Load pre-trained ResNet50 model without the top classification layer
        # This gives us a 2048-dimensional feature vector
        self.model = ResNet50(
            weights='imagenet',
            include_top=False,
            pooling='avg'  # Global average pooling to get fixed-size output
        )
        self.model_name = "ResNet50"
        self.embedding_size = 2048
        
    def preprocess_image(self, image_bytes: bytes) -> np.ndarray:
        """
        Preprocess image bytes for the model
        
        Args:
            image_bytes: Raw image bytes
            
        Returns:
            Preprocessed image array ready for model input
        """
        # Open image from bytes
        pil_image = Image.open(io.BytesIO(image_bytes))
        
        # Convert to RGB if needed (in case of RGBA, grayscale, etc.)
        if pil_image.mode != 'RGB':
            pil_image = pil_image.convert('RGB')
            
        # Resize to model input size (224x224 for ResNet50)
        pil_image = pil_image.resize((224, 224))
        
        # Convert to numpy array
        img_array = np.array(pil_image)
        
        # Add batch dimension
        img_array = np.expand_dims(img_array, axis=0)
        
        # Preprocess for ResNet50
        img_array = preprocess_input(img_array)
        
        return img_array
    
    def generate_embeddings(self, image_bytes: bytes) -> Tuple[List[float], List[int]]:
        """
        Generate embeddings for an image
        
        Args:
            image_bytes: Raw image bytes
            
        Returns:
            Tuple of (embeddings_list, shape_list)
        """
        # Preprocess the image
        processed_image = self.preprocess_image(image_bytes)
          # Generate embeddings
        embeddings = self.model.predict(processed_image, verbose=0)
        
        # Convert to list and get shape (remove batch dimension)
        embeddings_list = embeddings.flatten().tolist()
        # Get the actual embedding shape without batch dimension
        actual_shape = list(embeddings.shape[1:])  # Remove the first dimension (batch size)
        
        return embeddings_list, actual_shape
    
    def get_model_info(self) -> dict:
        """Get information about the current model"""
        return {
            "model_name": self.model_name,
            "embedding_size": self.embedding_size,
            "input_size": (224, 224, 3),
            "description": "ResNet50 pre-trained on ImageNet, features extracted from global average pooling layer"
        }

# Global instance to reuse across requests
embedding_service = ImageEmbeddingService()

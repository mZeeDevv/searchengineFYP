"""
Direct test of vector storage with debug output
"""
import asyncio
from app.services.vector_service import QdrantVectorService
from app.services.embedding_service import embedding_service
from PIL import Image, ImageDraw
import io

async def test_direct_storage():
    """Test vector storage directly"""
    print("🔧 Testing Direct Vector Storage")
    print("=" * 50)
    
    # Create test image
    img = Image.new('RGB', (224, 224), color=(255, 100, 50))
    draw = ImageDraw.Draw(img)
    draw.rectangle([50, 50, 174, 174], fill=(100, 200, 255))
    
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='JPEG')
    image_data = img_bytes.getvalue()
    
    print(f"📸 Created test image ({len(image_data)} bytes)")
    
    # Generate embeddings
    print(f"🧠 Generating embeddings...")
    embeddings_list, shape_list = embedding_service.generate_embeddings(image_data)
    
    print(f"✅ Generated embeddings:")
    print(f"   Type: {type(embeddings_list)}")
    print(f"   Length: {len(embeddings_list)}")
    print(f"   Shape: {shape_list}")
    print(f"   First 5 values: {embeddings_list[:5]}")
    print(f"   Data types: {[type(x) for x in embeddings_list[:3]]}")
    
    # Initialize vector service
    vector_service = QdrantVectorService()
    
    # Initialize collection
    print(f"\n📁 Initializing collection...")
    await vector_service.initialize_collection()
    
    # Store in vector database
    print(f"\n💾 Storing in vector database...")
    try:
        vector_id = await vector_service.store_embedding(
            embedding=embeddings_list,
            filename="direct_test.jpg",
            file_size=len(image_data),
            content_type="image/jpeg",
            processing_time=0.5,
            model_used="ResNet50",
            metadata={"test": "direct_storage"}
        )
        
        print(f"✅ Storage successful! Vector ID: {vector_id}")
        
        # Verify storage
        print(f"\n🔍 Verifying storage...")
        stored_data = await vector_service.get_stored_embedding(vector_id)
        
        if stored_data:
            print(f"✅ Verification successful:")
            print(f"   Vector ID: {stored_data['vector_id']}")
            print(f"   Embedding length: {stored_data['embedding_length']}")
            print(f"   First 5 stored values: {stored_data['embedding'][:5] if stored_data['embedding'] else 'No vector!'}")
            print(f"   Metadata keys: {list(stored_data['metadata'].keys())}")
        else:
            print(f"❌ Could not retrieve stored data")
            
    except Exception as e:
        print(f"❌ Storage failed: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_direct_storage())

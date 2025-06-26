"""
Comprehensive test to diagnose the vector storage issue
"""
import asyncio
import requests
from qdrant_client import QdrantClient
from PIL import Image, ImageDraw
import io
import json

def create_test_image(name="test"):
    """Create a test image"""
    img = Image.new('RGB', (224, 224), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    
    if name == "red":
        draw.ellipse([50, 50, 174, 174], fill=(255, 0, 0))
    elif name == "blue":
        draw.rectangle([50, 50, 174, 174], fill=(0, 0, 255))
    else:
        draw.polygon([(50, 50), (174, 50), (112, 174)], fill=(0, 255, 0))
    
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='JPEG')
    return img_bytes.getvalue()

async def test_full_pipeline():
    """Test the complete pipeline"""
    print("🧪 COMPREHENSIVE VECTOR STORAGE DIAGNOSIS")
    print("=" * 60)
    
    # Step 1: Test API endpoint
    print("\n📤 STEP 1: Testing API Endpoint")
    print("-" * 30)
    
    image_data = create_test_image("red")
    files = {'file': ('test_red.jpg', image_data, 'image/jpeg')}
    
    vector_id = None
    try:
        response = requests.post("http://localhost:8000/api/v1/vectors/store", files=files)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            vector_id = result.get('vector_id')
            print(f"   ✅ API Success!")
            print(f"   Vector ID: {vector_id}")
            print(f"   Filename: {result.get('filename')}")
            print(f"   Embedding Preview: {result.get('embeddings_preview', [])[:5]}")
            print(f"   Embedding Stats: {result.get('embedding_stats', {})}")
        else:
            print(f"   ❌ API Failed: {response.text}")
            return None
            
    except Exception as e:
        print(f"   ❌ API Error: {str(e)}")
        return None
    
    # Step 2: Direct Qdrant check
    print(f"\n🔍 STEP 2: Direct Qdrant Database Check")
    print("-" * 40)
    
    client = QdrantClient(
        url="https://8483cf56-d075-46f6-9f94-040b9d762203.europe-west3-0.gcp.cloud.qdrant.io:6333",
        api_key="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.ACRMnwXJ6xxFSZZ3nxsu_NgO1RWqHux7qPPPRSuHOXI"
    )
    
    try:
        # Get collection info
        collection_info = client.get_collection("fashion_embeddings")
        print(f"   📁 Collection Info:")
        print(f"      Vector size: {collection_info.config.params.vectors.size}")
        print(f"      Distance: {collection_info.config.params.vectors.distance}")
        print(f"      Points count: {collection_info.points_count}")
        print(f"      Vectors count: {collection_info.vectors_count}")
        print(f"      Status: {collection_info.status}")
        
    except Exception as e:
        print(f"   ❌ Collection info error: {str(e)}")
        return None
    
    # Step 3: Query specific vector
    print(f"\n📋 STEP 3: Query Specific Vector")
    print("-" * 35)
    
    try:
        if vector_id:
            # Try to retrieve the specific vector we just stored
            points = client.retrieve(
                collection_name="fashion_embeddings",
                ids=[vector_id],
                with_vectors=True,
                with_payload=True
            )
            
            if points:
                point = points[0]
                print(f"   ✅ Found vector with ID: {vector_id}")
                print(f"   📄 Payload: {list(point.payload.keys())}")
                print(f"   📁 Filename: {point.payload.get('filename')}")
                
                if hasattr(point, 'vector') and point.vector:
                    print(f"   🎯 VECTOR FOUND!")
                    print(f"      Type: {type(point.vector)}")
                    print(f"      Length: {len(point.vector)}")
                    print(f"      First 10: {point.vector[:10]}")
                    print(f"      Non-zero count: {sum(1 for x in point.vector if abs(x) > 1e-9)}")
                else:
                    print(f"   ❌ NO VECTOR DATA!")
                    print(f"      Point attributes: {[attr for attr in dir(point) if not attr.startswith('_')]}")
            else:
                print(f"   ❌ Vector ID {vector_id} not found!")
                
    except Exception as e:
        print(f"   ❌ Query error: {str(e)}")
    
    # Step 4: Query all vectors
    print(f"\n📊 STEP 4: Query All Vectors")
    print("-" * 30)
    
    try:
        points, _ = client.scroll(
            collection_name="fashion_embeddings",
            limit=10,
            with_vectors=True,
            with_payload=True
        )
        
        print(f"   Found {len(points)} total points")
        
        for i, point in enumerate(points):
            print(f"\n   Point {i+1}:")
            print(f"      ID: {point.id}")
            print(f"      Filename: {point.payload.get('filename', 'N/A')}")
            
            if hasattr(point, 'vector') and point.vector:
                print(f"      ✅ HAS VECTOR: {len(point.vector)} dimensions")
                print(f"         First 5: {point.vector[:5]}")
                print(f"         Range: {min(point.vector):.6f} to {max(point.vector):.6f}")
            else:
                print(f"      ❌ NO VECTOR DATA")
                print(f"         Available attributes: {[attr for attr in dir(point) if not attr.startswith('_')]}")
                
    except Exception as e:
        print(f"   ❌ Scroll error: {str(e)}")
    
    # Step 5: Test similarity search
    print(f"\n🔎 STEP 5: Test Similarity Search")
    print("-" * 35)
    
    try:
        # Create a new test image for search
        search_image = create_test_image("blue")
        search_files = {'file': ('search_test.jpg', search_image, 'image/jpeg')}
        
        response = requests.post("http://localhost:8000/api/v1/vectors/search", 
                               files=search_files, 
                               params={"limit": 3, "threshold": 0.1})
        
        if response.status_code == 200:
            search_result = response.json()
            print(f"   ✅ Similarity search successful!")
            print(f"   Found {len(search_result.get('similar_images', []))} similar images")
            
            for img in search_result.get('similar_images', []):
                print(f"      - {img.get('filename')} (score: {img.get('score', 0):.3f})")
        else:
            print(f"   ❌ Similarity search failed: {response.text}")
            
    except Exception as e:
        print(f"   ❌ Search error: {str(e)}")
    
    print(f"\n✅ DIAGNOSIS COMPLETE!")
    print(f"=" * 60)

if __name__ == "__main__":
    asyncio.run(test_full_pipeline())

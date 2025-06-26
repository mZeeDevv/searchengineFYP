"""
Debug script to verify that embeddings are actually stored in Qdrant
"""
import requests
from qdrant_client import QdrantClient
from qdrant_client.models import Filter, FieldCondition, MatchText
import numpy as np

def check_qdrant_directly():
    """Check Qdrant database directly to see stored vectors"""
    print("🔍 Checking Qdrant database directly...")
    
    client = QdrantClient(
        url="https://8483cf56-d075-46f6-9f94-040b9d762203.europe-west3-0.gcp.cloud.qdrant.io:6333",
        api_key="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.ACRMnwXJ6xxFSZZ3nxsu_NgO1RWqHux7qPPPRSuHOXI"
    )
    
    try:
        # Get collection info
        collection_info = client.get_collection("fashion_embeddings")
        print(f"📊 Collection Info:")
        print(f"   Vectors count: {collection_info.vectors_count}")
        print(f"   Points count: {collection_info.points_count}")
        print(f"   Vector size: {collection_info.config.params.vectors.size}")
        
        # Get some points to examine
        points = client.scroll(
            collection_name="fashion_embeddings",
            limit=3,
            with_payload=True,
            with_vectors=True
        )[0]
        
        print(f"\n🔍 Examining stored points:")
        for i, point in enumerate(points):
            print(f"\n   Point {i+1}:")
            print(f"   ID: {point.id}")
            print(f"   Payload keys: {list(point.payload.keys())}")
            print(f"   Filename: {point.payload.get('filename', 'N/A')}")
            
            if point.vector:
                vector = point.vector
                if isinstance(vector, list):
                    print(f"   Vector type: list")
                    print(f"   Vector length: {len(vector)}")
                    print(f"   First 10 values: {vector[:10]}")
                    print(f"   Last 10 values: {vector[-10:]}")
                    print(f"   Min value: {min(vector):.6f}")
                    print(f"   Max value: {max(vector):.6f}")
                    print(f"   Average: {sum(vector)/len(vector):.6f}")
                    print(f"   Non-zero count: {sum(1 for x in vector if abs(x) > 1e-6)}")
                else:
                    print(f"   Vector type: {type(vector)}")
                    print(f"   Vector: {vector}")
            else:
                print(f"   ❌ No vector found for this point!")
                
    except Exception as e:
        print(f"❌ Error checking Qdrant: {str(e)}")

def test_store_and_retrieve():
    """Store a new vector and immediately retrieve it"""
    print(f"\n🧪 Testing store and immediate retrieval...")
    
    # Create a simple test image
    from PIL import Image, ImageDraw
    import io
    
    img = Image.new('RGB', (224, 224), color=(255, 100, 50))
    draw = ImageDraw.Draw(img)
    draw.ellipse([50, 50, 174, 174], fill=(100, 200, 255))
    
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='JPEG')
    img_bytes.seek(0)
    
    # Store via API
    files = {
        'file': ('debug_test.jpg', img_bytes.getvalue(), 'image/jpeg')
    }
    
    print("📤 Storing test image...")
    response = requests.post("http://localhost:8000/api/v1/vectors/store", files=files)
    
    if response.status_code == 200:
        result = response.json()
        vector_id = result.get('vector_id')
        print(f"   ✅ Stored with ID: {vector_id}")
        print(f"   📊 Preview: {result.get('embeddings_preview', [])[:5]}")
        
        # Now retrieve directly from Qdrant
        print(f"\n📥 Retrieving from Qdrant...")
        client = QdrantClient(
            url="https://8483cf56-d075-46f6-9f94-040b9d762203.europe-west3-0.gcp.cloud.qdrant.io:6333",
            api_key="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.ACRMnwXJ6xxFSZZ3nxsu_NgO1RWqHux7qPPPRSuHOXI"
        )
        
        points = client.retrieve(
            collection_name="fashion_embeddings",
            ids=[vector_id],
            with_vectors=True,
            with_payload=True
        )
        
        if points:
            point = points[0]
            print(f"   ✅ Retrieved point with ID: {point.id}")
            if point.vector:
                vector = point.vector
                print(f"   📊 Vector length: {len(vector)}")
                print(f"   📊 First 5 values: {vector[:5]}")
                print(f"   📊 Matches preview: {vector[:5] == result.get('embeddings_preview', [])[:5]}")
            else:
                print(f"   ❌ No vector in retrieved point!")
        else:
            print(f"   ❌ Could not retrieve point with ID: {vector_id}")
    else:
        print(f"   ❌ Failed to store: {response.text}")

if __name__ == "__main__":
    print("🔧 Debug Vector Storage and Retrieval")
    print("=" * 50)
    
    check_qdrant_directly()
    test_store_and_retrieve()
    
    print(f"\n✅ Debug complete!")

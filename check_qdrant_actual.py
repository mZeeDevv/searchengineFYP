"""
Query Qdrant directly to show what's actually stored
"""
from qdrant_client import QdrantClient
import json

def check_qdrant_storage():
    """Check what's actually stored in Qdrant"""
    print("🔍 Checking Qdrant Database Contents")
    print("=" * 50)
    
    client = QdrantClient(
        url="https://8483cf56-d075-46f6-9f94-040b9d762203.europe-west3-0.gcp.cloud.qdrant.io:6333",
        api_key="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.ACRMnwXJ6xxFSZZ3nxsu_NgO1RWqHux7qPPPRSuHOXI"
    )
      # Get collection info
    try:
        collection_info = client.get_collection("fashion_embeddings")
        print(f"📁 Collection Info:")
        print(f"   Vector size: {collection_info.config.params.vectors.size}")
        print(f"   Distance metric: {collection_info.config.params.vectors.distance}")
        print(f"   Points count: {collection_info.points_count}")
        print(f"   Vectors count: {collection_info.vectors_count}")
    except Exception as e:
        print(f"❌ Error getting collection info: {e}")
        return
    
    # Get all points with vectors
    try:
        print(f"\n📋 Querying all points with vectors...")
        points, next_page_offset = client.scroll(
            collection_name="fashion_embeddings",
            limit=5,
            with_payload=True,
            with_vectors=True  # This is crucial!
        )
        
        print(f"   Found {len(points)} points")
        
        for i, point in enumerate(points):
            print(f"\n   📄 Point {i+1}:")
            print(f"      ID: {point.id}")
            print(f"      Filename: {point.payload.get('filename', 'N/A')}")
            print(f"      Model: {point.payload.get('model_used', 'N/A')}")
            
            # Check vector data
            if hasattr(point, 'vector') and point.vector:
                vector_data = point.vector
                print(f"      🎯 VECTOR DATA FOUND:")
                print(f"         Type: {type(vector_data)}")
                print(f"         Length: {len(vector_data) if hasattr(vector_data, '__len__') else 'N/A'}")
                
                if hasattr(vector_data, '__getitem__'):
                    print(f"         First 10 values: {vector_data[:10]}")
                    print(f"         Last 10 values: {vector_data[-10:]}")
                    print(f"         Min value: {min(vector_data):.6f}")
                    print(f"         Max value: {max(vector_data):.6f}")
                    non_zero = sum(1 for x in vector_data if abs(x) > 1e-9)
                    print(f"         Non-zero values: {non_zero}/{len(vector_data)}")
                else:
                    print(f"         Vector data: {vector_data}")
            else:
                print(f"      ❌ NO VECTOR DATA FOUND!")
                print(f"         Point attributes: {dir(point)}")
                
            # Show payload
            print(f"      📋 Payload keys: {list(point.payload.keys())}")
            
    except Exception as e:
        print(f"❌ Error querying points: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    check_qdrant_storage()

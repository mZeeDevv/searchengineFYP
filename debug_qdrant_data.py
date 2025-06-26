#!/usr/bin/env python3
"""
Debug script to check what's actually stored in Qdrant
"""
import requests
import json
from qdrant_client import QdrantClient

def check_qdrant_data():
    """Check what's actually stored in Qdrant"""
    
    # Initialize Qdrant client with the same credentials
    client = QdrantClient(
        url="https://8483cf56-d075-46f6-9f94-040b9d762203.europe-west3-0.gcp.cloud.qdrant.io:6333",
        api_key="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.ACRMnwXJ6xxFSZZ3nxsu_NgO1RWqHux7qPPPRSuHOXI"
    )
    collection_name = "fashion_embeddings"
    
    try:
        # Get collection info
        collection_info = client.get_collection(collection_name)
        print(f"Collection: {collection_name}")
        print(f"Points count: {collection_info.points_count}")
        print(f"Vector size: {collection_info.config.params.vectors.size}")
        print(f"Distance metric: {collection_info.config.params.vectors.distance}")
        
        # Get some sample points
        points = client.scroll(collection_name, limit=3, with_payload=True, with_vectors=True)
        
        print(f"\n=== Sample Points ===")
        for point in points[0]:
            print(f"\nPoint ID: {point.id}")
            print(f"Payload: {point.payload}")
            
            # Check if vector exists and its properties
            if point.vector:
                vector = point.vector
                if isinstance(vector, list):
                    print(f"Vector length: {len(vector)}")
                    print(f"Vector type: {type(vector)}")
                    print(f"First 5 values: {vector[:5]}")
                    print(f"Vector statistics:")
                    print(f"  - Min: {min(vector):.6f}")
                    print(f"  - Max: {max(vector):.6f}")
                    print(f"  - Average: {sum(vector)/len(vector):.6f}")
                    print(f"  - Non-zero count: {sum(1 for x in vector if x != 0)}")
                else:
                    print(f"Vector: {vector}")
            else:
                print("ERROR: No vector data found!")
                
    except Exception as e:
        print(f"Error accessing Qdrant: {e}")

if __name__ == "__main__":
    check_qdrant_data()

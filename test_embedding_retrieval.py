"""
Test the new embedding retrieval endpoints
"""
import requests
import json

def test_embedding_retrieval():
    """Test the embedding retrieval endpoints"""
    print("🧪 Testing Embedding Retrieval Endpoints")
    print("=" * 50)
    
    base_url = "http://localhost:8002"  # Using port 8002
    
    # Test 1: List all embeddings
    print("\n📋 Test 1: List All Embeddings")
    print("-" * 30)
    
    try:
        response = requests.get(f"{base_url}/api/v1/vectors/list", 
                              params={"limit": 5, "include_previews": True})
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ List embeddings successful!")
            print(f"   Total embeddings: {result.get('total_embeddings', 0)}")
            print(f"   Collection status: {result.get('collection_info', {}).get('status', 'N/A')}")
            
            embeddings = result.get('embeddings', [])
            for i, emb in enumerate(embeddings):
                print(f"\n   Embedding {i+1}:")
                print(f"      Vector ID: {emb.get('vector_id', 'N/A')}")
                print(f"      Filename: {emb.get('filename', 'N/A')}")
                print(f"      Model: {emb.get('model_used', 'N/A')}")
                if 'embedding_preview' in emb:
                    print(f"      Preview: {emb['embedding_preview']}")
                    print(f"      Length: {emb.get('embedding_length', 0)}")
                    stats = emb.get('embedding_stats', {})
                    print(f"      Stats: Min={stats.get('min_value')}, Max={stats.get('max_value')}")
            
            # Test 2: Get specific embedding
            if embeddings:
                test_vector_id = embeddings[0]['vector_id']
                print(f"\n📄 Test 2: Get Specific Embedding")
                print("-" * 35)
                
                # Test without full embedding
                response2 = requests.get(f"{base_url}/api/v1/vectors/get/{test_vector_id}")
                
                if response2.status_code == 200:
                    result2 = response2.json()
                    print(f"✅ Get embedding successful!")
                    print(f"   Vector ID: {result2.get('vector_id')}")
                    print(f"   Filename: {result2.get('filename')}")
                    print(f"   Vector found: {result2.get('vector_found')}")
                    print(f"   Preview length: {len(result2.get('embeddings_preview', []))}")
                    print(f"   Has full embedding: {'embedding_full' in result2}")
                    
                    stats = result2.get('embedding_stats', {})
                    if stats:
                        print(f"   Stats: Min={stats.get('min_value')}, Max={stats.get('max_value')}, Avg={stats.get('avg_value')}")
                        print(f"   Non-zero: {stats.get('non_zero_count')}/{stats.get('total_dimensions')}")
                else:
                    print(f"❌ Get embedding failed: {response2.text}")
                
                # Test 3: Get with full embedding
                print(f"\n📊 Test 3: Get Full Embedding")
                print("-" * 30)
                
                response3 = requests.get(f"{base_url}/api/v1/vectors/get/{test_vector_id}",
                                       params={"include_full_embedding": True})
                
                if response3.status_code == 200:
                    result3 = response3.json()
                    print(f"✅ Get full embedding successful!")
                    print(f"   Has full embedding: {'embedding_full' in result3}")
                    if 'embedding_full' in result3:
                        full_emb = result3['embedding_full']
                        print(f"   Full embedding length: {len(full_emb)}")
                        print(f"   First 10 values: {full_emb[:10]}")
                        print(f"   Last 10 values: {full_emb[-10:]}")
                else:
                    print(f"❌ Get full embedding failed: {response3.text}")
            
        else:
            print(f"❌ List embeddings failed: {response.text}")
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
    
    # Test 4: Test with invalid vector ID
    print(f"\n🚫 Test 4: Invalid Vector ID")
    print("-" * 25)
    
    try:
        response4 = requests.get(f"{base_url}/api/v1/vectors/get/invalid-id-123")
        print(f"   Status code: {response4.status_code}")
        if response4.status_code == 404:
            print(f"   ✅ Correctly returned 404 for invalid ID")
        else:
            print(f"   ⚠️ Unexpected response: {response4.text}")
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")

if __name__ == "__main__":
    test_embedding_retrieval()

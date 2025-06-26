"""
Test the complete similarity search endpoint
"""
import requests
from PIL import Image, ImageDraw
import io
import json

def create_test_image(pattern="circle", color=(255, 0, 0)):
    """Create test images with different patterns"""
    img = Image.new('RGB', (224, 224), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    
    if pattern == "circle":
        draw.ellipse([50, 50, 174, 174], fill=color)
    elif pattern == "square":
        draw.rectangle([50, 50, 174, 174], fill=color)
    elif pattern == "triangle":
        draw.polygon([(112, 50), (50, 174), (174, 174)], fill=color)
    else:
        # Random pattern
        import random
        for _ in range(20):
            x1, y1 = random.randint(0, 200), random.randint(0, 200)
            x2, y2 = x1 + random.randint(10, 50), y1 + random.randint(10, 50)
            draw.rectangle([x1, y1, x2, y2], fill=color)
    
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='JPEG')
    return img_bytes.getvalue()

def test_complete_similarity_search():
    """Test the complete similarity search endpoint"""
    print("🔍 Testing Complete Similarity Search Endpoint")
    print("=" * 55)
    
    base_url = "http://localhost:8002"
    
    # Step 1: Add some test images to the database first
    print("\n📤 Step 1: Adding test images to database...")
    print("-" * 45)
    
    test_images = [
        ("red_circle.jpg", create_test_image("circle", (255, 0, 0))),
        ("blue_circle.jpg", create_test_image("circle", (0, 0, 255))),
        ("red_square.jpg", create_test_image("square", (255, 0, 0))),
        ("green_triangle.jpg", create_test_image("triangle", (0, 255, 0))),
        ("random_pattern.jpg", create_test_image("random", (128, 128, 128)))
    ]
    
    stored_images = []
    for filename, image_data in test_images:
        files = {'file': (filename, image_data, 'image/jpeg')}
        
        try:
            response = requests.post(f"{base_url}/api/v1/vectors/store", files=files)
            if response.status_code == 200:
                result = response.json()
                stored_images.append(result.get('vector_id'))
                print(f"   ✅ Stored: {filename}")
            else:
                print(f"   ❌ Failed to store {filename}: {response.text}")
        except Exception as e:
            print(f"   ❌ Error storing {filename}: {e}")
    
    print(f"\n   📊 Successfully stored {len(stored_images)} images")
    
    # Step 2: Test similarity search with different query images
    print("\n🔎 Step 2: Testing similarity search...")
    print("-" * 40)
    
    # Test with a red circle (should find similar circles)
    query_image = create_test_image("circle", (255, 100, 100))  # Slightly different red circle
    
    test_cases = [
        {
            "name": "Similar Red Circle",
            "image": query_image,
            "threshold": 0.3,
            "limit": 5,
            "description": "Should find circles with good similarity"
        },
        {
            "name": "Strict Similarity",
            "image": query_image,
            "threshold": 0.8,
            "limit": 3,
            "description": "Should find only very similar images"
        },
        {
            "name": "Broad Search",
            "image": query_image,
            "threshold": 0.1,
            "limit": 10,
            "description": "Should find more loosely similar images"
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n   🧪 Test {i}: {test_case['name']}")
        print(f"      {test_case['description']}")
        
        files = {'file': ('query_image.jpg', test_case['image'], 'image/jpeg')}
        params = {
            'threshold': test_case['threshold'],
            'limit': test_case['limit'],
            'include_query_embedding': False  # Set to True if you want to see query embedding
        }
        
        try:
            response = requests.post(f"{base_url}/api/v1/vectors/find-similar-complete", 
                                   files=files, params=params)
            
            if response.status_code == 200:
                result = response.json()
                
                print(f"      ✅ Search successful!")
                print(f"         Query ID: {result.get('query_id')}")
                print(f"         Search time: {result.get('search_time')}s")
                print(f"         Similar images found: {result.get('total_similar_found')}")
                print(f"         Threshold used: {result.get('similarity_threshold')}")
                
                # Show details of similar images
                similar_embeddings = result.get('similar_embeddings', [])
                for j, similar in enumerate(similar_embeddings):
                    print(f"\n         📄 Similar Image {j+1}:")
                    print(f"            Filename: {similar.get('filename')}")
                    print(f"            Similarity Score: {similar.get('similarity_score')}")
                    print(f"            Vector ID: {similar.get('vector_id')}")
                    
                    # Check if full embedding is present
                    embedding_full = similar.get('embedding_full', [])
                    if embedding_full:
                        print(f"            ✅ Full embedding included: {len(embedding_full)} dimensions")
                        print(f"            Preview: {embedding_full[:5]}")
                        
                        stats = similar.get('embedding_stats', {})
                        if stats:
                            print(f"            Stats: Min={stats.get('min_value')}, Max={stats.get('max_value')}")
                            print(f"            Non-zero: {stats.get('non_zero_count')}/{stats.get('total_dimensions')}")
                    else:
                        print(f"            ❌ No full embedding data")
                
                # Show query embedding stats
                query_stats = result.get('query_embedding_stats', {})
                if query_stats:
                    print(f"\n         📊 Query Image Stats:")
                    print(f"            Min: {query_stats.get('min_value')}")
                    print(f"            Max: {query_stats.get('max_value')}")
                    print(f"            Avg: {query_stats.get('avg_value')}")
                    print(f"            Non-zero: {query_stats.get('non_zero_count')}/{query_stats.get('total_dimensions')}")
                
            else:
                print(f"      ❌ Search failed: {response.text}")
                
        except Exception as e:
            print(f"      ❌ Error: {e}")
    
    # Step 3: Test with full query embedding included
    print(f"\n📊 Step 3: Testing with query embedding included...")
    print("-" * 50)
    
    files = {'file': ('full_test.jpg', query_image, 'image/jpeg')}
    params = {
        'threshold': 0.5,
        'limit': 3,
        'include_query_embedding': True
    }
    
    try:
        response = requests.post(f"{base_url}/api/v1/vectors/find-similar-complete", 
                               files=files, params=params)
        
        if response.status_code == 200:
            result = response.json()
            
            print(f"   ✅ Full embedding test successful!")
            print(f"   Query embedding preview: {result.get('query_embedding_preview', [])[:5]}")
            print(f"   Message: {result.get('message')}")
            
            # Verify that we have complete embedding data
            similar_embeddings = result.get('similar_embeddings', [])
            total_embedding_dimensions = sum(
                len(emb.get('embedding_full', [])) for emb in similar_embeddings
            )
            print(f"   📊 Total embedding dimensions retrieved: {total_embedding_dimensions}")
            
        else:
            print(f"   ❌ Full embedding test failed: {response.text}")
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    print(f"\n✅ Complete similarity search testing finished!")
    print(f"=" * 55)

if __name__ == "__main__":
    test_complete_similarity_search()

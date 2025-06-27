"""
Test script to verify the search API with user_id parameter
"""
import requests
import json

def test_search_api_with_user():
    """Test the search API endpoint with user_id parameter"""
    
    # Use the test image
    test_image_path = "test_image.png"
    
    try:
        with open(test_image_path, 'rb') as f:
            files = {'file': ('test_image.png', f, 'image/png')}
            params = {
                'limit': 5,
                'threshold': 0.7,
                'user_id': 'test_user_api_123'
            }
            
            print(f"🔍 Testing search API with user_id: {params['user_id']}")
            
            response = requests.post(
                'http://localhost:8000/api/v1/vectors/search',
                files=files,
                params=params,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Search successful!")
                print(f"   Query ID: {result['query_id']}")
                print(f"   Similar images found: {result['total_found']}")
                print(f"   Search time: {result['search_time']}s")
                
                # Show similar images
                for i, img in enumerate(result['similar_images'][:3]):
                    print(f"   Similar image {i+1}: {img['score']:.3f} similarity")
                
                print(f"🎉 Search with user_id completed successfully!")
                
            else:
                print(f"❌ Search failed with status code: {response.status_code}")
                print(f"Response: {response.text}")
                
    except FileNotFoundError:
        print(f"❌ Test image not found: {test_image_path}")
    except Exception as e:
        print(f"❌ Test failed: {str(e)}")

if __name__ == "__main__":
    test_search_api_with_user()

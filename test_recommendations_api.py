"""
Test script to verify the recommendations API endpoint
"""
import requests
import json

def test_recommendations_api():
    """Test the recommendations API endpoint"""
    
    # Use the test user ID from our previous tests
    test_user_id = "test_user_api_123"
    
    try:
        print(f"🎯 Testing recommendations API for user: {test_user_id}")
        
        response = requests.get(
            f'http://localhost:8000/api/v1/vectors/recommendations/{test_user_id}?limit=5',
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Recommendations successful!")
            print(f"   User ID: {result['user_id']}")
            print(f"   Total recommendations: {result['total_found']}")
            print(f"   Message: {result['message']}")
            
            # Show recommendations
            for i, rec in enumerate(result['recommendations'][:3]):
                print(f"   Recommendation {i+1}:")
                print(f"     Product: {rec.get('product_name', 'N/A')}")
                print(f"     Price: ${rec.get('price', 0):.2f}")
                print(f"     Match Score: {(rec.get('score', 0) * 100):.1f}%")
                if rec.get('recommendation_source'):
                    source = rec['recommendation_source']
                    print(f"     Based on search: {source.get('search_filename', 'N/A')}")
                
            print(f"🎉 Recommendations API test completed successfully!")
            
        else:
            print(f"❌ Recommendations failed with status code: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Test failed: {str(e)}")

if __name__ == "__main__":
    test_recommendations_api()

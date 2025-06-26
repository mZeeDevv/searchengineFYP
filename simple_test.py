"""
Simple test to check collection and then test retrieval
"""
import requests

def simple_test():
    print("🔍 Simple Endpoint Test")
    print("=" * 30)
    
    base_url = "http://localhost:8002"
    
    # Test health endpoint first
    try:
        response = requests.get(f"{base_url}/api/v1/vectors/health")
        print(f"Health check: {response.status_code}")
        if response.status_code == 200:
            print(f"Health response: {response.json()}")
        else:
            print(f"Health error: {response.text}")
    except Exception as e:
        print(f"Health error: {e}")
    
    # Test info endpoint
    try:
        response = requests.get(f"{base_url}/api/v1/vectors/info")
        print(f"\nInfo check: {response.status_code}")
        if response.status_code == 200:
            print(f"Info response: {response.json()}")
        else:
            print(f"Info error: {response.text}")
    except Exception as e:
        print(f"Info error: {e}")

if __name__ == "__main__":
    simple_test()

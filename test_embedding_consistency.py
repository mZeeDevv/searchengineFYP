"""
Test to verify if the same image processed multiple times gives the same embeddings
"""
import requests
from PIL import Image, ImageDraw
import io

def create_test_image():
    """Create a consistent test image"""
    img = Image.new('RGB', (224, 224), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    draw.ellipse([50, 50, 174, 174], fill=(255, 0, 0))
    draw.rectangle([100, 100, 150, 150], fill=(0, 255, 0))
    
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='JPEG')
    
    return img_bytes.getvalue()

def test_same_image_multiple_times():
    """Test the same image multiple times to check consistency"""
    print("🔍 Testing same image processed multiple times...")
    
    image_data = create_test_image()
    results = []
    
    for i in range(3):
        print(f"\n📸 Test {i+1}:")
        
        files = {
            'file': (f'test_consistency_{i+1}.jpg', image_data, 'image/jpeg')
        }
        
        try:
            response = requests.post("http://localhost:8000/api/v1/vectors/store", files=files)
            
            if response.status_code == 200:
                result = response.json()
                preview = result.get('embeddings_preview', [])
                stats = result.get('embedding_stats', {})
                
                print(f"   ✅ Processing successful")
                print(f"   📊 First 5 values: {preview[:5]}")
                print(f"   📊 Stats: Min={stats.get('min_value')}, Max={stats.get('max_value')}, Avg={stats.get('avg_value')}")
                
                results.append({
                    'preview': preview[:10],
                    'stats': stats,
                    'vector_id': result.get('vector_id')
                })
            else:
                print(f"   ❌ Failed: {response.text}")
                
        except Exception as e:
            print(f"   ❌ Error: {str(e)}")
    
    # Compare results
    if len(results) >= 2:
        print(f"\n🔍 Comparing results:")
        
        for i in range(1, len(results)):
            prev1 = results[0]['preview']
            prev2 = results[i]['preview']
            
            matches = sum(1 for a, b in zip(prev1, prev2) if abs(a - b) < 1e-6)
            print(f"   Test 1 vs Test {i+1}: {matches}/10 values match exactly")
            
            if matches == 10:
                print(f"   ✅ Results are IDENTICAL - Embeddings are consistent!")
            else:
                print(f"   ⚠️ Results differ - There might be non-deterministic behavior")
                print(f"      Test 1: {prev1}")
                print(f"      Test {i+1}: {prev2}")

if __name__ == "__main__":
    print("🧪 Testing Embedding Consistency")
    print("=" * 50)
    
    test_same_image_multiple_times()
    
    print("\n✅ Test complete!")

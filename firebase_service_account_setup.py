"""
Firebase Service Account Setup Guide
This script helps you get the Firebase service account key needed for real Firebase Storage uploads.
"""

import os
import json

def check_firebase_setup():
    """Check the current Firebase setup and provide instructions"""
    
    print("🔥 FIREBASE SERVICE ACCOUNT SETUP GUIDE")
    print("=" * 60)
    
    # Check if service account file exists
    service_account_file = "visual-search-fyp-a5eb6-firebase-adminsdk.json"
    
    if os.path.exists(service_account_file):
        print("✅ Firebase service account file found!")
        print(f"   File: {service_account_file}")
        
        # Try to read and validate the file
        try:
            with open(service_account_file, 'r') as f:
                service_account = json.load(f)
            
            project_id = service_account.get('project_id', 'Unknown')
            client_email = service_account.get('client_email', 'Unknown')
            
            print(f"   Project ID: {project_id}")
            print(f"   Client Email: {client_email}")
            
            if project_id == "visual-search-fyp-a5eb6":
                print("✅ Service account matches your Firebase project!")
                return True
            else:
                print(f"❌ Project ID mismatch. Expected: visual-search-fyp-a5eb6, Got: {project_id}")
                return False
                
        except Exception as e:
            print(f"❌ Error reading service account file: {e}")
            return False
    else:
        print("❌ Firebase service account file not found!")
        print(f"   Expected file: {service_account_file}")
        print("\n📋 FOLLOW THESE STEPS TO GET THE SERVICE ACCOUNT:")
        print("\n1. 🌐 Go to Firebase Console:")
        print("   https://console.firebase.google.com/project/visual-search-fyp-a5eb6")
        
        print("\n2. ⚙️ Go to Project Settings:")
        print("   - Click the gear icon (⚙️) next to 'Project Overview'")
        print("   - Click 'Project settings'")
        
        print("\n3. 🔑 Generate Service Account:")
        print("   - Go to 'Service accounts' tab")
        print("   - Click 'Generate new private key'")
        print("   - Click 'Generate key' in the popup")
        print("   - A JSON file will be downloaded")
        
        print("\n4. 📁 Move the Downloaded File:")
        print(f"   - Rename the downloaded file to: {service_account_file}")
        print(f"   - Place it in this directory: {os.getcwd()}")
        
        print("\n5. 🔐 Enable Firebase Storage:")
        print("   - In Firebase Console, go to 'Storage' in the left sidebar")
        print("   - Click 'Get started'")
        print("   - Choose 'Start in production mode' or 'Start in test mode'")
        print("   - Select a location (e.g., us-central1)")
        
        print(f"\n6. ✅ After placing the file, run this script again!")
        
        return False

def test_firebase_storage_rules():
    """Provide information about Firebase Storage rules"""
    
    print("\n🔒 FIREBASE STORAGE RULES")
    print("=" * 40)
    
    print("Make sure your Firebase Storage rules allow uploads:")
    print("\n📝 Recommended rules for development:")
    print("""
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;  // For development only
    }
  }
}
""")
    
    print("📝 Recommended rules for production:")
    print("""
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /fashion_images/{fileName} {
      allow read: if true;
      allow write: if request.resource.size < 10 * 1024 * 1024  // 10MB limit
                   && request.resource.contentType.matches('image/.*');
    }
  }
}
""")
    
    print("\n🔧 To update rules:")
    print("1. Go to Firebase Console → Storage → Rules")
    print("2. Replace the rules with the code above")
    print("3. Click 'Publish'")

def main():
    """Main function"""
    
    setup_ok = check_firebase_setup()
    
    if setup_ok:
        print("\n🎉 Firebase setup looks good!")
        print("✅ Your backend should now upload to real Firebase Storage")
        print("✅ URLs returned will be real and working Firebase URLs")
        
        print("\n🚀 Next steps:")
        print("1. Restart your FastAPI server")
        print("2. Test with: python test_complete_firebase_flow.py")
        print("3. Check that URLs work in browser")
        
    else:
        print("\n⚠️ Firebase setup incomplete")
        print("📋 Follow the steps above to complete setup")
    
    test_firebase_storage_rules()

if __name__ == "__main__":
    main()

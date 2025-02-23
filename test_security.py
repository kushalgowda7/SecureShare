import os
from cryptography.fernet import Fernet
from dotenv import load_dotenv

def test_encryption():
    load_dotenv()
    
    # Test encryption key
    key = os.getenv("ENCRYPTION_KEY")
    if not key:
        print("ERROR: ENCRYPTION_KEY not found!")
        return False
    
    try:
        # Initialize Fernet
        fernet = Fernet(key)
        
        # Test encryption/decryption
        test_data = "Test message for encryption"
        encrypted = fernet.encrypt(test_data.encode())
        decrypted = fernet.decrypt(encrypted).decode()
        
        if test_data == decrypted:
            print("Encryption test: SUCCESS")
            return True
        else:
            print("Encryption test: FAILED")
            return False
    except Exception as e:
        print(f"Encryption test error: {e}")
        return False

def test_django_secret():
    load_dotenv()
    
    # Test Django secret key
    secret_key = os.getenv("SECRET_KEY")
    if not secret_key:
        print("ERROR: SECRET_KEY not found!")
        return False
    
    if len(secret_key) < 50:
        print("WARNING: SECRET_KEY might be too short!")
        return False
    
    print("Django secret key test: SUCCESS")
    return True

if __name__ == "__main__":
    encryption_test = test_encryption()
    secret_test = test_django_secret()
    
    if encryption_test and secret_test:
        print("All security tests passed!")
    else:
        print("Some security tests failed!")
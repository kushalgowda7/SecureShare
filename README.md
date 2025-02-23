# 🛡️ SECURESHARE - PEER-TO-PEER ENCRYPTED FILE SHARING

**SecureShare** is a **decentralized, end-to-end encrypted file-sharing application** that ensures **secure** and **private** transfers without relying on a central server.

---

# 🚀 HOW IT WORKS
Each user will have a unique id
**How to Send Files**
Copy your unique ID and share it with the recipient
Enter the recipient's unique ID
Select the files you want to send
Click the Share Files button
Confirm the file transfer in the popup window

**How to Receive Files**
Share your unique ID with the sender
Wait for the file transfer request popup
Review the files being sent
Click Receive to download the files
Files will be saved to your downloads folder

---

# Demo Video

![Working](https://github.com/user-attachments/assets/a954104a-f3e0-4463-b25e-c9c888c0c039)

---

## 🔥 WHY SECURESHARE?
✔ **No Centralized Server** – Direct peer-to-peer transfers for enhanced privacy.  
✔ **End-to-End Encryption** – Uses **AES-256** to protect files from unauthorized access.  
✔ **Cross-Platform** – Works on **Windows, macOS, and Linux**.  
✔ **Fast & Secure** – Real-time encrypted transfers without third-party involvement.  

---

# ⚡ HOW TO SETUP FOR LOCAL DEVELOPMENT

### **1️⃣ Clone the Repository**
```bash
git clone https://github.com/kushalgowda7/SecureShare.git
cd SecureShare
```

### **2️⃣ Create & Activate Virtual Environment**
```bash
python -m venv env
# macOS/Linux
source env/bin/activate  
# Windows
env\Scripts\activate  
```

### **3️⃣ Install Dependencies**
```bash
pip install -r requirements.txt
```

### **4️⃣ Configure Environment Variables**
Create a **.env** file and add the following:
```plaintext
SECRET_KEY="your_secret_key_here"
ENCRYPTION_KEY="your_encryption_key_here"
DEBUG=True
```

### **5️⃣ Run Database Migrations**
```bash
python manage.py migrate
```

### **6️⃣ Start the Server**
```bash
python manage.py runserver
```

🔗 Now, open **http://127.0.0.1:8000/** in your browser.

---


# 🔒 SECURITY FEATURES
🔹 **AES-256 Encryption** – Industry-standard security for file transfers.  
🔹 **No Data Logging** – Files are never stored on a central server.  

---



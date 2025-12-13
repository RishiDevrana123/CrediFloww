# How to Check Your MongoDB Atlas Database

## 🌐 Method 1: MongoDB Atlas Web Interface (Recommended)

### Step 1: Login to MongoDB Atlas
1. Go to: https://cloud.mongodb.com/
2. Login with your credentials

### Step 2: Navigate to Your Database
1. Click on "Database" in the left sidebar
2. Find your cluster "cluster0"
3. Click "Browse Collections" button

### Step 3: View Your Data
1. Select database: **crediflow**
2. You'll see collections:
   - **users** - All registered users
   - **applications** - All loan applications
3. Click on any collection to see the documents

---

## 🧪 Method 2: Test by Creating Sample Data

### Using PowerShell to Create a Test Application:

```powershell
# Create a test loan application
$body = @{
  fullName = "Test User"
  email = "[email protected]"
  phone = "9876543210"
  panCard = "ABCDE1234F"
  aadharNumber = "123456789012"
  loanType = "personal"
  loanAmount = 500000
  tenure = 36
  purpose = "Wedding expenses"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/applications" -Method POST -Body $body -ContentType "application/json"
```

### Then Check All Applications:

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/applications" -Method GET
```

---

## 💻 Method 3: Using MongoDB Compass (Desktop Tool)

### Step 1: Download MongoDB Compass
- Download from: https://www.mongodb.com/try/download/compass

### Step 2: Connect to Atlas
1. Open MongoDB Compass
2. Use this connection string:
```
mongodb+srv://rishidevrana2006_db_user:Rishi2006@cluster0.zefjtw0.mongodb.net/crediflow
```
3. Click "Connect"

### Step 3: Browse Your Data
- Navigate through databases and collections
- View, edit, and query documents visually

---

## 🔧 Method 4: Using VS Code Extension

### Step 1: Install MongoDB Extension
1. In VS Code, go to Extensions (Ctrl+Shift+X)
2. Search for "MongoDB for VS Code"
3. Install it

### Step 2: Connect to Your Database
1. Click MongoDB icon in sidebar
2. Click "Add Connection"
3. Paste your connection string
4. Browse your collections

---

## 📊 Method 5: Create Test Data Through Frontend

### Step 1: Use the Chat Interface
1. Open http://localhost:5173
2. Click "Apply Now" button
3. Fill in the loan application form
4. Submit the application

### Step 2: Check Backend Logs
The server console will show:
```
✅ MongoDB Connected Successfully
POST /api/applications 201 - - 234.567 ms
```

---

## 🎯 Quick Test Script

I'll create a test script for you to verify everything works!


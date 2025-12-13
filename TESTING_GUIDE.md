# 🎯 Frontend to Backend Connection - Testing Guide

## ✅ Setup Complete!

Your frontend is now **fully connected** to the backend and MongoDB Atlas!

---

## 🚀 How to Test the Full Flow

### **Step 1: Make sure both servers are running**

**Backend Server (Port 5000):**
```powershell
cd "c:\Rishi's Folder\Coding\CrediFlow\crediflow-server"
npm run dev
```
You should see:
```
✅ MongoDB Connected Successfully
🚀 Server running on port 5000
```

**Frontend Server (Port 5173):**
```powershell
cd "c:\Rishi's Folder\Coding\CrediFlow\crediflow-client"
npm run dev
```

---

### **Step 2: Open the Application**

1. Open browser: **http://localhost:5173**
2. Click **"Apply Now"** button
3. You'll be taken to the Chat page

---

### **Step 3: Fill Out the Loan Application (Follow this exact sequence)**

The chatbot will ask you questions. Here's what to answer:

1. **Loan Type**: Type `personal` (or `home` or `business`)
   - Bot asks: "What type of loan are you looking for?"
   - You type: **`personal`**

2. **Full Name**: Type your name
   - Bot asks: "What is your full name?"
   - You type: **`Rishi Dev Rana`**

3. **Email**: Type your email
   - Bot asks: "What is your email address?"
   - You type: **`[email protected]`**

4. **Phone**: Type 10-digit phone number
   - Bot asks: "What is your phone number?"
   - You type: **`9876543210`**

5. **PAN Card**: Type PAN number
   - Bot asks: "What is your PAN card number?"
   - You type: **`ABCDE1234F`**

6. **Aadhar**: Type 12-digit Aadhar number
   - Bot asks: "What is your Aadhar number?"
   - You type: **`123456789012`**

7. **Loan Amount**: Type the amount you need
   - Bot asks: "How much loan amount do you need?"
   - You type: **`500000`** (for ₹5 lakhs)

---

### **Step 4: What Happens Next**

✅ **Application Created in MongoDB!**
- The bot will show you an Application ID (like `CF1765354698627`)
- Data is **immediately saved** to MongoDB Atlas!
- Bot will ask you to upload documents

**At this point, go to MongoDB Atlas and REFRESH to see your data!**

---

### **Step 5: Complete the Application**

1. **Upload Documents** (optional):
   - Click the attachment button 📎
   - Upload any file (PDF, JPG, PNG)
   - Or skip this step

2. **Type "done"** to proceed
   - Bot will move through verification → underwriting → sanction
   - After a few seconds, you'll get **LOAN APPROVED** message! 🎉

---

## 🔍 How to Verify Data in MongoDB Atlas

### **Method 1: MongoDB Atlas Web Interface**

1. Go to: https://cloud.mongodb.com
2. Click **"Browse Collections"**
3. Select `crediflow` database → `applications` collection
4. Click **"REFRESH"** button (🔄)
5. You should see **QUERY RESULTS: 2** (or more)
6. Click on any document to see full details!

### **Method 2: Using API Directly**

```powershell
# Get all applications
Invoke-RestMethod -Uri "http://localhost:5000/api/applications" -Method GET

# Get specific application by ID
Invoke-RestMethod -Uri "http://localhost:5000/api/applications/{paste-id-here}" -Method GET
```

### **Method 3: Check Browser Console**

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. You'll see: `✅ Application created: {...}`
4. This shows the data that was sent to MongoDB

---

## 📊 What Gets Saved in MongoDB

When you fill out the form, this data is stored:

```json
{
  "_id": "69392cca65e1374985550770",
  "applicationId": "CF1765354698627",
  "fullName": "Rishi Dev Rana",
  "email": "[email protected]",
  "phone": "9876543210",
  "panCard": "ABCDE1234F",
  "aadharNumber": "123456789012",
  "loanType": "personal",
  "loanAmount": 500000,
  "tenure": 36,
  "status": "approved",
  "stage": "completed",
  "approvedAmount": 500000,
  "interestRate": 10.99,
  "emi": 16134,
  "createdAt": "2025-12-10T08:18:18.635Z",
  "updatedAt": "2025-12-10T08:20:45.123Z"
}
```

---

## 🎯 Quick Test Checklist

- [ ] Backend server running (Port 5000)
- [ ] Frontend server running (Port 5173)
- [ ] Open http://localhost:5173
- [ ] Click "Apply Now"
- [ ] Answer chatbot questions (see Step 3 above)
- [ ] Application ID displayed
- [ ] Check MongoDB Atlas - data visible!
- [ ] Type "done" to complete application
- [ ] Loan approved message received
- [ ] Refresh MongoDB - status updated to "approved"!

---

## 🐛 Troubleshooting

### **"Application not created" error**
- Check if backend server is running
- Check browser console for errors
- Make sure MongoDB connection is active

### **Data not showing in MongoDB**
- Click **REFRESH** button in Atlas
- Wait 2-3 seconds after submission
- Check correct database (`crediflow`) and collection (`applications`)

### **Frontend errors**
- Clear browser cache (Ctrl + Shift + Delete)
- Restart frontend server
- Check if all dependencies are installed: `npm install`

---

## 🎉 Success Indicators

You'll know it's working when:

✅ Bot shows: `"Your application CF... has been created"`  
✅ MongoDB Atlas shows: **QUERY RESULTS: 1** (or more)  
✅ Console shows: `✅ Application created`  
✅ Loan gets approved after typing "done"  
✅ MongoDB shows status changed to "approved"  

---

## 📝 Next Steps After Testing

Once you confirm it's working:

1. **Try different loan types** (home, business)
2. **Try different amounts** (100000, 1000000)
3. **Upload actual documents** (PAN, Aadhar PDFs)
4. **Check all data fields** in MongoDB
5. **Test from different browsers**

---

## 💡 Pro Tips

- Keep MongoDB Atlas tab open while testing
- Refresh Atlas after each application
- Check browser console for detailed logs
- Each application gets a unique ID
- All applications are stored permanently in MongoDB

---

**Your CrediFlow app is now fully integrated with the backend! 🚀**

Fill out the form and watch your data appear in MongoDB Atlas in real-time!

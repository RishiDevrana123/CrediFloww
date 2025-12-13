# CrediFlow Debugging Guide

## Quick Debugging Steps

### 1. Check Backend Server
```powershell
# Navigate to backend directory
cd crediflow-server

# Check if server is running
# Look for: "✅ MongoDB Connected Successfully"
# Server should be on: http://localhost:5000
```

### 2. Check Frontend Server
```powershell
# Navigate to frontend directory
cd crediflow-client

# Frontend should be on: http://localhost:5173
```

### 3. Test Backend API Directly
```powershell
# Test health endpoint
Invoke-RestMethod -Uri "http://localhost:5000/health" -Method GET

# Test create application
$body = @{
    fullName = "Test User"
    email = "test@example.com"
    phone = "9876543210"
    panCard = "ABCDE1234F"
    aadharNumber = "123456789012"
    loanType = "personal"
    loanAmount = 500000
    tenure = 36
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/applications" -Method POST -Body $body -ContentType "application/json"
```

## Common Issues & Fixes

### Issue 1: "Error creating application" - 400 Bad Request

**Symptoms:**
- Bot says "Sorry, there was an error creating your application"
- Backend logs show: `POST /api/applications 400`

**Debug Steps:**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for error message like: `❌ API Error: {...}`
4. Check the `message` field for validation errors

**Common Causes:**
- Missing required field (fullName, email, phone, panCard, aadharNumber, loanType, loanAmount, tenure)
- Invalid data format (email missing @, phone not 10 digits, PAN wrong format)
- loanAmount too low (< ₹10,000) or too high (> ₹1,00,00,000)
- tenure outside range (6-360 months)

**Fix:**
Check that all fields in ChatContext are being collected correctly.

---

### Issue 2: Repetitive Questions

**Symptoms:**
- Bot asks same question multiple times
- Bot loops back to previous questions

**Fix:**
This was fixed by adding `collectingField` state tracking. If it still happens:
1. Clear browser cache and refresh
2. Check browser console for state updates
3. Verify `collectingField` is updating correctly

---

### Issue 3: CORS Errors

**Symptoms:**
- Browser console shows: "CORS policy: No 'Access-Control-Allow-Origin'"
- Network requests fail with CORS error

**Fix:**
1. Verify backend .env has: `CLIENT_URL=http://localhost:5173`
2. Check server.js CORS configuration
3. Restart backend server

---

### Issue 4: MongoDB Connection Failed

**Symptoms:**
- Backend shows: "❌ MongoDB connection error"
- Cannot create applications

**Fix:**
1. Check MongoDB Atlas connection string in `.env`
2. Verify IP whitelist in MongoDB Atlas (should allow your IP or 0.0.0.0/0)
3. Test connection string credentials

---

### Issue 5: Data Not Saving to MongoDB

**Symptoms:**
- Application seems created but not in MongoDB Atlas
- No errors shown

**Debug:**
1. Go to MongoDB Atlas → Clusters → Browse Collections
2. Click REFRESH button (important!)
3. Check `crediflow` database → `applications` collection
4. Verify QUERY RESULTS count increases

---

## Debugging Logs

### Backend Logs to Watch:
- `📝 Creating application with data:` - Shows incoming data
- `✅ Application created successfully:` - Shows generated applicationId
- `❌ Error creating application:` - Shows error details

### Frontend Logs to Watch:
- `📤 Sending application data:` - Shows data being sent to backend
- `✅ Application created:` - Shows backend response
- `❌ Error creating application:` - Shows error details
- `❌ API Error:` - Shows detailed API error with URL, method, status

## Test Flow

### Correct Conversation Flow:
1. Bot: "What type of loan?" → User: "personal"
2. Bot: "What is your full name?" → User: "Rishi Dev Rana"
3. Bot: "What is your email?" → User: "rishi@example.com"
4. Bot: "What is your phone?" → User: "9876543210"
5. Bot: "What is your PAN?" → User: "ABCDE1234F"
6. Bot: "What is your Aadhar?" → User: "123456789012"
7. Bot: "How much loan amount?" → User: "500000"
8. Bot: "Application CF123... created" ✅

### Expected Backend Log:
```
📝 Creating application with data: {
  fullName: 'Rishi Dev Rana',
  email: 'rishi@example.com',
  phone: '9876543210',
  panCard: 'ABCDE1234F',
  aadharNumber: '123456789012',
  loanType: 'personal',
  loanAmount: 500000,
  tenure: 36
}
✅ Application created successfully: CF17653...
POST /api/applications 201 45.234 ms - 512
```

### Expected Frontend Console:
```
📤 Sending application data: {...}
✅ Application created: {status: 'success', data: {...}}
```

## Manual Database Check

### Query in MongoDB Atlas:
```javascript
// Find all applications
db.applications.find()

// Find by applicationId
db.applications.findOne({applicationId: "CF1765354698627"})

// Count all applications
db.applications.countDocuments()
```

## Environment Variables Checklist

### Backend (.env):
- ✅ MONGODB_URI (MongoDB Atlas connection string)
- ✅ JWT_SECRET
- ✅ PORT=5000
- ✅ CLIENT_URL=http://localhost:5173
- ✅ NODE_ENV=development

### Frontend:
- No .env needed (using localhost:5000 hardcoded)

## Reset Everything

If all else fails:
1. Stop both servers (Ctrl+C)
2. Clear browser cache and localStorage
3. Restart backend: `cd crediflow-server; npm run dev`
4. Restart frontend: `cd crediflow-client; npm run dev`
5. Open fresh browser tab to http://localhost:5173/chat
6. Try conversation flow again

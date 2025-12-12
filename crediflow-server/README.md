# CrediFlow Backend Server

## 🚀 Features

- **RESTful API** for loan application management
- **Real-time chat** with Socket.IO
- **MongoDB** database for data persistence
- **JWT authentication** for secure access
- **File upload** support for documents
- **Multi-stage loan processing** workflow
- **Automated EMI calculation**

## 📋 Prerequisites

Before running the server, make sure you have:

1. **Node.js** (v16 or higher)
2. **MongoDB** (local or MongoDB Atlas)
3. **npm** or **yarn**

## 🛠️ Installation

1. Navigate to the server directory:
   ```bash
   cd crediflow-server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file from example:
   ```bash
   copy .env.example .env
   ```

4. Update `.env` with your configuration (see below)

## ⚙️ Configuration

### MongoDB Setup Options

#### Option 1: Local MongoDB (Recommended for Development)
1. Install MongoDB Community Server from: https://www.mongodb.com/try/download/community
2. Start MongoDB service
3. Use in `.env`:
   ```
   MONGODB_URI=mongodb://localhost:27017/crediflow
   ```

#### Option 2: MongoDB Atlas (Cloud - Recommended for Production)
1. Create free account at: https://www.mongodb.com/cloud/atlas
2. Create a new cluster (free tier available)
3. Get your connection string
4. Use in `.env`:
   ```
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/crediflow?retryWrites=true&w=majority
   ```

### Environment Variables

Update your `.env` file with these values:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB - Choose one:
# Local:
MONGODB_URI=mongodb://localhost:27017/crediflow
# OR Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/crediflow

# JWT Security
JWT_SECRET=your_super_secret_key_here_change_this
JWT_EXPIRE=7d

# Frontend URL
CLIENT_URL=http://localhost:5173

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

## 🏃 Running the Server

### Development mode (with auto-reload):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000`

## 📡 API Endpoints

### Applications
- `POST /api/applications` - Create new application
- `GET /api/applications/:id` - Get application by ID
- `GET /api/applications` - Get all applications
- `PUT /api/applications/:id` - Update application
- `DELETE /api/applications/:id` - Delete application
- `POST /api/applications/:id/upload` - Upload document
- `PUT /api/applications/:id/stage` - Update stage
- `PUT /api/applications/:id/approve` - Approve application
- `PUT /api/applications/:id/reject` - Reject application

### Chat
- `POST /api/chat/message` - Send chat message
- `GET /api/chat/:applicationId/history` - Get chat history

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

## 🔌 Socket.IO Events

### Client to Server
- `join-application` - Join application room
- `send-message` - Send chat message
- `update-stage` - Update application stage
- `typing` - User is typing
- `stop-typing` - User stopped typing

### Server to Client
- `new-message` - New message received
- `stage-updated` - Stage updated
- `user-typing` - User is typing
- `user-stop-typing` - User stopped typing
- `error` - Error occurred

## 📁 Project Structure

```
crediflow-server/
├── controllers/          # Request handlers
│   ├── application.controller.js
│   ├── chat.controller.js
│   └── auth.controller.js
├── models/              # Database schemas
│   ├── Application.model.js
│   └── User.model.js
├── routes/              # API routes
│   ├── application.routes.js
│   ├── chat.routes.js
│   └── auth.routes.js
├── middleware/          # Custom middleware
│   ├── auth.middleware.js
│   └── upload.middleware.js
├── sockets/             # Socket.IO handlers
│   └── chat.socket.js
├── uploads/             # Uploaded files
├── .env                 # Environment variables
├── .env.example         # Environment template
├── server.js            # Main server file
└── package.json         # Dependencies
```

## 🧪 Testing the API

You can test the API using:
- **Postman** - Import the endpoints
- **cURL** - Command line
- **Frontend** - CrediFlow React app

### Example: Create Application
```bash
curl -X POST http://localhost:5000/api/applications \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "[email protected]",
    "phone": "9876543210",
    "panCard": "ABCDE1234F",
    "aadharNumber": "123456789012",
    "loanType": "personal",
    "loanAmount": 500000,
    "tenure": 36
  }'
```

## 🔒 Security Features

- **Helmet** - Security headers
- **CORS** - Cross-origin protection
- **JWT** - Token-based authentication
- **bcrypt** - Password hashing
- **File validation** - Upload restrictions

## 📊 Database Schema

### Application Model
- Personal info (name, email, phone, PAN, Aadhar)
- Loan details (type, amount, tenure)
- Employment info
- Documents
- Status tracking
- Chat history
- Approval/rejection data

### User Model
- Authentication credentials
- Profile information
- Role-based access

## 🚨 Troubleshooting

### MongoDB Connection Issues
1. Check if MongoDB is running
2. Verify connection string
3. Check firewall settings
4. For Atlas: Whitelist your IP

### Port Already in Use
```bash
# Change PORT in .env file or kill process
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

## 📝 Next Steps

1. Set up MongoDB (local or Atlas)
2. Configure `.env` file
3. Run `npm install`
4. Start server with `npm run dev`
5. Test with frontend or Postman
6. Deploy to production (Heroku, Railway, etc.)

## 🤝 Support

For issues or questions, please create an issue in the repository.

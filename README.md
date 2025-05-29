# SWP391 Project - Blood Donation System

## Setup Instructions

### Backend Setup

1. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment Variables**
   - Update the `.env` file with your specific configurations
   - **Important**: Update Google OAuth settings in Google Console

3. **Google OAuth Configuration**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to "APIs & Services" > "Credentials"
   - Edit your OAuth 2.0 Client ID
   - Add these URLs to "Authorized redirect URIs":
     - `http://localhost:5001/api/auth/google/callback`
   - Add these URLs to "Authorized JavaScript origins":
     - `http://localhost:5001`
     - `http://localhost:3000`

4. **Start MongoDB**
   - Make sure MongoDB is running on `mongodb://localhost:27017/swp391`

5. **Start the backend server**
   ```bash
   npm start
   # or for development with auto-restart:
   npm run dev
   ```

### Frontend Setup

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start the frontend server**
   ```bash
   npm start
   ```

## Features

- **Google OAuth Login**: Users can sign in with their Google accounts
- **JWT Authentication**: Secure token-based authentication
- **Role-based Access**: Support for Guest, Member, Staff, and Admin roles
- **Modern UI**: Clean and responsive design

## API Endpoints

### Authentication
- `GET /api/auth/google` - Initiate Google OAuth login
- `GET /api/auth/google/callback` - Google OAuth callback
- `GET /api/health` - Health check endpoint

## Important Notes

1. **Port Configuration**: 
   - Backend runs on port 5001 (changed from 5000 to avoid conflicts)
   - Frontend runs on port 3000

2. **Google OAuth Setup**: 
   - Must configure redirect URIs in Google Console
   - Use the exact URLs provided above

3. **Database**: 
   - MongoDB required
   - Database name: `swp391`

## Troubleshooting

### Port Already in Use Error
If you get "EADDRINUSE" error:
```bash
# Check what's using the port
netstat -ano | findstr :5001

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### Google OAuth Redirect URI Mismatch
- Ensure you've added the correct callback URL in Google Console
- URL must be exactly: `http://localhost:5001/api/auth/google/callback`

### MongoDB Connection Error
- Ensure MongoDB is running
- Check the connection string in `.env` file

## Project Structure

```
├── backend/
│   ├── config/          # Passport configuration
│   ├── controllers/     # Business logic
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   └── server.js        # Main server file
└── frontend/
    ├── src/
    │   ├── components/  # React components
    │   └── App.js       # Main App component
    └── public/
```

# Backend Setup Instructions

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or remote connection)
- Google OAuth credentials (see root GOOGLE_OAUTH_SETUP.md)

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Configuration:**
   - Copy `.env.example` to `.env`
   ```bash
   cp .env.example .env
   ```

3. **Configure Environment Variables:**
   Edit the `.env` file and provide the required values:

   ```env
   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/swp391_blood_donation

   # Google OAuth (see ../GOOGLE_OAUTH_SETUP.md for instructions)
   GOOGLE_CLIENT_ID=your_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here

   # JWT Configuration
   JWT_SECRET=your_secure_random_string_here
   ```

4. **Google OAuth Setup:**
   - Follow the instructions in the root `GOOGLE_OAUTH_SETUP.md` file
   - Obtain your Google Client ID and Secret
   - Update the `.env` file with your credentials

5. **Database Setup:**
   - Ensure MongoDB is running
   - Optionally run the seed scripts:
   ```bash
   node seed.js
   node seedQuestions.js
   ```

## Running the Server

### Development Mode:
```bash
npm run dev
# or
node server-dev.js
```

### Production Mode:
```bash
npm start
# or
node server.js
```

The server will start on `http://localhost:5001` by default.

## Common Issues

### OAuth2Strategy requires a clientID option
This error occurs when Google OAuth credentials are missing from the `.env` file.

**Solution:**
1. Ensure `.env` file exists in the backend folder
2. Add your Google OAuth credentials to the `.env` file
3. Restart the server

### MongoDB Connection Issues
**Solution:**
1. Ensure MongoDB is running
2. Check the `MONGODB_URI` in your `.env` file
3. Verify your MongoDB connection string

## API Endpoints
- Base URL: `http://localhost:5001/api`
- Authentication: `/api/auth/*`
- Users: `/api/users/*`
- Blood requests: `/api/need-requests/*`
- Blood units: `/api/blood-units/*`
- Donations: `/api/donate-registrations/*`

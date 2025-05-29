# Google OAuth Setup Guide

## 🔧 **Step-by-Step Google Cloud Console Configuration**

### **1. Access Google Cloud Console**
- Go to: https://console.cloud.google.com/
- Sign in with your Google account: `baanhnguyenn@gmail.com`

### **2. Select or Create Project**
- If you don't have a project, create a new one
- If you have a project, select it from the dropdown

### **3. Enable Google+ API**
- Go to **APIs & Services** → **Library**
- Search for "Google+ API" 
- Click on it and click **"Enable"**

### **4. Configure OAuth Consent Screen** 
- Go to **APIs & Services** → **OAuth consent screen**
- Choose **"External"** user type
- Fill in required fields:
  - App name: `SWP391 Blood Donation`
  - User support email: `baanhnguyenn@gmail.com`
  - Developer contact email: `baanhnguyenn@gmail.com`
- Click **"Save and Continue"**

### **5. Configure OAuth 2.0 Credentials**
- Go to **APIs & Services** → **Credentials**
- Click **"+ CREATE CREDENTIALS"** → **"OAuth 2.0 Client IDs"**
- Application type: **"Web application"**
- Name: `SWP391 Web Client`

### **6. Add Authorized URIs**
**Authorized JavaScript origins:**
```
http://localhost:3000
http://localhost:5001
```

**Authorized redirect URIs:**
```
http://localhost:5001/api/auth/google/callback
```

### **7. Save and Copy Credentials**
- Click **"Create"**
- Copy the **Client ID** and **Client Secret**
- Update your `.env` file with these values

## 🧪 **Testing the Setup**

### **Current Configuration:**
- Client ID: `615572200727-ijetucm6sdli7vvu12pnfose3m86cekh.apps.googleusercontent.com`
- Redirect URI: `http://localhost:5001/api/auth/google/callback`
- Frontend URL: `http://localhost:3000`
- Backend URL: `http://localhost:5001`

### **Test Steps:**
1. Open: http://localhost:3000
2. Click **"LOGIN"** in the header
3. Click **"Login with Google"** button
4. Should redirect to Google OAuth without errors

## 🐛 **Troubleshooting**

### **Error: redirect_uri_mismatch**
- Verify the redirect URI in Google Console exactly matches: `http://localhost:5001/api/auth/google/callback`
- No trailing slashes, exact case matching
- Check that OAuth consent screen is configured

### **Error: Access blocked**
- Make sure OAuth consent screen is properly configured
- Add your email to test users if needed
- Ensure Google+ API is enabled

### **Error: Client ID not found**
- Verify Client ID and Secret in `.env` file
- Restart backend server after changing `.env`

## 📋 **Checklist**
- [ ] Google+ API enabled
- [ ] OAuth consent screen configured
- [ ] OAuth 2.0 credentials created
- [ ] Authorized JavaScript origins added
- [ ] Authorized redirect URIs added
- [ ] `.env` file updated with correct credentials
- [ ] Backend server restarted
- [ ] Frontend server running

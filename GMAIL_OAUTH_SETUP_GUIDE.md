# Gmail OAuth Setup Guide for Development

## 🚨 **Current Issue: Error 403 - Access Denied**

You're seeing this error because your Google OAuth app is in "testing" mode and you haven't been added as a test user.

## ✅ **Quick Fix (5 minutes):**

### Step 1: Add Yourself as a Test User

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Select your project** (the one with your OAuth credentials)
3. **Navigate to**: APIs & Services > OAuth consent screen
4. **Click "Edit App"**
5. **Scroll to "Test users" section**
6. **Click "Add Users"**
7. **Add your Gmail address** (the one you want to test with)
8. **Click "Save"**

### Step 2: Test the Authentication

1. Go back to your task manager app
2. Click "Authenticate Gmail"
3. You should now be able to complete the OAuth flow

## 🔧 **Alternative Solutions:**

### Option A: Publish App for Testing
```
1. In OAuth consent screen → Click "Publish App"
2. Confirm publishing
3. App will show "unverified" warning but will work
```

### Option B: Use Internal User Type (Google Workspace only)
```
1. Change User Type to "Internal"
2. Only works if you have Google Workspace
3. Bypasses verification for organization users
```

## 📋 **Complete OAuth Setup Checklist:**

### 1. Google Cloud Console Setup
- ✅ Project created
- ✅ Gmail API enabled
- ✅ OAuth consent screen configured
- ✅ Credentials created (Client ID & Secret)

### 2. OAuth Consent Screen Configuration
```
App Information:
- App name: "AI Task Manager"
- User support email: your-email@gmail.com
- Developer contact: your-email@gmail.com

Scopes (Add these):
- https://www.googleapis.com/auth/gmail.readonly
- https://www.googleapis.com/auth/gmail.modify
- https://www.googleapis.com/auth/userinfo.email
- https://www.googleapis.com/auth/userinfo.profile

Test Users:
- Add your Gmail address here
```

### 3. Authorized Redirect URIs
Make sure these are configured in your OAuth client:
```
http://localhost:8000/api/integrations/gmail/callback
```

### 4. Environment Variables
Your `.env` file should have:
```
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:8000/api/integrations/gmail/callback
```

## 🔍 **Troubleshooting:**

### Error: "This app isn't verified"
- **Solution**: Add yourself as a test user OR publish the app
- **For Development**: Adding test users is sufficient

### Error: "Access denied - No token provided"
- **Solution**: This was a backend authentication issue - now fixed!
- **Cause**: The OAuth callback route was requiring JWT authentication
- **Fix**: Callback route no longer requires authentication (as it should be)

### Error: "redirect_uri_mismatch"
- **Solution**: Check that redirect URI in code matches Google Console
- **Check**: `http://localhost:8000/api/integrations/gmail/callback`

### Error: "invalid_client"
- **Solution**: Verify Client ID and Secret in `.env` file
- **Check**: No extra spaces or line breaks in the values

### Error: OAuth popup blocked
- **Solution**: Allow popups for localhost in your browser
- **Alternative**: Copy the auth URL and paste in a new tab

## 🚀 **For Production (Later):**

When you're ready to publish your app for real users:

1. **Complete App Information**:
   - App homepage URL
   - Privacy policy URL
   - Terms of service URL

2. **Domain Verification**:
   - Verify ownership of your domain
   - Use Google Search Console

3. **Submit for Verification**:
   - Required for sensitive/restricted scopes
   - Includes security assessment
   - Can take 4-6 weeks

## 📞 **Need Help?**

If you're still having issues:
1. Check that you've added your email as a test user
2. Make sure you're using the same Gmail account for testing
3. Clear browser cookies and try again
4. Check the browser console for additional error messages

## 🎯 **Expected Behavior After Fix:**

1. Click "Authenticate Gmail" → Opens Google OAuth page
2. Select your Gmail account → Shows consent screen
3. Click "Allow" → Redirects back to your app
4. Gmail integration shows "Authenticated" ✅
5. Real emails appear instead of mock data 
# 🔧 Quick Fix for OAuth Redirect Issue

## The Problem
Your OAuth is redirecting to `localhost:3000` because Supabase doesn't have the correct redirect URLs configured for your mobile app.

## 🚀 Immediate Fix Steps

### 1. Configure Supabase Redirect URLs

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**: `fjlhbuqjaydqaqabympa`
3. **Navigate to**: Authentication → URL Configuration
4. **Add these redirect URLs**:

#### For Development (Expo Go):
```
exp://127.0.0.1:8081/--/auth
exp://localhost:8081/--/auth
exp://192.168.1.100:8081/--/auth
```
*Note: Replace `192.168.1.100` with your actual local IP address*

#### For Custom Development Build:
```
akale-oru-istham://auth
```

#### For Web (if testing in browser):
```
http://localhost:3000
http://localhost:19006
```

### 2. Configure Google OAuth Redirect URLs

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Navigate to**: APIs & Services → Credentials
3. **Edit your OAuth 2.0 Client ID**
4. **Add Authorized redirect URIs**:
   ```
   https://fjlhbuqjaydqaqabympa.supabase.co/auth/v1/callback
   ```

### 3. Enable Google Provider in Supabase

1. **In Supabase Dashboard**: Authentication → Providers
2. **Enable Google provider**
3. **Add your Google OAuth credentials**:
   - Client ID (from Google Cloud Console)
   - Client Secret (from Google Cloud Console)

## 🔍 How to Find Your Local IP Address

### Windows:
```bash
ipconfig
```
Look for "IPv4 Address" under your active network adapter.

### Check Expo Development Server:
When you run `npm start`, Expo will show you the URL like:
```
Metro waiting on exp://192.168.1.100:8081
```
Use that IP address in your redirect URLs.

## ⚡ Alternative Quick Test

If you want to test immediately without full OAuth setup, use the **green "Dev: Sign In" button** in the app. This creates a mock user session so you can test the authenticated features while setting up OAuth.

## 🐛 Debug Steps

1. **Check current redirect URL**:
   - Tap the "🔍 Check Supabase Status" button in your app
   - Look at the console logs when trying to sign in

2. **Verify environment variables**:
   Your `.env` file looks correct with:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://fjlhbuqjaydqaqabympa.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
   ```

3. **Test the flow**:
   - Try the Google sign-in button
   - Check console output for the redirect URL being used
   - Make sure that URL is added to both Supabase and Google Cloud Console

## 🎯 Expected Flow

1. **Tap Google Sign In** → Opens Google OAuth page
2. **Complete Google authentication** → Redirects to your app scheme
3. **App receives the token** → Sets up user session
4. **Navigate to main app** → You're signed in!

The redirect to localhost:3000 indicates that Supabase is using a default web redirect URL instead of your mobile app scheme. Following the steps above will fix this issue.

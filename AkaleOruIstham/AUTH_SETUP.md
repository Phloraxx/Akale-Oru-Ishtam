# Google Authentication Setup for Akale Oru Istham

This guide will help you set up Google authentication with Supabase for the Akale Oru Istham app.

## Prerequisites

1. **Supabase Project**: Make sure you have a Supabase project set up
2. **Google Cloud Project**: You'll need a Google Cloud project for OAuth credentials

## Setup Steps

### 1. Enable Google Authentication in Supabase

1. Go to your Supabase dashboard
2. Navigate to **Authentication** > **Providers**
3. Find **Google** and click **Enable**
4. You'll need to provide:
   - **Client ID** (from Google Cloud Console)
   - **Client Secret** (from Google Cloud Console)

### 2. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google+ API**
4. Go to **Credentials** > **Create Credentials** > **OAuth 2.0 Client IDs**
5. Choose **Application Type**: "Web application"
6. Add **Authorized redirect URIs**:
   - `https://[your-project-ref].supabase.co/auth/v1/callback`
   - Replace `[your-project-ref]` with your actual Supabase project reference

### 3. Configure Environment Variables

Create a `.env` file in your project root (if you haven't already):

```env
EXPO_PUBLIC_SUPABASE_URL=https://[your-project-ref].supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
```

### 4. Update Supabase Configuration

In your Supabase dashboard:

1. Go to **Authentication** > **URL Configuration**
2. Add your app's redirect URL:
   - For development: `akale-oru-istham://auth`
   - For production: Use your actual deep link scheme

### 5. Test the Authentication

1. Start your development server:
   ```bash
   npm start
   ```

2. Open the app and try to sign in with Google
3. The authentication flow should redirect to Google's OAuth page
4. After successful authentication, you should be redirected back to the app

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI"**
   - Make sure the redirect URI in Google Cloud Console matches exactly with Supabase
   - Check that there are no trailing slashes or typos

2. **"OAuth configuration not found"**
   - Verify that Google provider is enabled in Supabase
   - Check that Client ID and Secret are correctly entered

3. **App doesn't redirect back**
   - Ensure the custom scheme `akale-oru-istham://` is properly configured
   - Check that the app.json includes the correct scheme

### Development vs Production

- **Development**: The redirect URL will use your local development server
- **Production**: Make sure to update redirect URLs for your published app

## Database Considerations

The app automatically saves user information when profiles are created:
- `created_by`: User's Supabase ID
- `user_email`: User's email address

Make sure your database schema includes these fields:

```sql
-- Add user tracking to objects table
ALTER TABLE objects 
ADD COLUMN IF NOT EXISTS user_email TEXT,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
```

## Security Notes

1. Never commit your `.env` file to version control
2. Use environment-specific configurations
3. Regularly rotate your API keys and secrets
4. Consider implementing row-level security (RLS) in Supabase

## Next Steps

Once authentication is working:
1. Test profile creation with user association
2. Implement user-specific features
3. Add proper error handling for network issues
4. Consider implementing offline functionality

For more help, refer to:
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)

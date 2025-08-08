import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { supabase } from '../services/supabaseClient';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import type { User, Session } from '@supabase/supabase-js';

// Complete the auth session for web browser
WebBrowser.maybeCompleteAuthSession();

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  // Development bypass
  devSignIn: () => Promise<void>;
  // Force refresh session
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session ? `User: ${session.user.email}` : 'No session');
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event, session ? `User: ${session.user.email}` : 'No session');
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      console.log('Starting Google sign-in process...');
      
      // Check if Supabase is properly configured
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('Current session check:', session ? 'Has session' : 'No session', sessionError);
      
      // For mobile platforms (React Native/Expo), use a different approach
      const redirectUrl = AuthSession.makeRedirectUri({
        scheme: 'akale-oru-istham',
        path: 'auth',
      });
      
      console.log('Using redirect URL:', redirectUrl);

      // For development in Expo Go, we need to use the Expo redirect URL
      const isExpoGo = __DEV__ && redirectUrl.includes('exp://');
      const finalRedirectUrl = isExpoGo 
        ? redirectUrl 
        : 'akale-oru-istham://auth';

      console.log('Final redirect URL:', finalRedirectUrl);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: finalRedirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('Error signing in with Google:', error.message);
        throw error;
      }

      console.log('OAuth data received:', data);

      // Open the OAuth URL
      if (data.url) {
        console.log('Opening OAuth URL:', data.url);
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          finalRedirectUrl
        );
        
        console.log('WebBrowser result:', result);

        if (result.type === 'success' && result.url) {
          console.log('Processing successful OAuth result...');
          
          // For Supabase OAuth, the tokens are in the fragment, not query params
          const url = new URL(result.url);
          let accessToken = url.searchParams.get('access_token');
          let refreshToken = url.searchParams.get('refresh_token');
          
          // If not in query params, check the hash fragment
          if (!accessToken && url.hash) {
            const hashParams = new URLSearchParams(url.hash.substring(1));
            accessToken = hashParams.get('access_token');
            refreshToken = hashParams.get('refresh_token');
          }

          console.log('Extracted tokens:', { 
            hasAccessToken: !!accessToken, 
            hasRefreshToken: !!refreshToken,
            url: result.url
          });

          if (accessToken) {
            console.log('Setting session with extracted tokens...');
            const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            });

            if (sessionError) {
              console.error('Session error:', sessionError);
              throw sessionError;
            }
            
            console.log('Session set successfully:', sessionData);
            
            // Manually update the context state to ensure immediate UI update
            if (sessionData.session) {
              setSession(sessionData.session);
              setUser(sessionData.session.user);
              console.log('Auth context updated with user:', sessionData.session.user.email);
            }
          } else {
            console.error('No access token found in callback URL');
            throw new Error('No access token received from authentication');
          }
        } else if (result.type === 'cancel') {
          console.log('OAuth was cancelled by user');
          throw new Error('Authentication was cancelled');
        } else {
          console.log('OAuth failed with result:', result);
          throw new Error('Authentication failed');
        }
      } else {
        throw new Error('No OAuth URL received from Supabase');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error.message);
        throw error;
      }
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Development bypass - creates a fake user session for testing
  const devSignIn = async () => {
    try {
      setLoading(true);
      // Create a mock user for development
      const mockUser = {
        id: 'dev-user-123',
        email: 'dev@example.com',
        user_metadata: { name: 'Development User' },
        app_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as User;
      
      const mockSession = {
        access_token: 'dev-token',
        refresh_token: 'dev-refresh',
        expires_in: 3600,
        expires_at: Date.now() + 3600000,
        token_type: 'bearer',
        user: mockUser,
      } as Session;

      setUser(mockUser);
      setSession(mockSession);
      console.log('Development user signed in');
    } catch (error) {
      console.error('Dev sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Force refresh session
  const refreshSession = async () => {
    try {
      setLoading(true);
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error refreshing session:', error);
        throw error;
      }
      console.log('Session refreshed:', session ? `User: ${session.user.email}` : 'No session');
      setSession(session);
      setUser(session?.user ?? null);
    } catch (error) {
      console.error('Refresh session error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signInWithGoogle,
    signOut,
    devSignIn,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

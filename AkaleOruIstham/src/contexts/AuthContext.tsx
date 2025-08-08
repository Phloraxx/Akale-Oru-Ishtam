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
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      
      // More robust redirect URL handling
      let redirectUrl: string;
      
      if (__DEV__) {
        // For Expo Go development
        redirectUrl = AuthSession.makeRedirectUri({
          scheme: 'exp',
          preferLocalhost: true,
        });
      } else {
        // For production builds
        redirectUrl = 'akale-oru-istham://auth';
      }

      console.log('🔗 Using redirect URL:', redirectUrl);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('❌ OAuth setup error:', error);
        throw new Error(`OAuth setup failed: ${error.message}`);
      }

      if (!data.url) {
        throw new Error('No OAuth URL received from Supabase. Check your Google provider configuration in Supabase dashboard.');
      }
      
      console.log('🚀 Opening OAuth URL:', data.url);
      
      // Open the OAuth URL with better error handling
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectUrl,
        {
          showInRecents: true,
        }
      );

      console.log('📱 Auth session result:', result);

      if (result.type === 'success' && result.url) {
        // Parse tokens from the result URL
        const url = new URL(result.url);
        
        // Check both query params and hash fragment for tokens
        let accessToken = url.searchParams.get('access_token');
        let refreshToken = url.searchParams.get('refresh_token');
        
        if (!accessToken && url.hash) {
          const hashParams = new URLSearchParams(url.hash.substring(1));
          accessToken = hashParams.get('access_token');
          refreshToken = hashParams.get('refresh_token');
        }

        if (accessToken) {
          console.log('✅ Tokens received, creating session...');
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });

          if (sessionError) {
            console.error('❌ Session creation error:', sessionError);
            throw new Error(`Failed to create session: ${sessionError.message}`);
          }
          
          if (sessionData.session) {
            setSession(sessionData.session);
            setUser(sessionData.session.user);
            console.log('🎉 Authentication successful!');
          }
        } else {
          throw new Error('Authentication completed but no tokens received');
        }
      } else if (result.type === 'cancel') {
        throw new Error('Authentication was cancelled by user');
      } else {
        console.error('❌ Authentication failed:', result);
        throw new Error(`Authentication failed with result: ${result.type}`);
      }
    } catch (error) {
      console.error('🚨 Google Sign-In Error:', error);
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
        throw error;
      }
    } catch (error) {
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
        throw error;
      }
      setSession(session);
      setUser(session?.user ?? null);
    } catch (error) {
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
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

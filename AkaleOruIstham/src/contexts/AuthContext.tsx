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
      
      // Check if Supabase is properly configured
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      // For mobile platforms (React Native/Expo), use a different approach
      const redirectUrl = AuthSession.makeRedirectUri({
        scheme: 'akale-oru-istham',
        path: 'auth',
      });

      // For development in Expo Go, we need to use the Expo redirect URL
      const isExpoGo = __DEV__ && redirectUrl.includes('exp://');
      const finalRedirectUrl = isExpoGo 
        ? redirectUrl 
        : 'akale-oru-istham://auth';

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
        throw error;
      }

      // Open the OAuth URL
      if (data.url) {
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          finalRedirectUrl
        );

        if (result.type === 'success' && result.url) {
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

          if (accessToken) {
            const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            });

            if (sessionError) {
              throw sessionError;
            }
            
            // Manually update the context state to ensure immediate UI update
            if (sessionData.session) {
              setSession(sessionData.session);
              setUser(sessionData.session.user);
            }
          } else {
            throw new Error('No access token received from authentication');
          }
        } else if (result.type === 'cancel') {
          throw new Error('Authentication was cancelled');
        } else {
          throw new Error('Authentication failed');
        }
      } else {
        throw new Error('No OAuth URL received from Supabase');
      }
    } catch (error) {
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
    devSignIn,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

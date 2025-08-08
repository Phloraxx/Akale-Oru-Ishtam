import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { supabase, runDetailedDiagnostics } from '../services/supabaseClient';
import { APP_COLORS } from '../utils/constants';

const { width, height } = Dimensions.get('window');

export const LoginScreen: React.FC = () => {
  const { signInWithGoogle, loading, devSignIn, refreshSession } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true);
      await signInWithGoogle();
    } catch (error: any) {
      Alert.alert(
        'Authentication Error',
        error.message || 'Failed to sign in with Google. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleDevSignIn = async () => {
    try {
      setIsSigningIn(true);
      await devSignIn();
    } catch (error: any) {
      Alert.alert(
        'Dev Sign In Error',
        error.message || 'Failed to sign in with development user.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSigningIn(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={APP_COLORS.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoEmoji}>💝</Text>
          <Text style={styles.appName}>Akale Oru Istham</Text>
          <Text style={styles.tagline}>Where objects find their soulmates</Text>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.content}>


        {/* Login Section - moved inside content */}
        <View style={styles.loginSection}>
          <Text style={styles.loginTitle}>Ready to start swiping?</Text>
          <Text style={styles.loginSubtitle}>
            Sign in to save your discoveries and create profiles
          </Text>

          <TouchableOpacity
            style={[styles.googleButton, isSigningIn && styles.googleButtonDisabled]}
            onPress={handleGoogleSignIn}
            disabled={isSigningIn}
          >
            {isSigningIn ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Image
                  source={{
                    uri: 'https://img.icons8.com/?size=512&id=V5cGWnc9R4xj&format=png'
                  }}
                  style={styles.googleIcon}
                />
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Temporary development button */}
          <TouchableOpacity
            style={[styles.googleButton, { backgroundColor: '#4CAF50', marginTop: 8 }]}
            onPress={handleDevSignIn}
            disabled={isSigningIn}
          >
            {isSigningIn ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.googleButtonText}>� Dev: Sign In (Testing)</Text>
            )}
          </TouchableOpacity>

          {/* Debug button */}
          <TouchableOpacity
            style={[styles.googleButton, { backgroundColor: '#333', marginTop: 8 }]}
            onPress={async () => {
              try {
                const { data, error } = await supabase.auth.getSession();
                Alert.alert(
                  'Supabase Status',
                  `Connection: ${error ? 'Failed' : 'Success'}\nSession: ${data.session ? 'Active' : 'None'}\nUser: ${data.session?.user?.email || 'None'}\nError: ${error?.message || 'None'}`,
                  [
                    { text: 'OK' },
                    { text: 'Refresh Session', onPress: () => refreshSession() }
                  ]
                );
              } catch (error: any) {
                Alert.alert(
                  'Supabase Status',
                  `Connection Failed: ${error.message}`,
                  [{ text: 'OK' }]
                );
              }
            }}
          >
            <Text style={styles.googleButtonText}>🔍 Check Status & Refresh</Text>
          </TouchableOpacity>

          {/* Detailed Diagnostics button */}
          <TouchableOpacity
            style={[styles.googleButton, { backgroundColor: '#FF6B35', marginTop: 8 }]}
            onPress={async () => {
              try {
                Alert.alert(
                  'Running Full Diagnostics...',
                  'This will test all Supabase connections and storage setup.',
                  [],
                  { cancelable: false }
                );
                
                const diagnostics = await runDetailedDiagnostics();
                
                Alert.alert(
                  'Full Supabase Diagnostics',
                  diagnostics,
                  [
                    { text: 'OK' }
                  ]
                );
              } catch (error: any) {
                Alert.alert(
                  'Diagnostics Failed',
                  `Error: ${error.message}`,
                  [{ text: 'OK' }]
                );
              }
            }}
          >
            <Text style={styles.googleButtonText}>🔧 Full Storage Diagnostics</Text>
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            By continuing, you agree to discover the hidden love lives of inanimate objects
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Made with ❤️ for lonely objects everywhere
        </Text>
      </View>
    </View>
  );
};

interface FeatureItemProps {
  emoji: string;
  text: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ emoji, text }) => (
  <View style={styles.featureItem}>
    <Text style={styles.featureEmoji}>{emoji}</Text>
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: APP_COLORS.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: APP_COLORS.textSecondary,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoEmoji: {
    fontSize: 50,
    marginBottom: 12,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: APP_COLORS.text,
    marginBottom: 6,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 14,
    color: APP_COLORS.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  illustrationContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  illustration: {
    fontSize: 40,
    marginBottom: 12,
  },
  illustrationText: {
    fontSize: 16,
    color: APP_COLORS.text,
    textAlign: 'center',
    lineHeight: 22,
  },
  featuresContainer: {
    gap: 12,
    marginVertical: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: APP_COLORS.surface,
    padding: 12,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  featureEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  featureText: {
    fontSize: 14,
    color: APP_COLORS.text,
    flex: 1,
  },
  loginSection: {
    marginBottom: 20,
  },
  loginTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: APP_COLORS.text,
    textAlign: 'center',
    marginBottom: 6,
  },
  loginSubtitle: {
    fontSize: 14,
    color: APP_COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: APP_COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  googleButtonDisabled: {
    opacity: 0.7,
  },
  googleIcon: {
    width: 18,
    height: 18,
    marginRight: 10,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  disclaimer: {
    fontSize: 11,
    color: APP_COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 14,
    fontStyle: 'italic',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: APP_COLORS.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

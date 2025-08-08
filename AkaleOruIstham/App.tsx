import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, ActivityIndicator, View } from 'react-native';

// Auth Context
import { AuthProvider, useAuth } from './src/contexts/AuthContext';

// Screens
import { LoginScreen } from './src/screens/LoginScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { CaptureScreen } from './src/screens/CaptureScreen';
import { ProfileCreationScreen } from './src/screens/ProfileCreationScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';

// Constants
import { APP_COLORS } from './src/utils/constants';

const Stack = createStackNavigator();

// Main navigation component that handles authenticated vs unauthenticated states
const AppNavigator: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={APP_COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: APP_COLORS.surface,
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTintColor: APP_COLORS.text,
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },
        }}
      >
        {user ? (
          // Authenticated stack
          <>
            <Stack.Screen 
              name="Home" 
              component={HomeScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen 
              name="Capture" 
              component={CaptureScreen}
              options={{
                headerShown: false,
                presentation: 'modal',
              }}
            />
            <Stack.Screen 
              name="ProfileCreation" 
              component={ProfileCreationScreen}
              options={{
                title: 'Create Profile',
                headerShown: true,
              }}
            />
            <Stack.Screen 
              name="Settings" 
              component={SettingsScreen}
              options={{
                title: 'Settings',
                headerShown: true,
              }}
            />
          </>
        ) : (
          // Unauthenticated stack
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{
              headerShown: false,
            }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <GestureHandlerRootView style={styles.container}>
        <AppNavigator />
        <StatusBar style="dark" backgroundColor={APP_COLORS.surface} />
      </GestureHandlerRootView>
    </AuthProvider>
  );
}

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
});

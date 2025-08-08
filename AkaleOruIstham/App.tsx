import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

// Screens
import { HomeScreen } from './src/screens/HomeScreen';
import { CaptureScreen } from './src/screens/CaptureScreen';
import { ProfileCreationScreen } from './src/screens/ProfileCreationScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';

// Constants
import { APP_COLORS } from './src/utils/constants';

const Stack = createStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
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
        </Stack.Navigator>
        <StatusBar style="dark" backgroundColor={APP_COLORS.surface} />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_COLORS.background,
  },
});

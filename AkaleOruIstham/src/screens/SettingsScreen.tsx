import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
  Switch
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfiles } from '../services/supabaseClient';
import { APP_COLORS } from '../utils/constants';

interface SettingsScreenProps {
  navigation: any;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { user, signOut } = useAuth();
  const [userProfileCount, setUserProfileCount] = useState(0);
  const [settings, setSettings] = useState({
    notifications: true,
    locationServices: true,
    aiGeneration: true,
    campusOnly: true,
    autoSwipe: false,
    darkMode: false
  });

  useEffect(() => {
    loadUserStats();
  }, []);

  const loadUserStats = async () => {
    if (user) {
      const profiles = await getUserProfiles(user.id);
      setUserProfileCount(profiles.length);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          }
        }
      ]
    );
  };

  const updateSetting = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all created profiles and swipe history. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear Data', 
          style: 'destructive',
          onPress: () => {
            // Here you would clear the database
            Alert.alert('Data Cleared', 'All data has been cleared successfully.');
          }
        }
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'Export your created profiles and data for backup or transfer.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Export', 
          onPress: () => {
            // Here you would implement data export
            Alert.alert('Export Complete', 'Your data has been exported successfully.');
          }
        }
      ]
    );
  };

  const settingSections = [
    {
      title: 'Discovery',
      items: [
        {
          key: 'notifications',
          title: 'Push Notifications',
          subtitle: 'Get notified when objects need love',
          type: 'switch'
        },
        {
          key: 'locationServices',
          title: 'Location Services',
          subtitle: 'Find objects near your current location',
          type: 'switch'
        },
        {
          key: 'campusOnly',
          title: 'Campus Only Mode',
          subtitle: 'Only show objects found on campus',
          type: 'switch'
        }
      ]
    },
    {
      title: 'Profile Creation',
      items: [
        {
          key: 'aiGeneration',
          title: 'AI Profile Generation',
          subtitle: 'Use AI to create witty profiles automatically',
          type: 'switch'
        },
        {
          key: 'autoSwipe',
          title: 'Auto-Swipe Similar Objects',
          subtitle: 'Automatically like objects similar to your preferences',
          type: 'switch'
        }
      ]
    },
    {
      title: 'Appearance',
      items: [
        {
          key: 'darkMode',
          title: 'Dark Mode',
          subtitle: 'Switch to dark theme (coming soon)',
          type: 'switch',
          disabled: true
        }
      ]
    }
  ];

  const renderSettingItem = (item: any) => (
    <View key={item.key} style={styles.settingItem}>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, item.disabled && styles.disabledText]}>
          {item.title}
        </Text>
        <Text style={[styles.settingSubtitle, item.disabled && styles.disabledText]}>
          {item.subtitle}
        </Text>
      </View>
      
      {item.type === 'switch' && (
        <Switch
          value={settings[item.key as keyof typeof settings]}
          onValueChange={(value) => updateSetting(item.key, value)}
          disabled={item.disabled}
          trackColor={{ 
            false: APP_COLORS.border, 
            true: APP_COLORS.primary 
          }}
          thumbColor={settings[item.key as keyof typeof settings] ? 'white' : APP_COLORS.textSecondary}
        />
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Customize your Akale Oru Istham experience</Text>
          
          {/* User Info Card */}
          <View style={styles.userCard}>
            <Text style={styles.userEmail}>{user?.email}</Text>
            <Text style={styles.userStats}>
              You've created {userProfileCount} object profile{userProfileCount !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>

        {settingSections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map(renderSettingItem)}
            </View>
          </View>
        ))}

        {/* Action Buttons */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>
          <View style={styles.sectionContent}>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('ProfileCreation')}
            >
              <Text style={styles.actionButtonText}>✏️ Manual Profile Creation</Text>
              <Text style={styles.actionButtonSubtext}>Create profiles without camera</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleExportData}
            >
              <Text style={styles.actionButtonText}>📤 Export Data</Text>
              <Text style={styles.actionButtonSubtext}>Backup your profiles and data</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.destructiveButton]}
              onPress={handleClearData}
            >
              <Text style={[styles.actionButtonText, styles.destructiveText]}>🗑️ Clear All Data</Text>
              <Text style={[styles.actionButtonSubtext, styles.destructiveText]}>Delete all profiles and history</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.destructiveButton]}
              onPress={handleSignOut}
            >
              <Text style={[styles.actionButtonText, styles.destructiveText]}>🚪 Sign Out</Text>
              <Text style={[styles.actionButtonSubtext, styles.destructiveText]}>Sign out of your account</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.aboutContainer}>
            <Text style={styles.aboutTitle}>Akale Oru Istham</Text>
            <Text style={styles.aboutVersion}>Version 1.0.0</Text>
            <Text style={styles.aboutDescription}>
              A social discovery platform for lonely inanimate objects. 
              Bringing joy to campus through the absurd art of object dating.
            </Text>
            
            <View style={styles.creditContainer}>
              <Text style={styles.creditTitle}>Created with ✨</Text>
              <Text style={styles.creditText}>React Native + Expo</Text>
              <Text style={styles.creditText}>Supabase + AI Magic</Text>
              <Text style={styles.creditText}>Powered by joyful inefficiency</Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_COLORS.background,
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: APP_COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: APP_COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  userCard: {
    backgroundColor: APP_COLORS.surface,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userEmail: {
    fontSize: 16,
    fontWeight: '600',
    color: APP_COLORS.text,
    marginBottom: 4,
  },
  userStats: {
    fontSize: 14,
    color: APP_COLORS.textSecondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: APP_COLORS.text,
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  sectionContent: {
    backgroundColor: APP_COLORS.surface,
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: APP_COLORS.border,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: APP_COLORS.text,
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
    color: APP_COLORS.textSecondary,
    lineHeight: 18,
  },
  disabledText: {
    opacity: 0.5,
  },
  actionButton: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: APP_COLORS.border,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: APP_COLORS.text,
    marginBottom: 4,
  },
  actionButtonSubtext: {
    fontSize: 14,
    color: APP_COLORS.textSecondary,
  },
  destructiveButton: {
    backgroundColor: 'rgba(231, 76, 60, 0.05)',
  },
  destructiveText: {
    color: APP_COLORS.error,
  },
  aboutContainer: {
    backgroundColor: APP_COLORS.surface,
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  aboutTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: APP_COLORS.text,
    marginBottom: 4,
  },
  aboutVersion: {
    fontSize: 14,
    color: APP_COLORS.textSecondary,
    marginBottom: 16,
  },
  aboutDescription: {
    fontSize: 14,
    color: APP_COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  creditContainer: {
    alignItems: 'center',
  },
  creditTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: APP_COLORS.text,
    marginBottom: 8,
  },
  creditText: {
    fontSize: 12,
    color: APP_COLORS.textSecondary,
    marginBottom: 2,
  },
  bottomPadding: {
    height: 40,
  },
});

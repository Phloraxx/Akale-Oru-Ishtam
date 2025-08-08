import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView
} from 'react-native';
import { ObjectCard } from '../components/ObjectCard';
import { ObjectProfile } from '../types/ObjectProfile';
import { APP_COLORS, ALL_VIBES } from '../utils/constants';
import { getRandomCampusLocation } from '../services/locationService';
import { saveObjectProfile } from '../services/supabaseClient';

interface ProfileCreationScreenProps {
  navigation: any;
}

export const ProfileCreationScreen: React.FC<ProfileCreationScreenProps> = ({ navigation }) => {
  const [profile, setProfile] = useState<Partial<ObjectProfile>>({
    name: '',
    bio: '',
    passions: ['', '', '', ''],
    prompt: { question: '', answer: '' },
    imageUrl: 'https://picsum.photos/400/600?random=' + Math.floor(Math.random() * 100),
    location: getRandomCampusLocation(),
    vibe: '',
    createdAt: new Date(),
    createdBy: 'manual'
  });

  const [showPreview, setShowPreview] = useState(false);

  const updateProfile = (field: string, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const updatePrompt = (field: 'question' | 'answer', value: string) => {
    setProfile(prev => ({
      ...prev,
      prompt: { ...prev.prompt!, [field]: value }
    }));
  };

  const updatePassion = (index: number, value: string) => {
    const newPassions = [...(profile.passions || ['', '', '', ''])];
    newPassions[index] = value;
    setProfile(prev => ({ ...prev, passions: newPassions }));
  };

  const validateProfile = (): boolean => {
    if (!profile.name?.trim()) {
      Alert.alert('Missing Info', 'Please enter a name for the object');
      return false;
    }
    if (!profile.bio?.trim()) {
      Alert.alert('Missing Info', 'Please enter a bio');
      return false;
    }
    if (!profile.vibe?.trim()) {
      Alert.alert('Missing Info', 'Please select a vibe');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateProfile()) return;

    const finalProfile: ObjectProfile = {
      id: Date.now().toString(),
      name: profile.name!,
      bio: profile.bio!,
      passions: profile.passions || [],
      prompt: profile.prompt || { question: '', answer: '' },
      imageUrl: profile.imageUrl || '',
      vibe: profile.vibe!,
      location: profile.location || getRandomCampusLocation(),
      createdAt: new Date(),
      createdBy: 'manual'
    };

    try {
      await saveObjectProfile(finalProfile);
      Alert.alert(
        'Profile Saved! 🎉',
        'Your manually created profile is ready to find love!',
        [
          { text: 'Create Another', onPress: () => resetForm() },
          { text: 'View Home', onPress: () => navigation.navigate('Home') }
        ]
      );
    } catch (error) {
      Alert.alert(
        'Save Failed',
        'Failed to save profile. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const resetForm = () => {
    setProfile({
      name: '',
      bio: '',
      passions: ['', '', '', ''],
      prompt: { question: '', answer: '' },
      imageUrl: 'https://picsum.photos/400/600?random=' + Math.floor(Math.random() * 100),
      location: getRandomCampusLocation(),
      vibe: '',
      createdAt: new Date(),
      createdBy: 'manual'
    });
    setShowPreview(false);
  };

  if (showPreview && profile.name) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.previewContainer}>
          <Text style={styles.previewTitle}>Profile Preview</Text>
          
          <View style={styles.cardContainer}>
            <ObjectCard 
              profile={profile as ObjectProfile}
            />
          </View>

          <View style={styles.previewActions}>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => setShowPreview(false)}
            >
              <Text style={styles.editButtonText}>← Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>Save Profile ✨</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Manual Profile Creation</Text>
          <Text style={styles.subtitle}>Create a custom profile for any object</Text>
        </View>

        {/* Basic Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Object Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Lonely Chair, Mysterious Book..."
              value={profile.name}
              onChangeText={(value) => updateProfile('name', value)}
              maxLength={50}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bio *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Write a witty bio that captures the object's personality..."
              value={profile.bio}
              onChangeText={(value) => updateProfile('bio', value)}
              multiline
              numberOfLines={3}
              maxLength={200}
            />
          </View>
        </View>

        {/* Vibe Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vibe *</Text>
          <View style={styles.vibeGrid}>
            {ALL_VIBES.map((vibe) => (
              <TouchableOpacity
                key={vibe}
                style={[
                  styles.vibeOption,
                  profile.vibe === vibe && styles.vibeOptionSelected
                ]}
                onPress={() => updateProfile('vibe', vibe)}
              >
                <Text style={[
                  styles.vibeText,
                  profile.vibe === vibe && styles.vibeTextSelected
                ]}>
                  {vibe}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Passions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Passions (up to 4)</Text>
          {[0, 1, 2, 3].map((index) => (
            <View key={index} style={styles.inputGroup}>
              <Text style={styles.label}>Passion {index + 1}</Text>
              <TextInput
                style={styles.input}
                placeholder={`e.g., ${index === 0 ? 'Being useful' : index === 1 ? 'Making people comfortable' : index === 2 ? 'Silent support' : 'Existing gracefully'}`}
                value={profile.passions?.[index] || ''}
                onChangeText={(value) => updatePassion(index, value)}
                maxLength={30}
              />
            </View>
          ))}
        </View>

        {/* Dating Prompt */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dating Prompt</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Question</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., What's your love language?"
              value={profile.prompt?.question}
              onChangeText={(value) => updatePrompt('question', value)}
              maxLength={100}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Answer</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="e.g., Physical touch - I'm all about that support life 💺"
              value={profile.prompt?.answer}
              onChangeText={(value) => updatePrompt('answer', value)}
              multiline
              numberOfLines={2}
              maxLength={150}
            />
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.previewButton}
            onPress={() => {
              if (validateProfile()) {
                setShowPreview(true);
              }
            }}
          >
            <Text style={styles.previewButtonText}>Preview Profile</Text>
          </TouchableOpacity>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: APP_COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: APP_COLORS.textSecondary,
    textAlign: 'center',
  },
  section: {
    padding: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: APP_COLORS.text,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: APP_COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: APP_COLORS.surface,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  vibeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  vibeOption: {
    backgroundColor: APP_COLORS.surface,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  vibeOptionSelected: {
    backgroundColor: APP_COLORS.primary,
    borderColor: APP_COLORS.primary,
  },
  vibeText: {
    fontSize: 14,
    color: APP_COLORS.text,
  },
  vibeTextSelected: {
    color: 'white',
  },
  buttonContainer: {
    padding: 20,
  },
  previewButton: {
    backgroundColor: APP_COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  previewButtonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: '600',
  },
  bottomPadding: {
    height: 40,
  },
  previewContainer: {
    flex: 1,
    padding: 16,
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: APP_COLORS.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewActions: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 16,
  },
  editButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: APP_COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 16,
    color: APP_COLORS.primary,
    fontWeight: '600',
  },
  saveButton: {
    flex: 2,
    backgroundColor: APP_COLORS.success,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
});

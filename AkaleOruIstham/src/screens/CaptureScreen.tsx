import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { CameraView } from '../components/CameraView';
import { ImageSourceSelector } from '../components/ImageSourceSelector';
import { VibeSelector } from '../components/VibeSelector';
import { LoadingProfile } from '../components/LoadingProfile';
import { ObjectCard } from '../components/ObjectCard';
import { generateObjectProfile } from '../services/aiService';
import { getCurrentLocation, getRandomCampusLocation } from '../services/locationService';
import { saveObjectProfile } from '../services/supabaseClient';
import { ObjectProfile } from '../types/ObjectProfile';
import { APP_COLORS } from '../utils/constants';
import { useAuth } from '../contexts/AuthContext';

type CaptureStep = 'imageSource' | 'camera' | 'naming' | 'vibe' | 'loading' | 'preview';

export const CaptureScreen: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<CaptureStep>('imageSource');
  const [capturedImage, setCapturedImage] = useState<string>('');
  const [objectName, setObjectName] = useState<string>('');
  const [selectedVibe, setSelectedVibe] = useState<string>('');
  const [generatedProfile, setGeneratedProfile] = useState<ObjectProfile | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Get user authentication
  const { user, session, refreshSession } = useAuth();
  
  // Enhanced user validation that works with both Google and dev login
  const isValidUser = user && (
    // Real Google user has email
    (user.email && user.email !== 'dev@example.com') ||
    // Dev user has dev_mode flag
    user.user_metadata?.dev_mode === true ||
    // Anonymous user with valid session
    (session && session.access_token)
  );

  const handleImageCaptured = (imageUri: string) => {
    setCapturedImage(imageUri);
    setCurrentStep('naming');
  };

  const handleCameraSelected = () => {
    setCurrentStep('camera');
  };

  const handleImageSelected = (imageUri: string) => {
    console.log('📱 Image selected from gallery:', imageUri.substring(0, 50) + '...');
    setCapturedImage(imageUri);
    setCurrentStep('naming');
  };

  const handleNameSubmit = async () => {
    if (!objectName.trim()) {
      Alert.alert('Missing Info', 'Please enter a name for this object!');
      return;
    }
    setCurrentStep('vibe');
  };

  const handleVibeSelected = async (vibe: string) => {
    setSelectedVibe(vibe);
    setCurrentStep('loading');
    
    try {
      // Get location (using mock location for demo)
      const location = await getCurrentLocation() || getRandomCampusLocation();
      
      const creationData = {
        objectName: objectName.trim(),
        location,
        vibe,
        imageUri: capturedImage
      };

      // Generate profile using AI
      const profileData = await generateObjectProfile(
        creationData.objectName,
        creationData.location.description,
        creationData.vibe
      );
      
      // Simulate loading time
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      if (profileData) {
        const fullProfile: ObjectProfile = {
          ...profileData,
          id: Date.now().toString(),
          name: profileData.name || objectName,
          bio: profileData.bio || 'A mysterious object with untold stories.',
          passions: profileData.passions || ['Existing', 'Being useful'],
          prompt: profileData.prompt || { 
            question: 'What makes you special?', 
            answer: 'I bring unique energy to any space!' 
          },
          imageUrl: capturedImage,
          location,
          vibe,
          createdAt: new Date(),
          createdBy: user?.id || 'anonymous'  // Use authenticated user ID
        };

        setGeneratedProfile(fullProfile);
        setCurrentStep('preview');
      } else {
        throw new Error('Failed to generate profile');
      }
    } catch (error) {
      Alert.alert(
        'Generation Failed', 
        'Failed to create profile. Please try again.',
        [{ text: 'Retry', onPress: () => setCurrentStep('vibe') }]
      );
    }
  };

  const handleSaveProfile = async () => {
    if (!generatedProfile) return;

    // Check if user is authenticated (works for both Google and dev login)
    if (!isValidUser) {
      Alert.alert(
        'Authentication Required',
        'You need to be logged in to save profiles. Please log in and try again.',
        [
          { text: 'Refresh Session', onPress: async () => {
            try {
              await refreshSession();
            } catch (error) {
              // Session refresh failed silently
            }
          }},
          { text: 'Save Without Image', onPress: saveWithoutImage },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
      return;
    }

    try {
      setIsSaving(true);
      
      // Save the profile directly
      const success = await saveObjectProfile(generatedProfile, capturedImage);
      
      if (success) {
        Alert.alert(
          'Success! 🎉',
          'Your object is now ready to find love! The photo has been uploaded and other users can now see it.',
          [{ text: 'Create Another', onPress: resetFlow }]
        );
      } else {
        Alert.alert(
          'Save Failed', 
          'Failed to save profile or upload image. Please check your internet connection and try again.',
          [
            { text: 'Retry', onPress: handleSaveProfile },
            { text: 'Save Without Image', onPress: saveWithoutImage },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      Alert.alert(
        'Save Failed', 
        `Failed to save profile: ${errorMessage}`,
        [
          { text: 'Retry', onPress: handleSaveProfile },
          { text: 'Save Without Image', onPress: saveWithoutImage },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } finally {
      setIsSaving(false);
    }
  };

  const saveWithoutImage = async () => {
    if (!generatedProfile) return;
    
    try {
      setIsSaving(true);
      const success = await saveObjectProfile(
        generatedProfile, 
        undefined, 
        { allowImageUploadFailure: true }
      );
      
      if (success) {
        Alert.alert(
          'Profile Saved! 📝',
          'Your object profile has been saved (without image). You can add a photo later.',
          [{ text: 'Create Another', onPress: resetFlow }]
        );
      } else {
        Alert.alert('Save Failed', 'Failed to save profile. Please try again later.');
      }
    } catch (error) {
      Alert.alert('Save Failed', 'Failed to save profile. Please try again later.');
    } finally {
      setIsSaving(false);
    }
  };

  const resetFlow = () => {
    setCapturedImage('');
    setObjectName('');
    setSelectedVibe('');
    setGeneratedProfile(null);
    setIsSaving(false);
    setCurrentStep('imageSource');
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'imageSource':
        return (
          <ImageSourceSelector
            onImageSelected={handleImageSelected}
            onCameraSelected={handleCameraSelected}
            onClose={resetFlow}
          />
        );

      case 'camera':
        return (
          <CameraView
            onImageCaptured={handleImageCaptured}
            onClose={() => setCurrentStep('imageSource')}
          />
        );

      case 'naming':
        return (
          <KeyboardAvoidingView 
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <View style={styles.namingContainer}>
              <Text style={styles.stepTitle}>What should we call this object? 🏷️</Text>
              <Text style={styles.stepSubtitle}>
                Give it a name that captures its essence
              </Text>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.nameInput}
                  placeholder="e.g., Chair, Book, Coffee Mug..."
                  value={objectName}
                  onChangeText={setObjectName}
                  autoFocus
                  maxLength={30}
                />
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={styles.backButton}
                  onPress={() => setCurrentStep('imageSource')}
                >
                  <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[
                    styles.nextButton,
                    !objectName.trim() && styles.nextButtonDisabled
                  ]}
                  onPress={handleNameSubmit}
                  disabled={!objectName.trim()}
                >
                  <Text style={styles.nextButtonText}>Next →</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        );

      case 'vibe':
        return (
          <View style={styles.container}>
            <VibeSelector
              selectedVibe={selectedVibe}
              onVibeSelect={setSelectedVibe}
              onCustomVibe={setSelectedVibe}
            />
            
            <View style={styles.bottomActions}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => setCurrentStep('naming')}
              >
                <Text style={styles.backButtonText}>← Back</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.generateButton,
                  !selectedVibe && styles.generateButtonDisabled
                ]}
                onPress={() => handleVibeSelected(selectedVibe)}
                disabled={!selectedVibe}
              >
                <Text style={styles.generateButtonText}>Generate Profile ✨</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'loading':
        return (
          <LoadingProfile
            objectName={objectName}
            vibe={selectedVibe}
            imageUri={capturedImage}
          />
        );

      case 'preview':
        return (
          <View style={styles.previewContainer}>
            <Text style={styles.previewTitle}>Your Object's Profile is Ready! 🎉</Text>
            
            <View style={styles.cardContainer}>
              {generatedProfile && (
                <ObjectCard 
                  profile={generatedProfile}
                />
              )}
            </View>

            <View style={styles.previewActions}>
              <TouchableOpacity 
                style={[
                  styles.saveButton,
                  isSaving && styles.saveButtonDisabled
                ]}
                onPress={handleSaveProfile}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <ActivityIndicator size="small" color="white" style={{ marginRight: 8 }} />
                    <Text style={styles.saveButtonText}>Uploading...</Text>
                  </>
                ) : (
                  <Text style={styles.saveButtonText}>Save Profile 💫</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {renderCurrentStep()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: APP_COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: APP_COLORS.background,
  },
  namingContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: APP_COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: APP_COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
  },
  inputContainer: {
    marginBottom: 32,
  },
  nameInput: {
    backgroundColor: APP_COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 18,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  backButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: APP_COLORS.border,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: APP_COLORS.textSecondary,
    fontWeight: '600',
  },
  nextButton: {
    flex: 1,
    backgroundColor: APP_COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: APP_COLORS.border,
  },
  nextButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  bottomActions: {
    flexDirection: 'row',
    padding: 24,
    gap: 16,
  },
  generateButton: {
    flex: 2,
    backgroundColor: APP_COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  generateButtonDisabled: {
    backgroundColor: APP_COLORS.border,
  },
  generateButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
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
    paddingTop: 16,
  },
  saveButton: {
    width: '100%',
    backgroundColor: APP_COLORS.success,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
});

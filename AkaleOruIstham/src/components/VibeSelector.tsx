import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions
} from 'react-native';
import { ALL_VIBES, VIBE_CATEGORIES, APP_COLORS } from '../utils/constants';

interface VibeSelectorProps {
  selectedVibe: string;
  onVibeSelect: (vibe: string) => void;
  onCustomVibe: (vibe: string) => void;
}

const { width } = Dimensions.get('window');

export const VibeSelector: React.FC<VibeSelectorProps> = ({
  selectedVibe,
  onVibeSelect,
  onCustomVibe
}) => {
  const [customVibe, setCustomVibe] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleCustomVibeSubmit = () => {
    if (customVibe.trim()) {
      onCustomVibe(customVibe.trim());
      setCustomVibe('');
      setShowCustomInput(false);
    }
  };

  const renderVibeButton = (vibe: string, isCustom = false) => (
    <TouchableOpacity
      key={vibe}
      style={[
        styles.vibeButton,
        selectedVibe === vibe && styles.selectedVibeButton,
        isCustom && styles.customVibeButton
      ]}
      onPress={() => onVibeSelect(vibe)}
    >
      <Text
        style={[
          styles.vibeText,
          selectedVibe === vibe && styles.selectedVibeText
        ]}
      >
        {vibe}
      </Text>
    </TouchableOpacity>
  );

  const renderVibeCategory = (categoryName: string, vibes: string[]) => (
    <View key={categoryName} style={styles.categoryContainer}>
      <Text style={styles.categoryTitle}>
        {categoryName.charAt(0).toUpperCase() + categoryName.slice(1)} Vibes
      </Text>
      <View style={styles.vibesRow}>
        {vibes.map(vibe => renderVibeButton(vibe))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What's the vibe? ✨</Text>
      <Text style={styles.subtitle}>Pick one word to describe this object's energy</Text>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {Object.entries(VIBE_CATEGORIES).map(([category, vibes]) =>
          renderVibeCategory(category, vibes)
        )}

        <View style={styles.customSection}>
          <TouchableOpacity
            style={styles.customButton}
            onPress={() => setShowCustomInput(!showCustomInput)}
          >
            <Text style={styles.customButtonText}>
              {showCustomInput ? '← Back to presets' : '+ Create custom vibe'}
            </Text>
          </TouchableOpacity>

          {showCustomInput && (
            <View style={styles.customInputContainer}>
              <TextInput
                style={styles.customInput}
                placeholder="Enter your unique vibe..."
                value={customVibe}
                onChangeText={setCustomVibe}
                maxLength={20}
                autoFocus
              />
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  !customVibe.trim() && styles.submitButtonDisabled
                ]}
                onPress={handleCustomVibeSubmit}
                disabled={!customVibe.trim()}
              >
                <Text style={styles.submitButtonText}>✓</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {selectedVibe && !ALL_VIBES.includes(selectedVibe) && (
          <View style={styles.selectedCustomContainer}>
            {renderVibeButton(selectedVibe, true)}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_COLORS.background,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: APP_COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: APP_COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  scrollContainer: {
    flex: 1,
  },
  categoryContainer: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: APP_COLORS.text,
    marginBottom: 12,
  },
  vibesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  vibeButton: {
    backgroundColor: APP_COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedVibeButton: {
    backgroundColor: APP_COLORS.primary,
    borderColor: APP_COLORS.primary,
  },
  customVibeButton: {
    backgroundColor: APP_COLORS.accent,
    borderColor: APP_COLORS.accent,
  },
  vibeText: {
    fontSize: 14,
    color: APP_COLORS.text,
    fontWeight: '500',
  },
  selectedVibeText: {
    color: 'white',
  },
  customSection: {
    marginTop: 16,
    marginBottom: 24,
  },
  customButton: {
    backgroundColor: 'transparent',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: APP_COLORS.primary,
    borderStyle: 'dashed',
  },
  customButtonText: {
    color: APP_COLORS.primary,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
  customInputContainer: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  customInput: {
    flex: 1,
    backgroundColor: APP_COLORS.surface,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: APP_COLORS.success,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: APP_COLORS.border,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  selectedCustomContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
});

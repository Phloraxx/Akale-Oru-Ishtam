import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { ObjectProfile } from '../types/ObjectProfile';
import { APP_COLORS } from '../utils/constants';

interface ObjectCardProps {
  profile: ObjectProfile;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  showActions?: boolean;
}

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;
const CARD_HEIGHT = height * 0.75;

export const ObjectCard: React.FC<ObjectCardProps> = ({
  profile,
  onSwipeLeft,
  onSwipeRight,
  showActions = true
}) => {
  return (
    <View style={styles.card}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Section */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: profile.imageUrl }} 
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.nameOverlay}>
            <Text style={styles.name}>{profile.name}</Text>
            <Text style={styles.age}>{profile.age}</Text>
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.content}>
          {/* Bio */}
          <View style={styles.section}>
            <Text style={styles.bio}>{profile.bio}</Text>
          </View>

          {/* Location & Vibe */}
          <View style={styles.section}>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>📍 Found at</Text>
                <Text style={styles.infoValue}>{profile.location.description}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>✨ Vibe</Text>
                <Text style={styles.vibeValue}>{profile.vibe}</Text>
              </View>
            </View>
          </View>

          {/* Anthem */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎵 My Anthem</Text>
            <View style={styles.anthemContainer}>
              <Text style={styles.songTitle}>"{profile.anthem.title}"</Text>
              <Text style={styles.artist}>by {profile.anthem.artist}</Text>
            </View>
          </View>

          {/* Passions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💕 My Passions</Text>
            <View style={styles.passionsContainer}>
              {profile.passions.map((passion, index) => (
                <View key={index} style={styles.passionTag}>
                  <Text style={styles.passionText}>{passion}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Prompt */}
          <View style={styles.section}>
            <Text style={styles.promptQuestion}>{profile.prompt.question}</Text>
            <Text style={styles.promptAnswer}>"{profile.prompt.answer}"</Text>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      {showActions && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.rejectButton]}
            onPress={onSwipeLeft}
          >
            <Text style={styles.actionButtonText}>✕</Text>
          </TouchableOpacity>

          <View style={styles.actionSpacer} />

          <TouchableOpacity 
            style={[styles.actionButton, styles.likeButton]}
            onPress={onSwipeRight}
          >
            <Text style={styles.actionButtonText}>♥</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: APP_COLORS.surface,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  imageContainer: {
    height: CARD_HEIGHT * 0.5,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  nameOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 20,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  age: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  bio: {
    fontSize: 16,
    color: APP_COLORS.text,
    lineHeight: 24,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: APP_COLORS.textSecondary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: APP_COLORS.text,
    fontWeight: '500',
    textAlign: 'center',
  },
  vibeValue: {
    fontSize: 14,
    color: APP_COLORS.primary,
    fontWeight: '600',
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: APP_COLORS.text,
    marginBottom: 12,
  },
  anthemContainer: {
    backgroundColor: APP_COLORS.background,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  songTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: APP_COLORS.text,
    marginBottom: 4,
  },
  artist: {
    fontSize: 14,
    color: APP_COLORS.textSecondary,
  },
  passionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  passionTag: {
    backgroundColor: APP_COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  passionText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  promptQuestion: {
    fontSize: 14,
    color: APP_COLORS.textSecondary,
    marginBottom: 8,
    fontWeight: '500',
  },
  promptAnswer: {
    fontSize: 16,
    color: APP_COLORS.text,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
    paddingHorizontal: 40,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  rejectButton: {
    backgroundColor: APP_COLORS.error,
  },
  likeButton: {
    backgroundColor: APP_COLORS.success,
  },
  actionButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  actionSpacer: {
    width: 60,
  },
});

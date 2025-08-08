import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { ObjectProfile } from '../types/ObjectProfile';

interface ObjectCardProps {
  profile: ObjectProfile;
}

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.85;

export const ObjectCard: React.FC<ObjectCardProps> = ({ profile }) => {
  return (
    <View style={styles.card}>
      {/* Profile Image */}
      <View style={styles.imageContainer}>
        {profile.imageUrl ? (
          <Image source={{ uri: profile.imageUrl }} style={styles.image} />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>📸</Text>
          </View>
        )}
      </View>

      {/* Profile Info */}
      <View style={styles.infoContainer}>
        {/* Name */}
        <View style={styles.nameContainer}>
          <Text style={styles.name}>{profile.name}</Text>
        </View>

        {/* Bio */}
        {profile.bio && (
          <Text style={styles.bio} numberOfLines={3}>
            {profile.bio}
          </Text>
        )}

        {/* Passions */}
        {profile.passions && profile.passions.length > 0 && (
          <View style={styles.passionsContainer}>
            <Text style={styles.sectionTitle}>✨ My Passions</Text>
            <View style={styles.passionTags}>
              {profile.passions.slice(0, 3).map((passion, index) => (
                <View key={index} style={styles.passionTag}>
                  <Text style={styles.passionText}>{passion}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Location & Vibe */}
        <View style={styles.bottomInfo}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>📍 Location</Text>
              <Text style={styles.infoValue}>
                {profile.location?.description || 'Campus somewhere'}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>✨ Vibe</Text>
              <Text style={styles.infoValue}>{profile.vibe || 'mysterious'}</Text>
            </View>
          </View>
        </View>

        {/* Prompt Response */}
        {profile.prompt && profile.prompt.question && (
          <View style={styles.promptContainer}>
            <Text style={styles.promptQuestion}>{profile.prompt.question}</Text>
            <Text style={styles.promptAnswer}>"{profile.prompt.answer}"</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  imageContainer: {
    height: 300,
    backgroundColor: '#f5f5f5',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
  },
  placeholderText: {
    fontSize: 48,
    opacity: 0.5,
  },
  infoContainer: {
    padding: 20,
  },
  nameContainer: {
    marginBottom: 12,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  bio: {
    fontSize: 16,
    color: '#555',
    lineHeight: 22,
    marginBottom: 16,
  },
  passionsContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
    marginBottom: 6,
  },
  passionTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  passionTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  passionText: {
    fontSize: 14,
    color: '#555',
  },
  bottomInfo: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
  },
  promptContainer: {
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  promptQuestion: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  promptAnswer: {
    fontSize: 16,
    color: '#333',
    fontStyle: 'italic',
  },
});

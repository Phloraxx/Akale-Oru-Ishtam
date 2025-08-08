import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  Alert
} from 'react-native';
import { PanGestureHandler, GestureHandlerRootView } from 'react-native-gesture-handler';
import { ObjectCard } from '../components/ObjectCard';
import { getObjectProfiles } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { ObjectProfile } from '../types/ObjectProfile';
import { APP_COLORS } from '../utils/constants';

interface HomeScreenProps {
  navigation: any;
}

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD = width * 0.3;
const CARD_MARGIN = 10;

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<ObjectProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Animation values
  const position = useRef(new Animated.ValueXY()).current;
  const rotation = useRef(new Animated.Value(0)).current;
  const nextCardScale = useRef(new Animated.Value(0.9)).current;
  const nextCardOpacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      const fetchedProfiles = await getObjectProfiles();
      
      // If no profiles exist, create some mock ones for demo
      if (fetchedProfiles.length === 0) {
        const mockProfiles = generateMockProfiles();
        setProfiles(mockProfiles);
      } else {
        setProfiles(fetchedProfiles);
      }
    } catch (error) {
      // Fallback to mock profiles
      const mockProfiles = generateMockProfiles();
      setProfiles(mockProfiles);
    } finally {
      setLoading(false);
    }
  };

  const generateMockProfiles = (): ObjectProfile[] => {
    return [
      {
        id: '1',
        name: 'Sitara the Supportive',
        bio: 'Been holding it down since 2019. Great at supporting others, literally. Looking for someone who appreciates stability.',
        passions: ['Supporting dreams', 'People watching', 'Posture improvement', 'Silent comfort'],
        prompt: { 
          question: 'What\'s your love language?', 
          answer: 'Physical touch - I\'m all about that support life 💺' 
        },
        imageUrl: 'https://picsum.photos/400/600?random=1',
        location: { latitude: 12.9716, longitude: 77.5946, description: 'Library corner' },
        vibe: 'supportive',
        createdAt: new Date(),
        createdBy: 'demo'
      },
      {
        id: '2',
        name: 'Paige Turner',
        bio: 'Full of stories and always ready to share. I\'ve got depth, plot twists, and a great cover.',
        passions: ['Character development', 'Plot twists', 'Late night reading', 'Bookmarks'],
        prompt: { 
          question: 'What\'s your ideal Sunday?', 
          answer: 'Cozy corner, warm tea, and someone who reads me cover to cover 📚' 
        },
        imageUrl: 'https://picsum.photos/400/600?random=2',
        location: { latitude: 12.9716, longitude: 77.5946, description: 'Study room' },
        vibe: 'intellectual',
        createdAt: new Date(),
        createdBy: 'demo'
      },
      {
        id: '3',
        name: 'Brew the Energetic',
        bio: 'I wake people up and make their day better. Always hot, never bitter. Swipe right for good vibes!',
        passions: ['Morning routines', 'Productivity', 'Warmth', 'Caffeine delivery'],
        prompt: { 
          question: 'What makes you irresistible?', 
          answer: 'I\'m the reason people function before 10 AM ☕' 
        },
        imageUrl: 'https://picsum.photos/400/600?random=3',
        location: { latitude: 12.9716, longitude: 77.5946, description: 'Cafeteria' },
        vibe: 'energetic',
        createdAt: new Date(),
        createdBy: 'demo'
      }
    ];
  };

  const resetPosition = () => {
    position.setValue({ x: 0, y: 0 });
    rotation.setValue(0);
    nextCardScale.setValue(0.9);
    nextCardOpacity.setValue(0.5);
  };

  const swipeCard = (direction: 'left' | 'right') => {
    const x = direction === 'right' ? width + 100 : -width - 100;
    
    Animated.parallel([
      Animated.timing(position, {
        toValue: { x, y: 0 },
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(rotation, {
        toValue: direction === 'right' ? 1 : -1,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(nextCardScale, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(nextCardOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      })
    ]).start(() => {
      setCurrentIndex(prevIndex => prevIndex + 1);
      resetPosition();
    });
  };

  const handleSwipeLeft = () => {
    swipeCard('left');
  };

  const handleSwipeRight = () => {
    swipeCard('right');
  };

  const handlePanGesture = (event: any) => {
    const { translationX, translationY } = event.nativeEvent;
    
    position.setValue({
      x: translationX,
      y: translationY,
    });

    // Rotation based on horizontal movement
    const rotate = translationX * 0.1;
    rotation.setValue(rotate / 120);

    // Next card animation
    const scale = Math.min(1, 0.9 + Math.abs(translationX) / width * 0.1);
    nextCardScale.setValue(scale);
    
    const opacity = Math.min(1, 0.5 + Math.abs(translationX) / width * 0.5);
    nextCardOpacity.setValue(opacity);
  };

  const handlePanEnd = (event: any) => {
    const { translationX, velocityX } = event.nativeEvent;
    
    const hasSwipedHorizontally = Math.abs(translationX) > SWIPE_THRESHOLD;
    const hasSwipedLeft = translationX < -SWIPE_THRESHOLD;
    const hasSwipedRight = translationX > SWIPE_THRESHOLD;
    
    if (hasSwipedHorizontally || Math.abs(velocityX) > 1000) {
      if (hasSwipedLeft || velocityX < -1000) {
        swipeCard('left');
      } else if (hasSwipedRight || velocityX > 1000) {
        swipeCard('right');
      }
    } else {
      // Return to center
      Animated.parallel([
        Animated.spring(position, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }),
        Animated.spring(rotation, {
          toValue: 0,
          useNativeDriver: false,
        }),
        Animated.spring(nextCardScale, {
          toValue: 0.9,
          useNativeDriver: false,
        }),
        Animated.spring(nextCardOpacity, {
          toValue: 0.5,
          useNativeDriver: false,
        })
      ]).start();
    }
  };

  const renderCard = (profile: ObjectProfile, index: number) => {
    if (index < currentIndex) return null;
    
    if (index === currentIndex) {
      // Current card (top card)
      const rotate = rotation.interpolate({
        inputRange: [-1, 0, 1],
        outputRange: ['-30deg', '0deg', '30deg'],
      });

      const animatedStyle = {
        transform: [
          ...position.getTranslateTransform(),
          { rotate },
        ],
      };

      return (
        <PanGestureHandler
          key={profile.id}
          onGestureEvent={handlePanGesture}
          onHandlerStateChange={({ nativeEvent }) => {
            if (nativeEvent.state === 5) { // END state
              handlePanEnd({ nativeEvent });
            }
          }}
        >
          <Animated.View style={[styles.cardContainer, animatedStyle]}>
            <ObjectCard profile={profile} />
          </Animated.View>
        </PanGestureHandler>
      );
    }
    
    if (index === currentIndex + 1) {
      // Next card (behind current)
      const animatedStyle = {
        transform: [
          { scale: nextCardScale },
        ],
        opacity: nextCardOpacity,
      };

      return (
        <Animated.View key={profile.id} style={[styles.cardContainer, styles.nextCard, animatedStyle]}>
          <ObjectCard profile={profile} />
        </Animated.View>
      );
    }

    return null;
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No more objects to discover! 🎭</Text>
      <Text style={styles.emptySubtitle}>
        Why not create a profile for a lonely object you found?
      </Text>
      <TouchableOpacity 
        style={styles.createButton}
        onPress={() => navigation.navigate('Capture')}
      >
        <Text style={styles.createButtonText}>📸 Create Profile</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.refreshButton}
        onPress={loadProfiles}
      >
        <Text style={styles.refreshButtonText}>↻ Refresh</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Finding lonely objects... 🔍</Text>
      </View>
    );
  }

  const hasMoreProfiles = currentIndex < profiles.length;

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Akale Oru Ishtam</Text>
        <Text style={styles.headerSubtitle}>Discover objects waiting for love</Text>
        {user && (
          <TouchableOpacity 
            style={styles.userBadge}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.userBadgeText}>👤 {user.email?.split('@')[0]}</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.cardStack}>
        {hasMoreProfiles ? (
          profiles.map((profile, index) => renderCard(profile, index))
        ) : (
          renderEmptyState()
        )}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.footerButton}
          onPress={() => navigation.navigate('Capture')}
        >
          <Text style={styles.footerButtonText}>📸</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.footerButton}
          onPress={loadProfiles}
        >
          <Text style={styles.footerButtonText}>↻</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.footerButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.footerButtonText}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {hasMoreProfiles && (
        <View style={styles.swipeHint}>
          <Text style={styles.swipeHintText}>
            Swipe left to pass • Swipe right to like
          </Text>
        </View>
      )}
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_COLORS.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: APP_COLORS.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: APP_COLORS.textSecondary,
  },
  userBadge: {
    marginTop: 8,
    backgroundColor: APP_COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  userBadgeText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
  cardStack: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContainer: {
    position: 'absolute',
    width: width * 0.9,
    height: height * 0.7,
  },
  nextCard: {
    zIndex: -1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: APP_COLORS.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 16,
    color: APP_COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  createButton: {
    backgroundColor: APP_COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    marginBottom: 16,
  },
  createButtonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: '600',
  },
  refreshButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: APP_COLORS.border,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  refreshButtonText: {
    fontSize: 16,
    color: APP_COLORS.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
    gap: 30,
  },
  footerButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: APP_COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  footerButtonText: {
    fontSize: 24,
  },
  swipeHint: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  swipeHintText: {
    fontSize: 14,
    color: APP_COLORS.textSecondary,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: APP_COLORS.textSecondary,
  },
});

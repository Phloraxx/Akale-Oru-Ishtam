import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Image
} from 'react-native';
import { APP_COLORS } from '../utils/constants';

interface LoadingProfileProps {
  objectName: string;
  vibe: string;
  imageUri?: string;
}

const { width } = Dimensions.get('window');

export const LoadingProfile: React.FC<LoadingProfileProps> = ({
  objectName,
  vibe,
  imageUri
}) => {
  const shimmerAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const dotsAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Shimmer effect
    const shimmerLoop = Animated.loop(
      Animated.timing(shimmerAnimation, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: false,
      })
    );

    // Pulse effect
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    // Dots animation
    const dotsLoop = Animated.loop(
      Animated.timing(dotsAnimation, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: false,
      })
    );

    shimmerLoop.start();
    pulseLoop.start();
    dotsLoop.start();

    return () => {
      shimmerLoop.stop();
      pulseLoop.stop();
      dotsLoop.stop();
    };
  }, [shimmerAnimation, pulseAnimation, dotsAnimation]);

  const shimmerStyle = {
    transform: [
      {
        translateX: shimmerAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [-width, width],
        }),
      },
    ],
  };

  const dotsOpacity = dotsAnimation.interpolate({
    inputRange: [0, 0.33, 0.66, 1],
    outputRange: [1, 0.3, 0.6, 1],
  });

  const loadingMessages = [
    '🤖 AI is getting to know your object...',
    '✨ Crafting the perfect vibe...',
    '💫 Adding some personality...',
    '🎭 Creating dating profile magic...',
    '🎪 Almost ready to find love...'
  ];

  const [currentMessageIndex, setCurrentMessageIndex] = React.useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex(prev => (prev + 1) % loadingMessages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Creating Profile Magic</Text>
        <Text style={styles.subtitle}>
          Transforming "{objectName}" into a {vibe} personality
        </Text>
      </View>

      <View style={styles.imageContainer}>
        {imageUri && (
          <Animated.View
            style={[
              styles.imageWrapper,
              { transform: [{ scale: pulseAnimation }] }
            ]}
          >
            <Image source={{ uri: imageUri }} style={styles.image} />
            <View style={styles.shimmerOverlay}>
              <Animated.View style={[styles.shimmer, shimmerStyle]} />
            </View>
          </Animated.View>
        )}
      </View>

      <View style={styles.messageContainer}>
        <Text style={styles.loadingMessage}>
          {loadingMessages[currentMessageIndex]}
        </Text>
        
        <View style={styles.dotsContainer}>
          <Animated.Text style={[styles.dot, { opacity: dotsOpacity }]}>
            •
          </Animated.Text>
          <Animated.Text
            style={[
              styles.dot,
              {
                opacity: dotsAnimation.interpolate({
                  inputRange: [0, 0.33, 0.66, 1],
                  outputRange: [0.3, 1, 0.3, 0.6],
                }),
              },
            ]}
          >
            •
          </Animated.Text>
          <Animated.Text
            style={[
              styles.dot,
              {
                opacity: dotsAnimation.interpolate({
                  inputRange: [0, 0.33, 0.66, 1],
                  outputRange: [0.6, 0.3, 1, 0.3],
                }),
              },
            ]}
          >
            •
          </Animated.Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: shimmerAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['20%', '90%'],
                }),
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>Generating personality...</Text>
      </View>

      <View style={styles.funFacts}>
        <Text style={styles.funFactTitle}>Did you know?</Text>
        <Text style={styles.funFact}>
          Every object has a story waiting to be told! 📖
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_COLORS.background,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: APP_COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: APP_COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  imageWrapper: {
    width: 200,
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  shimmer: {
    width: 50,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    transform: [{ skewX: '-20deg' }],
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  loadingMessage: {
    fontSize: 18,
    color: APP_COLORS.text,
    textAlign: 'center',
    marginBottom: 16,
    minHeight: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    fontSize: 24,
    color: APP_COLORS.primary,
    marginHorizontal: 4,
  },
  progressContainer: {
    marginBottom: 32,
  },
  progressBar: {
    height: 6,
    backgroundColor: APP_COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: APP_COLORS.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    color: APP_COLORS.textSecondary,
    textAlign: 'center',
  },
  funFacts: {
    backgroundColor: APP_COLORS.surface,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  funFactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: APP_COLORS.text,
    marginBottom: 8,
  },
  funFact: {
    fontSize: 14,
    color: APP_COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

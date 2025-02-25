import { View, Text, StyleSheet, Dimensions, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: 1,
    title: 'Track Daily Habits',
    description: 'Build and maintain healthy routines',
    icon: 'calendar-outline',
    color: '#22c55e',
  },
  {
    id: 2,
    title: 'Journal Your Progress',
    description: 'Record thoughts and celebrate wins',
    icon: 'book-outline',
    color: '#3b82f6',
  },
  {
    id: 3,
    title: 'Stay Motivated',
    description: 'Achieve your goals with daily tracking',
    icon: 'trophy-outline',
    color: '#6366f1',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const scrollX = useSharedValue(0);
  

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const handleComplete = async () => {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      router.replace('/(root)/(tabs)/home');
    } catch (error) {
      console.error('Error saving onboarding status:', error);
      router.replace('/(root)/(tabs)/home');
    }
  };

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        {slides.map((slide) => (
          <View key={slide.id} style={styles.slide}>
            <View style={[styles.iconContainer, { backgroundColor: slide.color + '10' }]}>
              <Ionicons name={slide.icon} size={40} color={slide.color} />
            </View>
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.description}>{slide.description}</Text>
          </View>
        ))}
      </Animated.ScrollView>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {slides.map((_, index) => {
            const dotStyle = useAnimatedStyle(() => {
              const inputRange = [
                (index - 1) * width,
                index * width,
                (index + 1) * width,
              ];
              const dotWidth = interpolate(
                scrollX.value,
                inputRange,
                [8, 24, 8],
                'clamp'
              );
              const opacity = interpolate(
                scrollX.value,
                inputRange,
                [0.3, 1, 0.3],
                'clamp'
              );
              return {
                width: dotWidth,
                opacity,
              };
            });

            return (
              <Animated.View 
                key={index} 
                style={[styles.dot, dotStyle, { backgroundColor: '#6366f1' }]} 
              />
            );
          })}
        </View>

        <Pressable style={styles.button} onPress={handleComplete}>
          <Text style={styles.buttonText}>Let's start!</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  slide: {
    width,
    alignItems: 'center',
    padding: 40,
    paddingTop: height * 0.2,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#1a1a1a',
  },
  description: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 40,
    paddingBottom: 50,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  button: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 16,
    borderRadius: 12,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
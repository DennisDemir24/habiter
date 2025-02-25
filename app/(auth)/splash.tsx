import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LogoIcon } from '../../components/Logo';


const { width } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
      
      // Wait for 2 seconds to show splash screen
      setTimeout(() => {
        if (hasSeenOnboarding === 'true') {
          router.replace('/(root)/(tabs)/home');
        } else {
          router.replace('/(auth)/onboarding');
        }
      }, 2000);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      router.replace('/(root)/(tabs)/home');
    }
  };

  return (
    <View style={styles.container}>
      <LogoIcon size={width * 0.4} color="#6366f1" />
      <Text style={styles.title}>Habit Tracker</Text>
      <Text style={styles.subtitle}>Build better habits, achieve more</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 20,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666666',
    textAlign: 'center',
  },
});
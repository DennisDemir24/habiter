import { View, Text, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, Link } from 'expo-router';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { fetchAPI } from '@/lib/fetch';

// Define profile data type
interface ProfileData {
  display_name?: string;
  bio?: string;
  user_id: string;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { signOut, isLoaded } = useAuth();
  const { user } = useUser();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      if (!user?.id) return;
      
      setLoading(true);
      const result = await fetchAPI(`/(api)/profile/profile?userId=${user.id}`);
      
      setProfileData(result.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Initial fetch on mount
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Fetch when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [fetchProfile])
  );

  // Get initials for avatar fallback
  const getInitials = () => {
    if (profileData?.display_name) {
      return profileData.display_name
        .split(' ')
        .map((name: string) => name[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    
    if (user?.fullName) {
      return user.fullName
        .split(' ')
        .map((name: string) => name[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    
    return user?.emailAddresses[0].emailAddress.substring(0, 2).toUpperCase() || '??';
  };

  const resetAndRestart = async () => {
    try {
      await AsyncStorage.removeItem('hasSeenOnboarding');
      router.replace('/splash');
    } catch (error) {
      console.error('Error resetting:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      // After signing out, you might want to redirect to the login screen
      router.replace('/(auth)/sign-in');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row justify-between items-center px-5 py-4 border-b border-gray-100">
        <Text className="text-xl font-bold">Profile</Text>
        <View className="flex-row">
          <Pressable className="ml-4 p-1" onPress={() => router.push('/settings')}>
            <Ionicons name="settings-outline" size={24} color="#000" />
          </Pressable>
          <Pressable className="ml-4 p-1">
            <Ionicons name="notifications-outline" size={24} color="#000" />
          </Pressable>
        </View>
      </View>

      <View className="p-5 border-b border-gray-100">
        <View className="flex-row items-center mb-5">
          {user?.imageUrl ? (
            <Image
              source={{ uri: user.imageUrl }}
              className="w-20 h-20 rounded-full"
            />
          ) : (
            <View className="w-20 h-20 rounded-full bg-indigo-500 justify-center items-center">
              <Text className="text-white text-2xl font-bold">{getInitials()}</Text>
            </View>
          )}
          <View className="ml-4">
            <Text className="text-2xl font-bold">
              {profileData?.display_name || user?.fullName || 'User'}
            </Text>
            <Text className="text-base text-gray-600 mt-1">{user?.emailAddresses[0].emailAddress}</Text>
            {profileData?.bio && (
              <Text className="text-sm text-gray-600 mt-2 max-w-[250px]">{profileData.bio}</Text>
            )}
          </View>
        </View>
        <Pressable 
          className="bg-gray-100 py-3 rounded-lg items-center"
          onPress={() => router.push('/profile/edit-profile')}
        >
          <Text className="text-base font-semibold">Edit Profile</Text>
        </Pressable>
      </View>

      <View className="flex-row p-5 border-b border-gray-100">
        <View className="flex-1 items-center">
          <Text className="text-2xl font-bold">12</Text>
          <Text className="text-sm text-gray-600 mt-1">Active Habits</Text>
        </View>
        <View className="flex-1 items-center">
          <Text className="text-2xl font-bold">85%</Text>
          <Text className="text-sm text-gray-600 mt-1">Completion</Text>
        </View>
        <View className="flex-1 items-center">
          <Text className="text-2xl font-bold">45</Text>
          <Text className="text-sm text-gray-600 mt-1">Day Streak</Text>
        </View>
      </View>

      <Pressable 
        className="mx-5 my-5 bg-red-100 p-4 rounded-xl items-center mt-auto"
        onPress={handleSignOut}
        disabled={!isLoaded}
      >
        <Text className="text-red-500 text-base font-semibold">Log Out</Text>
      </Pressable>

      {__DEV__ && (
        <View className="mt-10 mx-5 p-5 bg-gray-100 rounded-xl">
          <Text className="text-base font-bold mb-2.5 text-gray-600">Development Options</Text>
          <Pressable 
            className="bg-indigo-500 p-3 rounded-lg"
            onPress={resetAndRestart}
          >
            <Text className="text-white text-center font-semibold">Reset & View Onboarding</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}
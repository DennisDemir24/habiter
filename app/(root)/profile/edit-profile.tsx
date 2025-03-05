import { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { fetchAPI } from '@/lib/fetch';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    // Fetch existing profile data when component mounts
    const fetchProfile = async () => {
      try {
        if (!user?.id) return;
        
        const result = await fetchAPI(`/(api)/profile/profile?userId=${user.id}`);
        
        if (result.data) {
          setDisplayName(result.data.display_name || '');
          setBio(result.data.bio || '');
        } else {
          // If no profile exists yet, use the name from Clerk
          setDisplayName(user.fullName || '');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const saveProfile = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const response = await fetch('/(api)/profile/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          display_name: displayName,
          bio: bio,
        }),
      });

      if (response.ok) {
        router.back();
      } else {
        console.error('Failed to save profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#6366f1" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100">
        <Pressable onPress={() => router.back()} className="p-1">
          <Ionicons name="arrow-back" size={24} color="#000" />
        </Pressable>
        <Text className="text-lg font-bold">Edit Profile</Text>
        <View className="w-6" />
      </View>

      <View className="p-5">
        <View className="mb-5">
          <Text className="text-base font-semibold mb-2">Display Name</Text>
          <TextInput
            className="border border-gray-200 rounded-lg p-3 text-base bg-gray-50"
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Your name"
          />
        </View>

        <View className="mb-5">
          <Text className="text-base font-semibold mb-2">Bio</Text>
          <TextInput
            className="border border-gray-200 rounded-lg p-3 text-base bg-gray-50 h-30"
            value={bio}
            onChangeText={setBio}
            placeholder="Tell us about yourself"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <Pressable 
          className={`bg-indigo-500 p-4 rounded-xl items-center mt-5 ${loading ? 'opacity-70' : ''}`}
          onPress={saveProfile}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text className="text-white text-base font-semibold">Save Changes</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';

export default function ProfileScreen() {
  const router = useRouter();
  const { signOut, isLoaded } = useAuth();

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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileInfo}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&h=200&auto=format&fit=crop' }}
            style={styles.avatar}
          />
          <View style={styles.profileTexts}>
            <Text style={styles.name}>Diana Cooper</Text>
            <Text style={styles.email}>diana.cooper@example.com</Text>
          </View>
        </View>
        <Pressable style={styles.editButton}>
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </Pressable>
      </View>

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>12</Text>
          <Text style={styles.statLabel}>Active Habits</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>85%</Text>
          <Text style={styles.statLabel}>Completion</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>45</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
      </View>

      <View style={styles.menu}>
        <Pressable style={styles.menuItem}>
          <Ionicons name="settings-outline" size={24} color="#000" />
          <Text style={styles.menuItemText}>Settings</Text>
          <Ionicons name="chevron-forward" size={24} color="#999" />
        </Pressable>
        <Pressable style={styles.menuItem}>
          <Ionicons name="notifications-outline" size={24} color="#000" />
          <Text style={styles.menuItemText}>Notifications</Text>
          <Ionicons name="chevron-forward" size={24} color="#999" />
        </Pressable>
        <Pressable style={styles.menuItem}>
          <Ionicons name="cloud-outline" size={24} color="#000" />
          <Text style={styles.menuItemText}>Backup</Text>
          <Ionicons name="chevron-forward" size={24} color="#999" />
        </Pressable>
        <Pressable style={styles.menuItem}>
          <Ionicons name="help-circle-outline" size={24} color="#000" />
          <Text style={styles.menuItemText}>Help & Support</Text>
          <Ionicons name="chevron-forward" size={24} color="#999" />
        </Pressable>
      </View>

      <Pressable 
        style={styles.logoutButton}
        onPress={handleSignOut}
        disabled={!isLoaded}
      >
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </Pressable>

      {__DEV__ && (
        <View style={styles.devSection}>
          <Text style={styles.devSectionTitle}>Development Options</Text>
          <Pressable 
            style={styles.devButton}
            onPress={resetAndRestart}
          >
            <Text style={styles.devButtonText}>Reset & View Onboarding</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileTexts: {
    marginLeft: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  editButton: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  stats: {
    flexDirection: 'row',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  menu: {
    padding: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  logoutButton: {
    margin: 20,
    backgroundColor: '#fee2e2',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
  devSection: {
    marginTop: 40,
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginHorizontal: 20,
  },
  devSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#666',
  },
  devButton: {
    backgroundColor: '#6366f1',
    padding: 12,
    borderRadius: 8,
  },
  devButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
});
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import ThemeToggle from '@/components/ThemeToggle';

export default function Settings() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </Pressable>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <Pressable style={styles.menuItem}>
            <Ionicons name="person-outline" size={24} color="#000" />
            <Text style={styles.menuItemText}>Personal Information</Text>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </Pressable>
          <Pressable style={styles.menuItem}>
            <Ionicons name="lock-closed-outline" size={24} color="#000" />
            <Text style={styles.menuItemText}>Security</Text>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <Pressable style={styles.menuItem}>
            <Ionicons name="notifications-outline" size={24} color="#000" />
            <Text style={styles.menuItemText}>Notifications</Text>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </Pressable>
          <Pressable style={styles.menuItem}>
            <Ionicons name="color-palette-outline" size={24} color="#000" />
            <Text style={styles.menuItemText}>Appearance</Text>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>
          <Pressable style={styles.menuItem}>
            <Ionicons name="cloud-outline" size={24} color="#000" />
            <Text style={styles.menuItemText}>Backup & Restore</Text>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </Pressable>
          <Pressable style={styles.menuItem}>
            <Ionicons name="download-outline" size={24} color="#000" />
            <Text style={styles.menuItemText}>Export Data</Text>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <Pressable style={styles.menuItem}>
            <Ionicons name="help-circle-outline" size={24} color="#000" />
            <Text style={styles.menuItemText}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </Pressable>
          <Pressable style={styles.menuItem}>
            <Ionicons name="information-circle-outline" size={24} color="#000" />
            <Text style={styles.menuItemText}>About</Text>
            <Ionicons name="chevron-forward" size={24} color="#999" />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginLeft: 16,
    marginBottom: 8,
    marginTop: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemText: {
    flex: 1,
    marginLeft: 16,
    fontSize: 16,
  },
});
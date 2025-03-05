import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { JournalEntry } from '@/lib/global-state';
import { useFetch } from '@/lib/fetch';
import { useAuth } from '@clerk/clerk-expo';

export default function JournalScreen() {
  const router = useRouter();
  const { userId } = useAuth();
  const { data, loading, error, refetch } = useFetch<JournalEntry[]>(
    userId ? `/(api)/journal/journal?userId=${userId}` : null
  );

  // Transform the data to match the JournalEntry type
  const journalEntries = data ? data.map(entry => ({
    ...entry,
    id: entry.id,
    date: new Date(entry.date)
  })) : [];

  // Refetch data when the component comes into focus
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Journal</Text>
          <Text style={styles.subtitle}>Record your thoughts and achievements</Text>
        </View>
        <Pressable 
          style={styles.addButton}
          onPress={() => router.push('/journal/new')}>
          <Ionicons name="add" size={24} color="#fff" />
        </Pressable>
      </View>

      <ScrollView style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.loadingText}>Loading journal entries...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
            <Text style={styles.errorText}>Failed to load journal entries</Text>
            <Pressable style={styles.retryButton} onPress={refetch}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </Pressable>
          </View>
        ) : journalEntries.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="book-outline" size={48} color="#666" />
            <Text style={styles.emptyStateText}>Start your journaling journey</Text>
            <Text style={styles.emptyStateSubtext}>
              Record your thoughts, track your mood, and celebrate your achievements
            </Text>
          </View>
        ) : (
          <View style={styles.entriesList}>
            {journalEntries.map((entry) => (
              <Pressable
                key={entry.id}
                style={styles.entryCard}
                onPress={() => router.push(`/journal/${entry.id}`)}>
                <Text style={styles.entryDate}>
                  {entry.date.toLocaleDateString()}
                </Text>
                <Text style={styles.entryTitle}>{entry.title}</Text>
                <Text style={styles.entryPreview} numberOfLines={2}>
                  {entry.content}
                </Text>
                {entry.mood && (
                  <View style={styles.moodTag}>
                    <Text style={styles.moodText}>{entry.mood}</Text>
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        )}
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
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  addButton: {
    backgroundColor: '#000',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  entriesList: {
    padding: 20,
    gap: 16,
  },
  entryCard: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 16,
  },
  entryDate: {
    fontSize: 14,
    color: '#666',
  },
  entryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
  entryPreview: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  moodTag: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  moodText: {
    fontSize: 14,
    color: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    height: 300,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    height: 300,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#ef4444',
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
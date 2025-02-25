import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { getJournalEntries, subscribeToJournalEntries } from '@/lib/global-state';


export default function JournalScreen() {
  const router = useRouter();
  const [localEntries, setLocalEntries] = useState(getJournalEntries());

  useEffect(() => {
    // Subscribe to journal entry changes
    const unsubscribe = subscribeToJournalEntries((newEntries) => {
      setLocalEntries(newEntries);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

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
        {localEntries.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="book-outline" size={48} color="#666" />
            <Text style={styles.emptyStateText}>Start your journaling journey</Text>
            <Text style={styles.emptyStateSubtext}>
              Record your thoughts, track your mood, and celebrate your achievements
            </Text>
          </View>
        ) : (
          <View style={styles.entriesList}>
            {localEntries.map((entry) => (
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
});
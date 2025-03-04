import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/fetch';
import { useAuth } from '@clerk/clerk-expo';
import { JournalEntry } from '@/lib/global-state';

type DatabaseJournalEntry = {
  id: number;
  title: string;
  content: string;
  mood: string | null;
  date: string;
  user_id: string;
};

export default function JournalEntryDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { userId } = useAuth();
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [editedMood, setEditedMood] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch the journal entry from the database
  useEffect(() => {
    async function fetchEntry() {
      if (!id || !userId) return;
      
      try {
        setLoading(true);
        const response = await fetchAPI(`/(api)/journal/journal?id=${id}&userId=${userId}`);
        if (response.data && response.data.length > 0) {
          const dbEntry: DatabaseJournalEntry = response.data[0];
          const fetchedEntry: JournalEntry = {
            id: dbEntry.id,
            title: dbEntry.title,
            content: dbEntry.content,
            mood: dbEntry.mood || undefined,
            date: new Date(dbEntry.date)
          };
          setEntry(fetchedEntry);
          setEditedTitle(fetchedEntry.title);
          setEditedContent(fetchedEntry.content);
          setEditedMood(fetchedEntry.mood || '');
        } else {
          setError('Entry not found');
        }
      } catch (err) {
        console.error('Error fetching journal entry:', err);
        setError('Failed to load journal entry');
      } finally {
        setLoading(false);
      }
    }
    
    fetchEntry();
  }, [id, userId]);

  const handleDelete = async () => {
    if (!id || !userId) return;
    
    try {
      setIsDeleting(true);
      await fetchAPI(`/(api)/journal/journal?id=${id}&userId=${userId}`, {
        method: 'DELETE'
      });
      router.back();
    } catch (error) {
      console.error('Error deleting journal entry:', error);
      Alert.alert('Error', 'Failed to delete journal entry');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSave = async () => {
    if (!id || !userId || !editedTitle.trim() || !editedContent.trim()) return;
    
    try {
      setIsSaving(true);
      const response = await fetchAPI('/(api)/journal/journal', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: Number(id),
          title: editedTitle.trim(),
          content: editedContent.trim(),
          mood: editedMood.trim() || null,
          user_id: userId,
        }),
      });
      
      if (response.data) {
        setEntry({
          ...response.data,
          date: new Date(response.data.date)
        });
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating journal entry:', error);
      Alert.alert('Error', 'Failed to update journal entry');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading journal entry...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !entry) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </Pressable>
          <Text style={styles.headerTitle}>Error</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
          <Text style={styles.errorText}>{error || 'Entry not found'}</Text>
          <Pressable style={styles.retryButton} onPress={() => router.back()}>
            <Text style={styles.retryButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </Pressable>
        <Text style={styles.headerTitle}>Journal Entry</Text>
        <View style={styles.headerButtons}>
          {isEditing ? (
            <Pressable 
              onPress={handleSave} 
              style={[styles.editButton, isSaving && styles.disabledButton]}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#22c55e" />
              ) : (
                <Ionicons name="checkmark" size={24} color="#22c55e" />
              )}
            </Pressable>
          ) : (
            <Pressable onPress={() => setIsEditing(true)} style={styles.editButton}>
              <Ionicons name="pencil" size={24} color="#3b82f6" />
            </Pressable>
          )}
          <Pressable 
            onPress={handleDelete} 
            style={[styles.deleteButton, isDeleting && styles.disabledButton]}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color="#ef4444" />
            ) : (
              <Ionicons name="trash-outline" size={24} color="#ef4444" />
            )}
          </Pressable>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.date}>
          {entry.date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
        {isEditing ? (
          <>
            <TextInput
              style={[styles.title, styles.input]}
              value={editedTitle}
              onChangeText={setEditedTitle}
              placeholder="Title"
            />
            <TextInput
              style={[styles.moodInput, styles.input]}
              value={editedMood}
              onChangeText={setEditedMood}
              placeholder="Mood"
            />
            <TextInput
              style={[styles.contentText, styles.input]}
              value={editedContent}
              onChangeText={setEditedContent}
              placeholder="Content"
              multiline
            />
          </>
        ) : (
          <>
            <Text style={styles.title}>{entry.title}</Text>
            {entry.mood && (
              <View style={styles.moodContainer}>
                <Text style={styles.moodText}>{entry.mood}</Text>
              </View>
            )}
            <Text style={styles.contentText}>{entry.content}</Text>
          </>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  date: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  moodContainer: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 24,
  },
  moodText: {
    color: '#000',
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    padding: 8,
    marginRight: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  moodInput: {
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
  disabledButton: {
    opacity: 0.5,
  },
});
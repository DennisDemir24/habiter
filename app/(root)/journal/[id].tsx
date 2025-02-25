import { View, Text, StyleSheet, Pressable, ScrollView, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { setJournalEntries, getJournalEntries } from '@/lib/global-state';


export default function JournalEntryDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const entry = getJournalEntries().find(e => e.id === Number(id));
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(entry?.title || '');
  const [editedContent, setEditedContent] = useState(entry?.content || '');
  const [editedMood, setEditedMood] = useState(entry?.mood || '');

  if (!entry) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Entry not found</Text>
      </SafeAreaView>
    );
  }

  const handleDelete = () => {
    const currentEntries = getJournalEntries();
    const updatedEntries = currentEntries.filter(e => e.id !== Number(id));
    setJournalEntries(updatedEntries);
    router.back();
  };

  const handleSave = () => {
    const currentEntries = getJournalEntries();
    const updatedEntries = currentEntries.map(e => {
      if (e.id === Number(id)) {
        return {
          ...e,
          title: editedTitle,
          content: editedContent,
          mood: editedMood,
        };
      }
      return e;
    });
    setJournalEntries(updatedEntries);
    setIsEditing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </Pressable>
        <Text style={styles.headerTitle}>Journal Entry</Text>
        <View style={styles.headerButtons}>
          {isEditing ? (
            <Pressable onPress={handleSave} style={styles.editButton}>
              <Ionicons name="checkmark" size={24} color="#22c55e" />
            </Pressable>
          ) : (
            <Pressable onPress={() => setIsEditing(true)} style={styles.editButton}>
              <Ionicons name="pencil" size={24} color="#3b82f6" />
            </Pressable>
          )}
          <Pressable onPress={handleDelete} style={styles.deleteButton}>
            <Ionicons name="trash-outline" size={24} color="#ef4444" />
          </Pressable>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.date}>
          {new Date(entry.date).toLocaleDateString('en-US', {
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
});
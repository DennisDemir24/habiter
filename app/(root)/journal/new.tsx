import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { setJournalEntries, getJournalEntries, JournalEntry } from '@/lib/global-state';


const MOOD_OPTIONS = ['Happy', 'Grateful', 'Productive', 'Tired', 'Stressed', 'Calm'];

export default function NewJournalEntry() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState<string | undefined>();

  const handleSave = () => {
    if (!title.trim() || !content.trim()) return;

    const newEntry: JournalEntry = {
      id: Date.now(),
      title: title.trim(),
      content: content.trim(),
      mood: selectedMood,
      date: new Date(),
    };

    const currentEntries = getJournalEntries();
    setJournalEntries([newEntry, ...currentEntries]);
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={24} color="#000" />
        </Pressable>
        <Text style={styles.headerTitle}>New Entry</Text>
        <Pressable 
          onPress={handleSave}
          style={[
            styles.saveButton,
            (!title.trim() || !content.trim()) && styles.saveButtonDisabled
          ]}>
          <Text style={styles.saveButtonText}>Save</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.content}>
        <TextInput
          style={styles.titleInput}
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
          placeholderTextColor="#666"
        />

        <Text style={styles.label}>How are you feeling?</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.moodContainer}>
          {MOOD_OPTIONS.map((mood) => (
            <Pressable
              key={mood}
              style={[
                styles.moodOption,
                selectedMood === mood && styles.moodOptionSelected
              ]}
              onPress={() => setSelectedMood(mood)}>
              <Text style={[
                styles.moodText,
                selectedMood === mood && styles.moodTextSelected
              ]}>{mood}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <TextInput
          style={styles.contentInput}
          placeholder="Write your thoughts..."
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
          placeholderTextColor="#666"
        />
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
  saveButton: {
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  moodContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  moodOption: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  moodOptionSelected: {
    backgroundColor: '#000',
  },
  moodText: {
    color: '#000',
  },
  moodTextSelected: {
    color: '#fff',
  },
  contentInput: {
    fontSize: 16,
    height: 300,
  },
});
import { View, Text, StyleSheet, TextInput, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { setHabits, getHabits, Habit } from '@/lib/global-state';



const ICONS = [
  { name: 'briefcase', color: '#fcd34d' },
  { name: 'flash', color: '#f9a8d4' },
  { name: 'person', color: '#93c5fd' },
  { name: 'wallet', color: '#86efac' },
  { name: 'restaurant', color: '#fb923c' },
  { name: 'headset', color: '#a5f3fc' },
  { name: 'football', color: '#fcd34d' },
  { name: 'book', color: '#f9a8d4' },
  { name: 'bag', color: '#93c5fd' },
  { name: 'bed', color: '#86efac' },
  { name: 'flame', color: '#fb923c' },
  { name: 'leaf', color: '#a5f3fc' },
  { name: 'desktop', color: '#fcd34d' },
  { name: 'image', color: '#f9a8d4' },
  { name: 'musical-notes', color: '#93c5fd' },
  { name: 'happy', color: '#86efac' },
];

const INTERVALS = [
  'Every day',
  'Weekdays',
  'Weekends',
  'Custom',
];

const PRIORITIES = ['high', 'medium', 'low'];
// Add priority colors for visual indication
const PRIORITY_COLORS = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#22c55e',
};

export default function AddHabitScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('');
  const [selectedInterval, setSelectedInterval] = useState(INTERVALS[0]);
  const [error, setError] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<'high' | 'medium' | 'low'>('medium');

  const handleCreateHabit = () => {
    if (!title.trim()) {
      setError('Please enter a habit name');
      return;
    }

    if (!selectedIcon) {
      setError('Please select an icon');
      return;
    }

    const selectedIconData = ICONS.find(icon => icon.name === selectedIcon);
    if (!selectedIconData) {
      setError('Invalid icon selected');
      return;
    }

    const newHabit: Habit = {
      id: Date.now(),
      title: title.trim(),
      description: description.trim(),
      color: selectedIconData.color,
      icon: selectedIcon,
      completed: false,
      interval: selectedInterval,
      priority: selectedPriority,
    };

    const currentHabits = getHabits();
    setHabits([...currentHabits, newHabit]);
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#000" />
        </Pressable>
        <Text style={styles.title}>Let's start a new habit</Text>
      </View>

      <ScrollView style={styles.content}>
        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : null}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Type habit name"
            placeholderTextColor="#999"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={styles.input}
            placeholder="Describe a habit"
            placeholderTextColor="#999"
            multiline
            value={description}
            onChangeText={setDescription}
          />
        </View>

        <View style={styles.inputGroup}>
      <Text style={styles.label}>Priority</Text>
      <View style={styles.priorityContainer}>
        {PRIORITIES.map((priority) => (
          <Pressable
            key={priority}
            style={[
              styles.priorityOption,
              { backgroundColor: PRIORITY_COLORS[priority] + '20' },
              selectedPriority === priority && styles.priorityOptionSelected,
            ]}
            onPress={() => setSelectedPriority(priority)}>
            <Text style={[
              styles.priorityText,
              { color: PRIORITY_COLORS[priority] },
              selectedPriority === priority && styles.priorityTextSelected,
            ]}>
              {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Intervals</Text>
          <View style={styles.intervalsContainer}>
            {INTERVALS.map((interval) => (
              <Pressable
                key={interval}
                style={[
                  styles.intervalButton,
                  selectedInterval === interval && styles.intervalButtonActive,
                ]}
                onPress={() => setSelectedInterval(interval)}>
                <Text
                  style={[
                    styles.intervalButtonText,
                    selectedInterval === interval && styles.intervalButtonTextActive,
                  ]}>
                  {interval}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Icon</Text>
          <View style={styles.iconsGrid}>
            {ICONS.map((icon) => (
              <Pressable
                key={icon.name}
                style={[
                  styles.iconButton,
                  { backgroundColor: icon.color },
                  selectedIcon === icon.name && styles.iconButtonActive,
                ]}
                onPress={() => setSelectedIcon(icon.name)}>
                <Ionicons name={icon.name as any} size={24} color="#000" />
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable 
          style={[styles.createButton, !title.trim() && styles.createButtonDisabled]}
          onPress={handleCreateHabit}
          disabled={!title.trim()}>
          <Text style={styles.createButtonText}>Create habit</Text>
        </Pressable>
      </View>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  errorText: {
    color: '#ef4444',
    marginBottom: 16,
    fontSize: 14,
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  intervalsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  intervalButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  intervalButtonActive: {
    backgroundColor: '#000',
  },
  intervalButtonText: {
    color: '#666',
  },
  intervalButtonTextActive: {
    color: '#fff',
  },
  iconsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  iconButton: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonActive: {
    borderWidth: 2,
    borderColor: '#000',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  createButton: {
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  createButtonDisabled: {
    backgroundColor: '#e5e7eb',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  priorityOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  priorityOptionSelected: {
    borderColor: '#000',
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  priorityTextSelected: {
    fontWeight: 'bold',
  },
});
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { getHabits, setHabits } from '@/lib/global-state';
import { fetchAPI } from '@/lib/fetch';
import { useUser } from '@clerk/clerk-expo';

export default function HabitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [habit, setHabit] = useState(getHabits().find(h => h.id === parseInt(id)));
  const [localHabits, setLocalHabits] = useState(getHabits());
  const [editedHabit, setEditedHabit] = useState(habit);

  const INTERVALS = ['Every day', 'Weekdays', 'Weekends'];
  const COLORS = ['#fcd34d', '#86efac', '#e5e7eb', '#93c5fd', '#f9a8d4'];
  const ICONS = ['book', 'bed', 'desktop', 'happy', 'wallet', 'alarm'];

  useEffect(() => {
    // Update local state when habits change
    setLocalHabits(getHabits());
    setHabit(getHabits().find(h => h.id === parseInt(id)));
  }, [id]);

  const saveChanges = async () => {
    if (!editedHabit?.title || !editedHabit?.description) return;
    
    try {
      // Update locally first for immediate feedback
      const updatedHabits = localHabits.map(h => 
        h.id === habit?.id ? editedHabit : h
      );
      setHabits(updatedHabits);
      setLocalHabits(updatedHabits);
      setHabit(editedHabit);
      setIsEditing(false);
      
      // Then update in the database
      const updateUrl = `/(api)/habit/update/${id}`;
      
      const response = await fetchAPI(updateUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editedHabit.title,
          description: editedHabit.description,
          color: editedHabit.color,
          icon: editedHabit.icon,
          interval: editedHabit.interval,
          priority: editedHabit.priority
        }),
      });
      
    } catch (error) {
      console.error("Error updating habit:", error);
      // If the API call fails, we could revert the changes or show an error message
    }
  };

  if (!habit) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </Pressable>
        </View>
        <View style={styles.content}>
          <Text style={styles.errorText}>Habit not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const toggleComplete = async () => {
    try {
      // Update locally first for immediate feedback
      const updatedHabits = localHabits.map(h => 
        h.id === habit.id ? { ...h, completed: !h.completed } : h
      );
      setHabits(updatedHabits);
      setLocalHabits(updatedHabits);
      setHabit(updatedHabits.find(h => h.id === habit.id));
      
      // Then update in the database
      const updateUrl = `/(api)/habit/update/${id}`;
      
      const response = await fetchAPI(updateUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completed: !habit.completed,
        }),
      });
    } catch (error) {
      console.error("Error updating habit completion:", error);
      // If the API call fails, we could revert the changes or show an error message
    }
  };

  const deleteHabit = async () => {
    try {
      // Update locally first for immediate feedback
      const updatedHabits = localHabits.filter(h => h.id !== habit.id);
      setHabits(updatedHabits);
      
      // Then delete from the database
      if (user) {
        const deleteUrl = `/(api)/habit/habit?habitId=${id}&userId=${user.id}`;
        
        const response = await fetchAPI(deleteUrl, {
          method: 'DELETE',
        });
      }
      
      router.back();
    } catch (error) {
      console.error("Error deleting habit:", error);
      // If the API call fails, we could revert the changes or show an error message
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </Pressable>
        <Text style={styles.headerTitle}>{habit.title}</Text>
        {!isEditing ? (
          <Pressable 
            style={styles.editButton} 
            onPress={() => setIsEditing(true)}>
            <Ionicons name="pencil" size={24} color="#000" />
          </Pressable>
        ) : (
          <Pressable 
            style={styles.saveButton} 
            onPress={saveChanges}>
            <Text style={styles.saveButtonText}>Save</Text>
          </Pressable>
        )}
      </View>

      <ScrollView style={styles.content}>
        {!isEditing ? (
          <>
            <View style={[styles.iconContainer, { backgroundColor: habit.color }]}>
              <Ionicons name={habit.icon as any} size={32} color="#000" />
            </View>
            <Text style={styles.title}>{habit.title}</Text>
            <Text style={styles.description}>{habit.description}</Text>
            <View style={styles.infoContainer}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Interval</Text>
                <Text style={styles.infoValue}>{habit.interval}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Status</Text>
                <Text style={[styles.infoValue, habit.completed ? styles.completedText : styles.pendingText]}>
                  {habit.completed ? 'Completed' : 'Pending'}
                </Text>
              </View>
            </View>
          </>
        ) : (
          <>
            <TextInput
              style={styles.input}
              value={editedHabit?.title}
              onChangeText={(text) => setEditedHabit(prev => ({ ...prev!, title: text }))}
              placeholder="Habit Title"
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              value={editedHabit?.description}
              onChangeText={(text) => setEditedHabit(prev => ({ ...prev!, description: text }))}
              placeholder="Habit Description"
              multiline
            />

            <Text style={styles.sectionTitle}>Choose an interval</Text>
            <View style={styles.intervalContainer}>
              {INTERVALS.map((interval) => (
                <Pressable
                  key={interval}
                  style={[
                    styles.intervalOption,
                    editedHabit?.interval === interval && styles.selectedInterval
                  ]}
                  onPress={() => setEditedHabit(prev => ({ ...prev!, interval }))}>
                  <Text style={[
                    styles.intervalText,
                    editedHabit?.interval === interval && styles.selectedIntervalText
                  ]}>{interval}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Choose a color</Text>
            <View style={styles.colorContainer}>
              {COLORS.map((color) => (
                <Pressable
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    editedHabit?.color === color && styles.selectedColor
                  ]}
                  onPress={() => setEditedHabit(prev => ({ ...prev!, color }))}
                />
              ))}
            </View>

            <Text style={styles.sectionTitle}>Choose an icon</Text>
            <View style={styles.iconGrid}>
              {ICONS.map((icon) => (
                <Pressable
                  key={icon}
                  style={[
                    styles.iconOption,
                    editedHabit?.icon === icon && styles.selectedIcon
                  ]}
                  onPress={() => setEditedHabit(prev => ({ ...prev!, icon }))}>
                  <Ionicons name={icon as any} size={24} color="#000" />
                </Pressable>
              ))}
            </View>
          </>
        )}

        <View style={styles.actions}>
          <Pressable 
            style={[styles.actionButton, styles.toggleButton]} 
            onPress={toggleComplete}>
            <Ionicons 
              name={habit.completed ? 'close-circle' : 'checkmark-circle'} 
              size={24} 
              color="#fff" 
            />
            <Text style={styles.actionButtonText}>
              {habit.completed ? 'Mark as Incomplete' : 'Mark as Complete'}
            </Text>
          </Pressable>

          <Pressable 
            style={[styles.actionButton, styles.deleteButton]} 
            onPress={deleteHabit}>
            <Ionicons name="trash" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Delete Habit</Text>
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
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  infoContainer: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 40,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  completedText: {
    color: '#22c55e',
  },
  pendingText: {
    color: '#f59e0b',
  },
  actions: {
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  toggleButton: {
    backgroundColor: '#000',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 8,
  },
  intervalContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  intervalOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  selectedInterval: {
    backgroundColor: '#000',
  },
  intervalText: {
    color: '#000',
  },
  selectedIntervalText: {
    color: '#fff',
  },
  colorContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: '#000',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  iconOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIcon: {
    backgroundColor: '#e5e7eb',
    borderWidth: 2,
    borderColor: '#000',
  },
  editButton: {
    padding: 8,
  },
  saveButton: {
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { fetchAPI } from '@/lib/fetch';
import { useUser } from '@clerk/clerk-expo';
import { useHabitStore } from '@/store/habit-store';
import { Habit } from '@/lib/global-state';

export default function HabitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const parsedId = parseInt(id);
  const router = useRouter();
  const { user } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  
  // Use our habit store
  const { 
    habits, 
    fetchHabits, 
    toggleHabitComplete, 
    updateHabit, 
    deleteHabit: storeDeleteHabit 
  } = useHabitStore();

  // Get the specific habit from the store
  const habit = habits.find(h => h.id === parsedId);
  const [editedHabit, setEditedHabit] = useState<Habit | undefined>(habit);

  const INTERVALS = ['Every day', 'Weekdays', 'Weekends'];
  const COLORS = ['#fcd34d', '#86efac', '#e5e7eb', '#93c5fd', '#f9a8d4'];
  const ICONS = ['book', 'bed', 'desktop', 'happy', 'wallet', 'alarm'];

  useEffect(() => {
    // Make sure we have the habits loaded
    if (user?.id && habits.length === 0) {
      fetchHabits(user.id);
    }
    
    // Update edited habit when the actual habit changes
    if (habit) {
      setEditedHabit(habit);
    }
  }, [user, habits, habit, fetchHabits]);

  const saveChanges = async () => {
    if (!editedHabit?.title || !editedHabit?.description || !parsedId) return;
    
    try {
      // Use the store to update the habit
      await updateHabit(parsedId, {
        title: editedHabit.title,
        description: editedHabit.description,
        color: editedHabit.color,
        icon: editedHabit.icon,
        interval: editedHabit.interval,
        priority: editedHabit.priority
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating habit:", error);
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

  const handleToggleComplete = async () => {
    if (parsedId) {
      await toggleHabitComplete(parsedId);
    }
  };

  const handleDeleteHabit = async () => {
    if (parsedId && user?.id) {
      await storeDeleteHabit(parsedId, user.id);
      router.back();
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
          <View style={styles.editForm}>
            <Text style={styles.formLabel}>Title</Text>
            <TextInput
              style={styles.input}
              value={editedHabit?.title}
              onChangeText={(text) => setEditedHabit(prev => prev ? {...prev, title: text} : undefined)}
              placeholder="Habit title"
            />
            
            <Text style={styles.formLabel}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={editedHabit?.description}
              onChangeText={(text) => setEditedHabit(prev => prev ? {...prev, description: text} : undefined)}
              placeholder="Habit description"
              multiline
            />
            
            <Text style={styles.formLabel}>Interval</Text>
            <View style={styles.optionsContainer}>
              {INTERVALS.map((interval) => (
                <Pressable
                  key={interval}
                  style={[
                    styles.optionButton,
                    editedHabit?.interval === interval && styles.selectedOption
                  ]}
                  onPress={() => setEditedHabit(prev => prev ? {...prev, interval} : undefined)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      editedHabit?.interval === interval && styles.selectedOptionText
                    ]}
                  >
                    {interval}
                  </Text>
                </Pressable>
              ))}
            </View>
            
            <Text style={styles.formLabel}>Color</Text>
            <View style={styles.colorContainer}>
              {COLORS.map((color) => (
                <Pressable
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    editedHabit?.color === color && styles.selectedColorOption
                  ]}
                  onPress={() => setEditedHabit(prev => prev ? {...prev, color} : undefined)}
                />
              ))}
            </View>
            
            <Text style={styles.formLabel}>Icon</Text>
            <View style={styles.iconOptionsContainer}>
              {ICONS.map((icon) => (
                <Pressable
                  key={icon}
                  style={[
                    styles.iconOption,
                    editedHabit?.icon === icon && styles.selectedIconOption,
                    { backgroundColor: editedHabit?.color }
                  ]}
                  onPress={() => setEditedHabit(prev => prev ? {...prev, icon} : undefined)}
                >
                  <Ionicons name={icon as any} size={24} color="#000" />
                </Pressable>
              ))}
            </View>
          </View>
        )}
        
        <View style={styles.actions}>
          <Pressable
            style={[styles.actionButton, styles.toggleButton]}
            onPress={handleToggleComplete}
          >
            <Ionicons
              name={habit.completed ? "close-circle-outline" : "checkmark-circle-outline"}
              size={20}
              color="#fff"
            />
            <Text style={styles.actionButtonText}>
              {habit.completed ? "Mark as Incomplete" : "Mark as Complete"}
            </Text>
          </Pressable>
          
          <Pressable
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDeleteHabit}
          >
            <Ionicons name="trash-outline" size={20} color="#fff" />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  completedText: {
    color: '#22c55e',
  },
  pendingText: {
    color: '#f59e0b',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  actions: {
    marginTop: 24,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  toggleButton: {
    backgroundColor: '#6366f1',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 24,
    color: '#ef4444',
  },
  editForm: {
    gap: 16,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  selectedOption: {
    backgroundColor: '#000',
  },
  optionText: {
    color: '#000',
  },
  selectedOptionText: {
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
  selectedColorOption: {
    borderWidth: 3,
    borderColor: '#000',
  },
  iconOptionsContainer: {
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
  selectedIconOption: {
    backgroundColor: '#e5e7eb',
    borderWidth: 2,
    borderColor: '#000',
  }
});
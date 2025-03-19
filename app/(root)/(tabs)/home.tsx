import { View, Text, StyleSheet, ScrollView, Pressable, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { type Habit } from '@/lib/global-state';
import MeditationModal from '../../../components/MeditationModal';
import { useUser } from '@clerk/clerk-expo';
import HabitCard from '@/components/HabitCard';
import { haptics } from '@/utils/haptics';
import { useHabitStore } from '@/store/habit-store';


const getDaysArray = () => {
  const today = new Date();
  const days = [];

  for (let i = -3; i <= 3; i++) {
    const date = new Date();
    date.setDate(today.getDate() + i);

    days.push({
      number: date.getDate(),
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      active: i === 0, // Today is active by default
      isToday: i === 0,
      date: date, // Store the full date object for filtering
    });
  }

  return days;
};

// Add a function to get the appropriate greeting based on time of day
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
};

export default function Home() {
  const router = useRouter();
  const [isMeditationModalVisible, setIsMeditationModalVisible] = useState(false);
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [days, setDays] = useState(getDaysArray());
  const { user } = useUser();
  
  // Use the habit store
  const { 
    habits, 
    isLoading, 
    fetchHabits, 
    toggleHabitComplete: toggleComplete 
  } = useHabitStore();

  // Log user ID for debugging
  useEffect(() => {
    if (user) {
      console.log("Current user ID:", user.id);
    }
  }, [user]);

  // Initial fetch of habits
  useEffect(() => {
    if (user?.id) {
      fetchHabits(user.id);
    }
  }, [fetchHabits, user]);

  const toggleMeditationModal = () => {
    haptics.medium(); // Medium feedback when toggling modal
    setIsMeditationModalVisible(!isMeditationModalVisible);
  };

  const toggleHabitComplete = async (habit: Habit, event: any) => {
    event.stopPropagation(); // Prevent triggering the habit press
    
    // Call the store's toggle method
    if (habit.id) {
      toggleComplete(habit.id);
    }
  };

  const stats = useMemo(() => {
    const total = habits?.length || 0;
    const completed = habits?.filter(h => h.completed)?.length || 0;
    const daily = habits?.filter(h => h.interval === 'Every day')?.length || 0;
    const weekday = habits?.filter(h => h.interval === 'Weekdays')?.length || 0;
    const weekend = habits?.filter(h => h.interval === 'Weekends')?.length || 0;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    return {
      total,
      completed,
      daily,
      weekday,
      weekend,
      completionRate: Math.round(completionRate),
    };
  }, [habits]);

  const handleHabitPress = (habit: Habit) => {
    haptics.light(); // Light feedback when pressing a habit
    router.push(`/habit/${habit.id}`);
  };

  // Add sorting by priority
  const sortedHabits = useMemo(() => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return [...habits].sort((a, b) =>
      priorityOrder[a.priority] - priorityOrder[b.priority]
    );
  }, [habits]);

  // Update the day selection handler
  const handleDaySelect = (day: any, index: number) => {
    haptics.light(); // Light feedback when selecting a day
    const updatedDays = days.map((d, i) => ({
      ...d,
      active: i === index
    }));
    
    setDays(updatedDays);
    setSelectedDay(day.date);
  };

  // Filter habits based on the selected day
  const filteredHabits = useMemo(() => {
    return sortedHabits.filter(habit => {
      const selectedDayName = selectedDay.toLocaleDateString('en-US', { weekday: 'long' });
      const isWeekend = selectedDayName === 'Saturday' || selectedDayName === 'Sunday';

      switch (habit.interval) {
        case 'Every day':
          return true;
        case 'Weekdays':
          return !isWeekend;
        case 'Weekends':
          return isWeekend;
        default:
          return true;
      }
    });
  }, [sortedHabits, selectedDay]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()},</Text>
          <Text style={styles.name}>Dennis</Text>
        </View>
        <View style={styles.headerIcons}>
          <Pressable onPress={toggleMeditationModal}>
            <Ionicons name="flower-outline" size={24} color="#000" style={styles.icon} />
          </Pressable>
          <Ionicons name="notifications-outline" size={24} color="#000" />
        </View>
      </View>
      <MeditationModal
        isVisible={isMeditationModalVisible}
        onClose={toggleMeditationModal}
      />

      <View style={styles.content}>
        <View style={styles.upperContent}>
          <View style={styles.statsContainer}>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats.total}</Text>
                <Text style={styles.statLabel}>Total Habits</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: '#f0fdf4' }]}>
                <Text style={[styles.statValue, { color: '#22c55e' }]}>{stats.completionRate}%</Text>
                <Text style={styles.statLabel}>Completion Rate</Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={[styles.statCard, { backgroundColor: '#fef3c7' }]}>
                <Text style={styles.statValue}>{stats.daily}</Text>
                <Text style={styles.statLabel}>Daily Habits</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: '#f0f9ff' }]}>
                <Text style={styles.statValue}>{stats.weekday}</Text>
                <Text style={styles.statLabel}>Weekday Habits</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {selectedDay.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daysContainer}>
              {days.map((day, index) => (
                <Pressable
                  key={index}
                  onPress={() => handleDaySelect(day, index)}
                  style={[
                    styles.dayItem,
                    day.active && styles.activeDayItem,
                    day.isToday && styles.todayItem,
                  ]}>
                  <Text
                    style={[
                      styles.dayNumber,
                      day.active && styles.activeDayText,
                      day.isToday && styles.todayText,
                    ]}>
                    {day.number}
                  </Text>
                  <Text
                    style={[
                      styles.dayText,
                      day.active && styles.activeDayText,
                      day.isToday && styles.todayText,
                    ]}>
                    {day.day}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>

        <View style={styles.habitsSection}>
          <Text style={styles.sectionTitle}>Your Habits</Text>

          {isLoading ? (
            <Text style={styles.loadingText}>Loading habits...</Text>
          ) : (habits && habits.length > 0) ? (
            <FlatList
              data={filteredHabits}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <HabitCard
                  habit={item}
                  onPress={handleHabitPress}
                  onToggleComplete={toggleHabitComplete}
                />
              )}
              style={styles.habitsList}
            />
          ) : (
            <View className="flex-1 items-center justify-center py-10">
              <Ionicons name="calendar-outline" size={64} color="#d1d5db" />
              <Text className="text-xl font-bold text-gray-700 mt-4">No habits yet</Text>
              <Text className="text-sm text-gray-500 text-center mt-2 px-6">
                Start building better routines by adding your first habit
              </Text>
              <Pressable
                className="mt-6 bg-indigo-500 py-3 px-6 rounded-full"
                onPress={() => router.push('/add')}>
                <Text className="text-white font-bold">Add Your First Habit</Text>
              </Pressable>
            </View>
          )}
        </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 15,
  },
  greeting: {
    fontSize: 16,
    color: '#666',
  },
  name: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  upperContent: {
    maxHeight: 300, // Adjust this height based on your design needs
  },
  statsContainer: {
    padding: 20,
    gap: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  daysContainer: {
    marginBottom: 20,
  },
  dayItem: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  todayItem: {
    backgroundColor: '#6366f1', // or any color you prefer
    borderWidth: 2,
    borderColor: '#4338ca',
  },
  activeDayItem: {
    backgroundColor: '#000',
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  dayText: {
    fontSize: 12,
    color: '#666',
  },
  activeDayText: {
    color: '#fff',
  },
  todayText: {
    color: '#fff',
  },
  habitsSection: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  habitCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
  },
  habitContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  habitTexts: {
    marginLeft: 15,
  },
  habitTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  habitDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  habitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  priorityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  emptyState: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 20,
    textAlign: 'center',
  },
  habitsList: {
    flex: 1,
  },
});
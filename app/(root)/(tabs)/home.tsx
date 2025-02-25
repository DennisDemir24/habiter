import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { getHabits, setHabits, type Habit, subscribeToHabits } from '@/lib/global-state';
import MeditationModal from '../../../components/MeditationModal';

const DAYS = [
  { number: 11, day: 'Tue', active: true },
  { number: 12, day: 'Wed', active: true },
  { number: 13, day: 'Thu', active: true },
  { number: 14, day: 'Fri', active: false },
  { number: 15, day: 'Sat', active: false },
  { number: 16, day: 'Sun', active: false },
  { number: 17, day: 'Mon', active: false },
].map(day => ({
  ...day,
  isToday: day.number === new Date().getDate() // Add isToday property
}));

// Add priority colors for visual indication
const PRIORITY_COLORS = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#22c55e',
};



export default function Home() {
  const router = useRouter();
  const [localHabits, setLocalHabits] = useState(getHabits());
  const [isMeditationModalVisible, setIsMeditationModalVisible] = useState(false);
  

  const toggleMeditationModal = () => {
    setIsMeditationModalVisible(!isMeditationModalVisible);
  };

  useEffect(() => {
    // Subscribe to habit changes
    const unsubscribe = subscribeToHabits((newHabits) => {
      setLocalHabits(newHabits);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const toggleHabitComplete = (habit: Habit, event: any) => {
    event.stopPropagation(); // Prevent triggering the habit press
    const updatedHabits = localHabits.map(h => 
      h.id === habit.id ? { ...h, completed: !h.completed } : h
    );
    setLocalHabits(updatedHabits);
  };

  const stats = useMemo(() => {
    const total = localHabits.length;
    const completed = localHabits.filter(h => h.completed).length;
    const daily = localHabits.filter(h => h.interval === 'Every day').length;
    const weekday = localHabits.filter(h => h.interval === 'Weekdays').length;
    const weekend = localHabits.filter(h => h.interval === 'Weekends').length;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    return {
      total,
      completed,
      daily,
      weekday,
      weekend,
      completionRate: Math.round(completionRate),
    };
  }, [localHabits]);

  const handleHabitPress = (habit: Habit) => {
    router.push(`/habit/${habit.id}`);
  };

  const getDaysArray = () => {
    const today = new Date();
    const days = [];
    
    for (let i = -3; i <= 3; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      days.push(date);
    }
    
    return days;
  };

  // Add sorting by priority
  const sortedHabits = useMemo(() => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return [...localHabits].sort((a, b) => 
      priorityOrder[a.priority] - priorityOrder[b.priority]
    );
  }, [localHabits]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good morning,</Text>
          <Text style={styles.name}>John</Text>
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

      <ScrollView style={styles.content}>
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
          <Text style={styles.sectionTitle}>Today's Habits</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daysContainer}>
  {DAYS.map((day, index) => (
    <View
      key={index}
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
    </View>
  ))}
</ScrollView>

          <View style={styles.habitsList}>
            {sortedHabits.map((habit) => (
              <Pressable
                key={habit.id}
                style={[styles.habitCard, { backgroundColor: habit.color }]}
                onPress={() => handleHabitPress(habit)}>
                <View style={styles.habitContent}>
                  <Ionicons name={habit.icon as any} size={24} color="#000" />
                  <View style={styles.habitTexts}>
                    <View style={styles.habitHeader}>
                      <Text style={styles.habitTitle}>{habit.title}</Text>
                      <View style={[
                        styles.priorityIndicator, 
                        { backgroundColor: PRIORITY_COLORS[habit.priority] }
                      ]} />
                    </View>
                    <Text style={styles.habitDescription}>{habit.description}</Text>
                  </View>
                </View>
                <Pressable 
                  onPress={(e) => toggleHabitComplete(habit, e)}
                  style={[styles.checkbox, habit.completed && styles.checkboxChecked]}>
                  {habit.completed && <Ionicons name="checkmark" size={18} color="#fff" />}
                </Pressable>
              </Pressable>
            ))}
          </View>
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
  habitsList: {
    gap: 12,
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
});
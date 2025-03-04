import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { getHabits, setHabits, type Habit, subscribeToHabits } from '@/lib/global-state';
import MeditationModal from '../../../components/MeditationModal';
import { useUser } from '@clerk/clerk-expo';
import { useFetch } from '@/lib/fetch';
import { getIconName } from '@/utils/icons';

const renderIcon = (iconName: string | null | undefined, color: string = '#000', size: number = 24) => {
  // Default to a star icon if none provided
  const name = iconName || 'star';
  
  // Get the mapped icon name
  const mappedName = getIconName(name);
  
  // Add '-outline' suffix if not already present to use outline style
  const finalName = mappedName.includes('-outline') ? mappedName : `${mappedName}-outline`;
  
  return <Ionicons name={finalName as any} size={size} color={color} />;
};

// Add priority colors for visual indication
const PRIORITY_COLORS: Record<string, string> = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#10b981',
};

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

export default function Home() {
  const router = useRouter();
  const [localHabits, setLocalHabits] = useState(getHabits());
  const [isMeditationModalVisible, setIsMeditationModalVisible] = useState(false);
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [days, setDays] = useState(getDaysArray());
  const { user } = useUser();
  
  // Log user ID for debugging
  useEffect(() => {
    if (user) {
      console.log("Current user ID:", user.id);
    }
  }, [user]);
  
  const { data: habits, loading } = useFetch<any[]>(
    user ? `/(api)/habit/habit?userId=${user.id}` : ''
  );

  // Add a function to get the appropriate greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

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
    // Use API habits if available, otherwise fall back to local habits
    const habitsToUse = habits || localHabits;
    
    const total = habitsToUse?.length || 0;
    const completed = habitsToUse?.filter(h => h.completed)?.length || 0;
    const daily = habitsToUse?.filter(h => h.interval === 'Every day' || h.frequency === 'daily')?.length || 0;
    const weekday = habitsToUse?.filter(h => h.interval === 'Weekdays' || h.frequency === 'weekdays')?.length || 0;
    const weekend = habitsToUse?.filter(h => h.interval === 'Weekends' || h.frequency === 'weekends')?.length || 0;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    return {
      total,
      completed,
      daily,
      weekday,
      weekend,
      completionRate: Math.round(completionRate),
    };
  }, [habits, localHabits]);

  const handleHabitPress = (habit: Habit) => {
    router.push(`/habit/${habit.id}`);
  };


  // Add sorting by priority
  const sortedHabits = useMemo(() => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return [...localHabits].sort((a, b) => 
      priorityOrder[a.priority] - priorityOrder[b.priority]
    );
  }, [localHabits]);

  // Update the day selection handler
  const handleDaySelect = (day: any, index: number) => {
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

          <View style={styles.habitsContainer}>
            <Text style={styles.sectionTitle}>Your Habits</Text>
            
            {loading ? (
              <Text style={styles.loadingText}>Loading habits...</Text>
            ) : (habits && habits.length > 0) ? (
              <ScrollView style={styles.habitsList}>
                {(habits || []).map((habit) => (
                  <Pressable
                    key={habit.id}
                    style={[styles.habitCard, { backgroundColor: habit.color }]}
                    onPress={() => handleHabitPress(habit)}>
                    <View style={styles.habitContent}>
                    {renderIcon(habit.icon, '#000')}
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
              </ScrollView>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No habits yet. Add your first habit!</Text>
              </View>
            )}
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
  todayText: {
    color: '#fff',
  },
  habitsContainer: {
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
    gap: 12,
  },
});
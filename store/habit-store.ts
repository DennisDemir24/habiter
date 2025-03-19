import { create } from 'zustand';
import { fetchAPI } from '@/lib/fetch';
import { Habit } from '@/lib/global-state';

interface HabitState {
  habits: Habit[];
  isLoading: boolean;
  error: string | null;
  
  // Derived statistics
  activeHabits: number;
  completionRate: number;
  streak: number;
  
  // Actions
  fetchHabits: (userId: string) => Promise<void>;
  toggleHabitComplete: (habitId: number) => Promise<void>;
  addHabit: (habit: Omit<Habit, 'id'>, userId: string) => Promise<void>;
  updateHabit: (habitId: number, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (habitId: number, userId: string) => Promise<void>;
}

export const useHabitStore = create<HabitState>((set, get) => ({
  habits: [],
  isLoading: false,
  error: null,
  activeHabits: 0,
  completionRate: 0,
  streak: 0,
  
  fetchHabits: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const data = await fetchAPI(`/(api)/habit/habit?userId=${userId}`);
      const fetchedHabits = data.data || [];
      
      // Transform the habits to match the Habit interface if needed
      const transformedHabits: Habit[] = fetchedHabits.map((habit: any) => ({
        id: habit.id,
        title: habit.title,
        description: habit.description,
        color: habit.color,
        icon: habit.icon,
        completed: habit.completed,
        interval: habit.interval || habit.frequency,
        priority: habit.priority,
      }));
      
      // Calculate statistics
      const total = transformedHabits.length || 0;
      const completed = transformedHabits.filter(h => h.completed).length || 0;
      const active = total - completed;
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      set({ 
        habits: transformedHabits, 
        isLoading: false,
        activeHabits: active,
        completionRate,
        // For now, streak remains 0 until we implement streak calculation
        streak: 0
      });
    } catch (error) {
      console.error('Error fetching habits:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch habits', 
        isLoading: false 
      });
    }
  },
  
  toggleHabitComplete: async (habitId: number) => {
    try {
      const { habits } = get();
      const habit = habits.find(h => h.id === habitId);
      
      if (!habit) {
        throw new Error('Habit not found');
      }
      
      // Update locally first for immediate feedback
      const updatedHabits = habits.map(h =>
        h.id === habitId ? { ...h, completed: !h.completed } : h
      );
      
      // Calculate new stats
      const total = updatedHabits.length || 0;
      const completed = updatedHabits.filter(h => h.completed).length || 0;
      const active = total - completed;
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      set({ 
        habits: updatedHabits,
        activeHabits: active,
        completionRate
      });
      
      // Then update in the database
      const updateUrl = `/(api)/habit/update/${habitId}`;
      
      await fetchAPI(updateUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completed: !habit.completed,
        }),
      });
    } catch (error) {
      console.error('Error toggling habit completion:', error);
      
      // If there's an error, revert to the original state by re-fetching
      const { fetchHabits } = get();
      // We need the userId, but we don't have it directly in the store
      // We could store the userId in the store, or pass it from the component
      // For now, we'll leave this commented out
      // fetchHabits(userId);
      
      set({ 
        error: error instanceof Error ? error.message : 'Failed to toggle habit completion'
      });
    }
  },
  
  addHabit: async (habitData: Omit<Habit, 'id'>, userId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const data = await fetchAPI('/(api)/habit/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: habitData.title,
          description: habitData.description,
          color: habitData.color,
          icon: habitData.icon,
          completed: habitData.completed,
          frequency: habitData.interval,
          interval: habitData.interval,
          priority: habitData.priority,
          created_at: new Date().toISOString(),
          user_id: userId
        }),
      });
      
      const newHabit: Habit = {
        id: data.data.id,
        title: data.data.title,
        description: data.data.description,
        color: data.data.color,
        icon: data.data.icon,
        completed: data.data.completed,
        interval: data.data.interval || data.data.frequency,
        priority: data.data.priority,
      };
      
      const { habits } = get();
      const updatedHabits = [...habits, newHabit];
      
      // Calculate new stats
      const total = updatedHabits.length || 0;
      const completed = updatedHabits.filter(h => h.completed).length || 0;
      const active = total - completed;
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      set({ 
        habits: updatedHabits, 
        isLoading: false,
        activeHabits: active,
        completionRate
      });
    } catch (error) {
      console.error('Error adding habit:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add habit', 
        isLoading: false 
      });
    }
  },
  
  updateHabit: async (habitId: number, updates: Partial<Habit>) => {
    try {
      const { habits } = get();
      
      // Update locally first for immediate feedback
      const updatedHabits = habits.map(h =>
        h.id === habitId ? { ...h, ...updates } : h
      );
      
      // Calculate new stats if completion status changed
      if ('completed' in updates) {
        const total = updatedHabits.length || 0;
        const completed = updatedHabits.filter(h => h.completed).length || 0;
        const active = total - completed;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        set({ 
          habits: updatedHabits,
          activeHabits: active,
          completionRate
        });
      } else {
        set({ habits: updatedHabits });
      }
      
      // Then update in the database
      const updateUrl = `/(api)/habit/update/${habitId}`;
      
      await fetchAPI(updateUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
    } catch (error) {
      console.error('Error updating habit:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update habit'
      });
      
      // If there's an error, revert to the original state by re-fetching
      const { fetchHabits } = get();
      // fetchHabits(userId);
    }
  },
  
  deleteHabit: async (habitId: number, userId: string) => {
    try {
      const { habits } = get();
      
      // Update locally first for immediate feedback
      const updatedHabits = habits.filter(h => h.id !== habitId);
      
      // Calculate new stats
      const total = updatedHabits.length || 0;
      const completed = updatedHabits.filter(h => h.completed).length || 0;
      const active = total - completed;
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      set({ 
        habits: updatedHabits,
        activeHabits: active,
        completionRate
      });
      
      // Then delete from the database
      const deleteUrl = `/(api)/habit/habit?habitId=${habitId}&userId=${userId}`;
      
      await fetchAPI(deleteUrl, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting habit:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete habit'
      });
      
      // If there's an error, revert to the original state by re-fetching
      const { fetchHabits } = get();
      // fetchHabits(userId);
    }
  },
})); 
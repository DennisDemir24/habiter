import { Text, View, Pressable } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { type Habit } from '@/lib/global-state';
import { haptics } from "@/utils/haptics";

// Priority colors for visual indication
const PRIORITY_COLORS: Record<string, string> = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#10b981',
};

// Helper function to render the icon
const renderIcon = (iconName: string | null | undefined, color: string = '#000', size: number = 24) => {
  // Default to a star icon if none provided
  const name = iconName || 'star';
  
  // Add '-outline' suffix if not already present to use outline style
  const finalName = name.includes('-outline') ? name : `${name}-outline`;
  
  return <Ionicons name={finalName as any} size={size} color={color} />;
};

interface HabitCardProps {
  habit: Habit;
  onPress: (habit: Habit) => void;
  onToggleComplete: (habit: Habit, e: any) => void;
}

const HabitCard = ({ habit, onPress, onToggleComplete }: HabitCardProps) => {

  // Add a wrapper function to include haptic feedback
  const handleToggleComplete = (habit: Habit, e: any) => {
    // Trigger haptic feedback (success when completing, medium when uncompleting)
    if (!habit.completed) {
        haptics.success();
    } else {
        haptics.medium();
    }
    
    // Call the original toggle function
    onToggleComplete(habit, e);
};

    return (
        <Pressable
        key={habit.id}
        className="flex-row justify-between items-center p-5 rounded-2xl mb-2.5"
        style={{ backgroundColor: habit.color }}
        onPress={() => {
            haptics.light(); // Light feedback when pressing the habit card
            onPress(habit);
        }}>
          <View className="flex-row items-center">
            {renderIcon(habit.icon, '#000')}
            <View className="ml-4">
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-lg font-bold">{habit.title}</Text>
                <View 
                  className="w-2 h-2 rounded-full ml-2"
                  style={{ backgroundColor: PRIORITY_COLORS[habit.priority] }} 
                />
              </View>
              <Text className="text-sm text-gray-600 mt-1">{habit.description}</Text>
            </View>
          </View>
          <Pressable 
            onPress={(e) => handleToggleComplete(habit, e)}
            className={`w-6 h-6 rounded-full border-2 border-black justify-center items-center ${habit.completed ? 'bg-white' : ''}`}>
            {habit.completed && <Ionicons name="checkmark" size={18} color="#22c55e" />}
          </Pressable>
        </Pressable>
    );
};

export default HabitCard;
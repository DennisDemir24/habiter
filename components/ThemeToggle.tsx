import { View, Text, Switch, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme-context';

const ThemeToggle = () => {
  const { isDark, toggleTheme, theme, setTheme } = useTheme();
  
  return (
    <View className="mt-4">
      <Text className="text-lg font-bold mb-2" style={{ color: isDark ? '#FFFFFF' : '#000000' }}>
        Appearance
      </Text>
      
      <View className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4">
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <Ionicons 
              name={isDark ? "moon" : "sunny"} 
              size={24} 
              color={isDark ? "#FBBF24" : "#F59E0B"} 
            />
            <Text 
              className="ml-2 text-base" 
              style={{ color: isDark ? '#FFFFFF' : '#000000' }}
            >
              Dark Mode
            </Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: '#767577', true: '#6366f1' }}
            thumbColor={isDark ? '#FFFFFF' : '#f4f3f4'}
          />
        </View>
        
        <View className="mt-4 flex-row justify-between">
          <Pressable
            className={`flex-1 p-2 rounded-lg mr-2 items-center ${theme === 'light' ? 'bg-indigo-100' : 'bg-gray-200 dark:bg-gray-700'}`}
            onPress={() => setTheme('light')}
          >
            <Text style={{ color: theme === 'light' ? '#6366f1' : isDark ? '#FFFFFF' : '#000000' }}>
              Light
            </Text>
          </Pressable>
          
          <Pressable
            className={`flex-1 p-2 rounded-lg mr-2 items-center ${theme === 'dark' ? 'bg-indigo-100' : 'bg-gray-200 dark:bg-gray-700'}`}
            onPress={() => setTheme('dark')}
          >
            <Text style={{ color: theme === 'dark' ? '#6366f1' : isDark ? '#FFFFFF' : '#000000' }}>
              Dark
            </Text>
          </Pressable>
          
          <Pressable
            className={`flex-1 p-2 rounded-lg items-center ${theme === 'system' ? 'bg-indigo-100' : 'bg-gray-200 dark:bg-gray-700'}`}
            onPress={() => setTheme('system')}
          >
            <Text style={{ color: theme === 'system' ? '#6366f1' : isDark ? '#FFFFFF' : '#000000' }}>
              System
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

export default ThemeToggle;
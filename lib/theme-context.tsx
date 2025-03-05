import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define theme types
export type ThemeType = 'light' | 'dark' | 'system';

// Define theme colors for light and dark modes
export const lightTheme = {
  background: '#FFFFFF',
  card: '#F9FAFB',
  text: '#000000',
  secondaryText: '#666666',
  border: '#E5E7EB',
  primary: '#6366f1',
  secondary: '#4F46E5',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  checkbox: '#FFFFFF',
  tabBar: '#FFFFFF',
  tabBarBorder: '#F0F0F0',
};

export const darkTheme = {
  background: '#121212',
  card: '#1E1E1E',
  text: '#FFFFFF',
  secondaryText: '#A3A3A3',
  border: '#2C2C2C',
  primary: '#818CF8',
  secondary: '#6366F1',
  success: '#34D399',
  danger: '#F87171',
  warning: '#FBBF24',
  checkbox: '#2C2C2C',
  tabBar: '#1E1E1E',
  tabBarBorder: '#2C2C2C',
};

// Create the context with default values
type ThemeContextType = {
  theme: ThemeType;
  colors: typeof lightTheme;
  isDark: boolean;
  setTheme: (theme: ThemeType) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  colors: lightTheme,
  isDark: false,
  setTheme: () => {},
  toggleTheme: () => {},
});

// Create a provider component
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<ThemeType>('system');
  
  // Load saved theme preference from AsyncStorage on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme');
        if (savedTheme) {
          setThemeState(savedTheme as ThemeType);
        }
      } catch (error) {
        console.error('Failed to load theme preference:', error);
      }
    };
    
    loadTheme();
  }, []);
  
  // Save theme preference to AsyncStorage when it changes
  const setTheme = async (newTheme: ThemeType) => {
    try {
      await AsyncStorage.setItem('theme', newTheme);
      setThemeState(newTheme);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };
  
  // Toggle between light and dark themes
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };
  
  // Determine if we should use dark mode
  const isDark = 
    theme === 'dark' || 
    (theme === 'system' && systemColorScheme === 'dark');
  
  // Get the appropriate color scheme
  const colors = isDark ? darkTheme : lightTheme;
  
  return (
    <ThemeContext.Provider 
      value={{ 
        theme, 
        colors, 
        isDark, 
        setTheme, 
        toggleTheme 
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// Create a hook for easy access to the theme context
export const useTheme = () => useContext(ThemeContext);
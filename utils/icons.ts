// Define a list of valid Ionicons names
export const VALID_ICONS = [
    'star',
    'heart',
    'fitness',
    'water',
    'book',
    'bed',
    'walk',
    'bicycle',
    'meditate',
    'restaurant',
    'sunny',
    'moon',
    'calendar',
    'checkmark-circle',
    'time',
    'trophy',
    'happy',
    'leaf',
    'musical-notes',
    'barbell'
  ];
  
  // Map these to actual Ionicons names if needed
  export const ICON_MAP: Record<string, string> = {
    'meditate': 'body-outline',
    'fitness': 'fitness-outline',
    'water': 'water-outline',
    // Add more mappings as needed
  };
  
  // Helper function to get the correct icon name
  export const getIconName = (name: string): string => {
    return ICON_MAP[name] || name;
  };
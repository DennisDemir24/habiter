import * as Haptics from 'expo-haptics';

// Define different haptic feedback types for various interactions
export const haptics = {
  // Light feedback for subtle interactions (like button presses)
  light: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  
  // Medium feedback for more significant interactions
  medium: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  
  // Heavy feedback for major interactions
  heavy: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
  
  // Success feedback (e.g., when completing a habit)
  success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  
  // Warning feedback
  warning: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
  
  // Error feedback
  error: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
  
  // Selection feedback (e.g., when selecting an item from a list)
  selection: () => Haptics.selectionAsync(),
};
import { View, Text } from "react-native";
import { getStreakEmoji } from "@/lib/streak-tracker";

interface StreakBadgeProps {
  /**
   * Current streak count
   */
  streak: number;
  /**
   * Optional label (e.g., "day streak", "days")
   */
  label?: string;
  /**
   * Size variant
   */
  size?: "small" | "medium" | "large";
}

/**
 * Display streak counter with fire emoji
 * 
 * Usage:
 * ```tsx
 * <StreakBadge streak={7} label="day streak" />
 * ```
 */
export function StreakBadge({ streak, label = "day streak", size = "medium" }: StreakBadgeProps) {
  const emoji = getStreakEmoji(streak);
  
  const sizeClasses = {
    small: "text-sm",
    medium: "text-base",
    large: "text-xl",
  };
  
  const emojiSizeClasses = {
    small: "text-base",
    medium: "text-xl",
    large: "text-3xl",
  };
  
  if (streak === 0) {
    return null; // Don't show if no streak
  }
  
  return (
    <View className="flex-row items-center gap-1">
      <Text className={emojiSizeClasses[size]}>{emoji}</Text>
      <Text className={`font-semibold text-foreground ${sizeClasses[size]}`}>
        {streak} {label}
      </Text>
    </View>
  );
}

/**
 * Compact streak display (just emoji + number)
 */
export function StreakCompact({ streak }: { streak: number }) {
  if (streak === 0) return null;
  
  const emoji = getStreakEmoji(streak);
  
  return (
    <View className="flex-row items-center gap-1 bg-surface px-2 py-1 rounded-full">
      <Text className="text-base">{emoji}</Text>
      <Text className="text-sm font-bold text-foreground">{streak}</Text>
    </View>
  );
}

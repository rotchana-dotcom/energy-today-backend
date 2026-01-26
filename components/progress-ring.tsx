import { View, Text } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { useColors } from "@/hooks/use-colors";

interface ProgressRingProps {
  /**
   * Progress value between 0 and 1 (e.g., 0.75 for 75%)
   */
  progress: number;
  /**
   * Size of the ring in pixels
   */
  size?: number;
  /**
   * Thickness of the ring stroke
   */
  strokeWidth?: number;
  /**
   * Label to display in the center
   */
  label?: string;
  /**
   * Value to display in the center (e.g., "78%")
   */
  value?: string;
  /**
   * Color of the progress ring
   */
  color?: string;
}

/**
 * Circular progress ring component (Apple Watch style)
 * 
 * Usage:
 * ```tsx
 * <ProgressRing 
 *   progress={0.78} 
 *   label="Energy"
 *   value="78%"
 *   color="#10b981"
 * />
 * ```
 */
export function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 12,
  label,
  value,
  color,
}: ProgressRingProps) {
  const colors = useColors();
  
  // Ensure progress is between 0 and 1
  const normalizedProgress = Math.max(0, Math.min(1, progress));
  
  // Calculate circle properties
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - normalizedProgress * circumference;
  
  // Determine color based on progress if not provided
  const ringColor = color || getColorForProgress(normalizedProgress, colors);
  
  return (
    <View className="items-center justify-center" style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.border}
          strokeWidth={strokeWidth}
          fill="none"
          opacity={0.3}
        />
        
        {/* Progress circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={ringColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      
      {/* Center content */}
      <View className="absolute items-center justify-center">
        {value && (
          <Text className="text-2xl font-bold text-foreground">
            {value}
          </Text>
        )}
        {label && (
          <Text className="text-xs text-muted mt-1">
            {label}
          </Text>
        )}
      </View>
    </View>
  );
}

/**
 * Get color based on progress percentage
 */
function getColorForProgress(progress: number, colors: any): string {
  if (progress >= 0.8) {
    return colors.success; // Green: 80-100%
  } else if (progress >= 0.6) {
    return colors.warning; // Orange: 60-79%
  } else {
    return colors.error; // Red: 0-59%
  }
}

/**
 * Multiple progress rings stacked (like Apple Watch)
 */
interface MultiRingProps {
  rings: {
    progress: number;
    label: string;
    value: string;
    color?: string;
  }[];
  size?: number;
}

export function MultiProgressRings({ rings, size = 200 }: MultiRingProps) {
  const strokeWidth = 12;
  const gap = 8;
  
  return (
    <View className="items-center justify-center relative" style={{ width: size, height: size }}>
      {rings.map((ring, index) => {
        const ringSize = size - (index * (strokeWidth + gap) * 2);
        const offset = (index * (strokeWidth + gap));
        
        return (
          <View
            key={index}
            className="absolute"
            style={{
              top: offset,
              left: offset,
            }}
          >
            <ProgressRing
              progress={ring.progress}
              size={ringSize}
              strokeWidth={strokeWidth}
              color={ring.color}
            />
          </View>
        );
      })}
      
      {/* Center labels */}
      <View className="absolute items-center justify-center">
        <Text className="text-3xl font-bold text-foreground">
          {rings[0]?.value || "0%"}
        </Text>
        <Text className="text-sm text-muted mt-1">
          {rings[0]?.label || "Progress"}
        </Text>
      </View>
    </View>
  );
}

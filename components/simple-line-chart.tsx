import { View, Text } from "react-native";
import { useColors } from "@/hooks/use-colors";
import Svg, { Line, Circle, Polyline, Text as SvgText } from "react-native-svg";

interface DataPoint {
  label: string; // e.g., "Mon", "Jan 20"
  value: number;
}

interface SimpleLineChartProps {
  data: DataPoint[];
  height?: number;
  color?: string;
  showDots?: boolean;
  yAxisLabel?: string;
  maxValue?: number; // Optional max value for Y axis
}

/**
 * Simple line chart component for displaying trends
 * Uses react-native-svg for cross-platform rendering
 */
export function SimpleLineChart({
  data,
  height = 200,
  color,
  showDots = true,
  yAxisLabel,
  maxValue,
}: SimpleLineChartProps) {
  const colors = useColors();
  const lineColor = color || colors.primary;

  if (data.length === 0) {
    return (
      <View style={{ height, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: colors.muted }}>No data to display</Text>
      </View>
    );
  }

  // Calculate chart dimensions
  const padding = 40;
  const chartWidth = 300;
  const chartHeight = height - padding * 2;

  // Find min and max values
  const values = data.map((d) => d.value);
  const minValue = Math.min(...values, 0);
  const maxVal = maxValue || Math.max(...values);
  const valueRange = maxVal - minValue || 1;

  // Calculate points
  const points = data.map((point, index) => {
    const x = padding + (index / (data.length - 1 || 1)) * chartWidth;
    const y = padding + chartHeight - ((point.value - minValue) / valueRange) * chartHeight;
    return { x, y, value: point.value, label: point.label };
  });

  // Create polyline points string
  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <View>
      <Svg width={chartWidth + padding * 2} height={height}>
        {/* Y-axis label */}
        {yAxisLabel && (
          <SvgText
            x={10}
            y={padding - 10}
            fill={colors.muted}
            fontSize="12"
            fontWeight="600"
          >
            {yAxisLabel}
          </SvgText>
        )}

        {/* Y-axis */}
        <Line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={padding + chartHeight}
          stroke={colors.border}
          strokeWidth="2"
        />

        {/* X-axis */}
        <Line
          x1={padding}
          y1={padding + chartHeight}
          x2={padding + chartWidth}
          y2={padding + chartHeight}
          stroke={colors.border}
          strokeWidth="2"
        />

        {/* Line */}
        <Polyline
          points={polylinePoints}
          fill="none"
          stroke={lineColor}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {showDots &&
          points.map((point, index) => (
            <Circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="5"
              fill={lineColor}
              stroke={colors.background}
              strokeWidth="2"
            />
          ))}

        {/* X-axis labels */}
        {points.map((point, index) => {
          // Show every other label to avoid crowding
          if (data.length > 7 && index % 2 !== 0) return null;
          
          return (
            <SvgText
              key={`label-${index}`}
              x={point.x}
              y={padding + chartHeight + 20}
              fill={colors.muted}
              fontSize="10"
              textAnchor="middle"
            >
              {point.label}
            </SvgText>
          );
        })}

        {/* Y-axis labels (min, mid, max) */}
        <SvgText
          x={padding - 10}
          y={padding + 5}
          fill={colors.muted}
          fontSize="10"
          textAnchor="end"
        >
          {Math.round(maxVal)}
        </SvgText>
        <SvgText
          x={padding - 10}
          y={padding + chartHeight / 2 + 5}
          fill={colors.muted}
          fontSize="10"
          textAnchor="end"
        >
          {Math.round((maxVal + minValue) / 2)}
        </SvgText>
        <SvgText
          x={padding - 10}
          y={padding + chartHeight + 5}
          fill={colors.muted}
          fontSize="10"
          textAnchor="end"
        >
          {Math.round(minValue)}
        </SvgText>
      </Svg>
    </View>
  );
}

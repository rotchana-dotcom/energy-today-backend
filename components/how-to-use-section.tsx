import { useState } from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";

export interface HowToUseItem {
  icon: string;
  title: string;
  description: string;
}

interface HowToUseSectionProps {
  items: HowToUseItem[];
}

/**
 * Collapsible "How to Use" section
 * Shows helpful instructions that users can expand/collapse
 */
export function HowToUseSection({ items }: HowToUseSectionProps) {
  const colors = useColors();
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setExpanded(!expanded);
  };

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <TouchableOpacity
        onPress={toggleExpanded}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 16,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={{ fontSize: 18 }}>❓</Text>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: colors.foreground,
            }}
          >
            How to Use
          </Text>
        </View>
        <Text
          style={{
            fontSize: 18,
            color: colors.muted,
          }}
        >
          {expanded ? "▲" : "▼"}
        </Text>
      </TouchableOpacity>

      {/* Content */}
      {expanded && (
        <View
          style={{
            paddingHorizontal: 16,
            paddingBottom: 16,
            gap: 16,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            paddingTop: 16,
          }}
        >
          {items.map((item, index) => (
            <View key={index} style={{ flexDirection: "row", gap: 12 }}>
              <Text style={{ fontSize: 20, marginTop: 2 }}>{item.icon}</Text>
              <View style={{ flex: 1, gap: 4 }}>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "600",
                    color: colors.foreground,
                  }}
                >
                  {item.title}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: colors.muted,
                    lineHeight: 20,
                  }}
                >
                  {item.description}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

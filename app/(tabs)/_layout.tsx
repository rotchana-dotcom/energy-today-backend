import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  const tabBarHeight = 56 + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          paddingTop: 8,
          paddingBottom: bottomPadding,
          height: tabBarHeight,
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Today",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: "AI Insights",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="sparkles" color={color} />,
        }}
      />
      <Tabs.Screen
        name="business"
        options={{
          title: "Business",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="briefcase.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="health"
        options={{
          title: "Health",
          tabBarIcon: ({ color}) => <IconSymbol size={28} name="heart.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: "Progress",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="chart.bar.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "More",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="ellipsis.circle.fill" color={color} />,
        }}
      />
      {/* Hide other screens from tab bar */}
      <Tabs.Screen name="calendar" options={{ href: null }} />
      <Tabs.Screen name="community" options={{ href: null }} />
      <Tabs.Screen name="log" options={{ href: null }} />
      <Tabs.Screen name="track" options={{ href: null }} />
      {/* Hide health sub-screens from tab bar */}
      <Tabs.Screen name="health/chi" options={{ href: null }} />
      <Tabs.Screen name="health/coach" options={{ href: null }} />
      <Tabs.Screen name="health/diet" options={{ href: null }} />
      <Tabs.Screen name="health/meditation" options={{ href: null }} />
      <Tabs.Screen name="health/sleep" options={{ href: null }} />
    </Tabs>
  );
}

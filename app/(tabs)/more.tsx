import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

interface FeatureItem {
  title: string;
  description: string;
  icon: string;
  route: string;
}

interface FeatureCategory {
  title: string;
  items: FeatureItem[];
}

const FEATURES: FeatureCategory[] = [
  {
    title: "Daily Tracking",
    items: [
      {
        title: "Sleep Tracker",
        description: "Track sleep quality and patterns",
        icon: "🛏️",
        route: "/sleep-tracker",
      },
      {
        title: "Meditation Timer",
        description: "Guided meditation sessions",
        icon: "🧘",
        route: "/meditation-timer",
      },
      {
        title: "Nutrition Tracker",
        description: "Log meals and track nutrition",
        icon: "🍎",
        route: "/nutrition-tracker",
      },
      {
        title: "Workout Tracking",
        description: "Log exercise and fitness",
        icon: "💪",
        route: "/workout-tracking",
      },
      {
        title: "Results Tracking",
        description: "Log business outcomes",
        icon: "📊",
        route: "/results-tracking",
      },
      {
        title: "Biometric Sync",
        description: "Connect health devices",
        icon: "❤️",
        route: "/biometric-sync",
      },
    ],
  },
  {
    title: "Business & Timing",
    items: [
      {
        title: "Energy Forecast",
        description: "7-day energy predictions",
        icon: "📅",
        route: "/energy-forecast",
      },
      {
        title: "Business Timing",
        description: "Optimal timing for decisions",
        icon: "💼",
        route: "/business-timing",
      },
      {
        title: "Task Scheduler",
        description: "Schedule tasks optimally",
        icon: "✅",
        route: "/task-scheduler",
      },
      {
        title: "Focus Mode",
        description: "Deep work sessions",
        icon: "🎯",
        route: "/focus-mode",
      },
      {
        title: "Calendar Sync",
        description: "Sync with your calendar",
        icon: "📆",
        route: "/calendar-sync",
      },
    ],
  },
  {
    title: "Analysis & Reports",
    items: [
      {
        title: "Analytics Dashboard",
        description: "Interactive charts & graphs",
        icon: "📈",
        route: "/analytics-dashboard",
      },
      {
        title: "Pattern Analysis",
        description: "Discover your patterns",
        icon: "📊",
        route: "/pattern-analysis",
      },
      {
        title: "Trends",
        description: "Long-term energy trends",
        icon: "📈",
        route: "/trends",
      },
      {
        title: "Weekly Plan",
        description: "Plan your week ahead",
        icon: "📋",
        route: "/weekly-plan",
      },
      {
        title: "Reports",
        description: "Generate detailed reports",
        icon: "📄",
        route: "/reports",
      },
      {
        title: "Coaching",
        description: "Personalized coaching",
        icon: "🎓",
        route: "/coaching",
      },
    ],
  },
  {
    title: "Social & Team",
    items: [
      {
        title: "Interactions Calendar",
        description: "View interactions by date",
        icon: "📅",
        route: "/interactions-calendar",
      },
      {
        title: "Team Sync",
        description: "Optimize team meetings",
        icon: "👥",
        route: "/team-sync",
      },
      {
        title: "Social Energy",
        description: "Track social interactions",
        icon: "🤝",
        route: "/social-energy",
      },
      {
        title: "Energy Circles",
        description: "Share with your circle",
        icon: "⭕",
        route: "/energy-circles",
      },
    ],
  },
  {
    title: "Settings & More",
    items: [
      {
        title: "Customize Layout",
        description: "Reorder sections (1, 2, 3...)",
        icon: "🏛️",
        route: "/customize-layout",
      },
      {
        title: "Settings",
        description: "App preferences",
        icon: "⚙️",
        route: "/settings",
      },
      {
        title: "Notifications",
        description: "Manage notifications",
        icon: "🔔",
        route: "/notifications",
      },
      {
        title: "Data Export",
        description: "Export your data",
        icon: "📤",
        route: "/data-export",
      },
      {
        title: "Weather Insights",
        description: "Weather impact analysis",
        icon: "🌤️",
        route: "/weather-insights",
      },
      {
        title: "Location Insights",
        description: "Energy by location",
        icon: "📍",
        route: "/location-insights",
      },
    ],
  },
];

export default function MoreScreen() {
  const colors = useColors();

  const handleFeaturePress = (route: string) => {
    router.push(route as any);
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Header */}
        <View className="px-6 py-6">
          <Text className="text-3xl font-bold text-foreground">More</Text>
          <Text className="text-base text-muted mt-1">
            Access all features and settings
          </Text>
        </View>

        {/* Feature Categories */}
        {FEATURES.map((category, categoryIndex) => (
          <View key={categoryIndex} className="mb-6">
            {/* Category Title */}
            <View className="px-6 py-2">
              <Text className="text-sm font-semibold text-muted uppercase tracking-wide">
                {category.title}
              </Text>
            </View>

            {/* Category Items */}
            <View className="bg-surface mx-4 rounded-2xl overflow-hidden">
              {category.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  onPress={() => handleFeaturePress(item.route)}
                  className="flex-row items-center px-4 py-4 active:opacity-70"
                  style={{
                    borderBottomWidth: itemIndex < category.items.length - 1 ? 0.5 : 0,
                    borderBottomColor: colors.border,
                  }}
                >
                  {/* Icon */}
                  <View className="w-10 h-10 items-center justify-center mr-3">
                    <Text className="text-2xl">{item.icon}</Text>
                  </View>

                  {/* Content */}
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-foreground">
                      {item.title}
                    </Text>
                    <Text className="text-sm text-muted mt-0.5">
                      {item.description}
                    </Text>
                  </View>

                  {/* Chevron */}
                  <Text className="text-muted text-lg">›</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}

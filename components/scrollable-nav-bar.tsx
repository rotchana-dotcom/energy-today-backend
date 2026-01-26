import { useState, useEffect } from "react";
import { FlatList, TouchableOpacity, Text, View, Platform, Alert } from "react-native";
import { router, usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { isProUser } from "@/lib/storage";

export interface NavButton {
  id: string;
  label: string;
  icon: string;
  route: string;
  isPro?: boolean; // Mark Pro features
}

const DEFAULT_NAV_BUTTONS: NavButton[] = [
  // ===== FREE FEATURES =====
  // Core Features
  { id: "home", label: "Home", icon: "🏠", route: "/(tabs)" },
  { id: "journal", label: "Journal", icon: "📝", route: "/(tabs)/log" },
  { id: "calendar", label: "Calendar", icon: "📅", route: "/(tabs)/calendar" },
  
  // Basic Wellness
  { id: "sleep", label: "Sleep", icon: "🌙", route: "/sleep-tracker" },
  { id: "habits", label: "Habits", icon: "✅", route: "/habits" },
  { id: "goals", label: "Goals", icon: "🎯", route: "/goals" },
  
  // Basic Planning
  { id: "weekly", label: "Weekly", icon: "📆", route: "/weekly-plan" },
  { id: "history", label: "History", icon: "📜", route: "/history" },
  { id: "trends", label: "Trends", icon: "📈", route: "/trends" },
  
  // Basic Insights
  { id: "insights", label: "Insights", icon: "💡", route: "/insights" },
  { id: "forecast", label: "Forecast", icon: "🔮", route: "/forecast" },
  { id: "numerology", label: "Numbers", icon: "🔢", route: "/numerology" },
  
  // Settings & Help
  { id: "settings", label: "Settings", icon: "⚙️", route: "/settings" },
  { id: "guide", label: "Guide", icon: "📖", route: "/guide" },
  { id: "upgrade", label: "Upgrade", icon: "⭐", route: "/upgrade" },
  
  // ===== PRO FEATURES =====
  // Wellness & Health (Pro)
  { id: "meditation", label: "Meditate 👑", icon: "🧘‍♂️", route: "/meditation-timer", isPro: true },
  { id: "fitness", label: "Fitness 👑", icon: "💪", route: "/workout-tracking", isPro: true },
  { id: "nutrition", label: "Nutrition 👑", icon: "🥗", route: "/nutrition-tracker", isPro: true },
  { id: "nutrition-insights", label: "Food+ 👑", icon: "🍎", route: "/nutrition-insights", isPro: true },
  { id: "meal-photo", label: "Meal Pic 👑", icon: "📸", route: "/meal-photo", isPro: true },
  { id: "biometric", label: "Vitals 👑", icon: "❤️", route: "/biometric-sync", isPro: true },
  { id: "biometric-insights", label: "Health+ 👑", icon: "🩺", route: "/biometric-insights", isPro: true },
  { id: "sleep-insights", label: "Sleep+ 👑", icon: "💤", route: "/sleep-insights", isPro: true },
  
  // Advanced Habits & Goals (Pro)
  { id: "habit-builder", label: "Build 👑", icon: "🔨", route: "/habit-builder", isPro: true },
  { id: "recurring", label: "Routine 👑", icon: "🔄", route: "/recurring", isPro: true },
  { id: "streak", label: "Streaks 👑", icon: "🔥", route: "/streak-recovery", isPro: true },
  { id: "badges", label: "Badges 👑", icon: "🏆", route: "/badges", isPro: true },
  
  // Business & Productivity (Pro)
  { id: "business", label: "Business 👑", icon: "💼", route: "/business", isPro: true },
  { id: "productivity", label: "Productivity 👑", icon: "⚡", route: "/productivity-dashboard", isPro: true },
  { id: "task-scheduler", label: "Tasks 👑", icon: "📋", route: "/task-scheduler", isPro: true },
  { id: "focus", label: "Focus 👑", icon: "🎯", route: "/focus-mode", isPro: true },
  
  // Advanced Planning & Analysis (Pro)
  { id: "energy-forecast", label: "Energy+ 👑", icon: "⚡", route: "/energy-forecast", isPro: true },
  { id: "timeline", label: "Timeline 👑", icon: "⏱️", route: "/energy-timeline", isPro: true },
  
  // AI & Insights (Pro)
  { id: "ai-insights", label: "AI 👑", icon: "🤖", route: "/ai-insights", isPro: true },
  { id: "coaching", label: "Coaching 👑", icon: "🎓", route: "/coaching", isPro: true },
  { id: "coaching-chat", label: "Chat 👑", icon: "💬", route: "/coaching-chatbot", isPro: true },
  { id: "location", label: "Location 👑", icon: "📍", route: "/location-insights", isPro: true },
  { id: "weather", label: "Weather 👑", icon: "🌤️", route: "/weather-insights", isPro: true },
  
  // Reports & Export (Pro)
  { id: "reports", label: "Reports 👑", icon: "📊", route: "/reports", isPro: true },
  { id: "report-history", label: "Archive 👑", icon: "📚", route: "/report-history", isPro: true },
  { id: "data-export", label: "Export 👑", icon: "💾", route: "/data-export", isPro: true },
  
  // Social & Team (Pro)
  { id: "social", label: "Social 👑", icon: "👥", route: "/energy-circles", isPro: true },
  { id: "social-energy", label: "Friends 👑", icon: "🤗", route: "/social-energy", isPro: true },
  { id: "social-compare", label: "Compare 👑", icon: "📊", route: "/social-comparison", isPro: true },
  { id: "team", label: "Team 👑", icon: "🤝", route: "/team-sync", isPro: true },
  { id: "team-members", label: "Members 👑", icon: "👨‍💼", route: "/team-members", isPro: true },
  { id: "challenges", label: "Challenge 👑", icon: "🏅", route: "/group-challenges", isPro: true },
  
  // Calendar & Scheduling (Pro)
  { id: "calendar-sync", label: "Cal Sync 👑", icon: "🔗", route: "/calendar-sync", isPro: true },
  { id: "calendar-integration", label: "Connect 👑", icon: "🔌", route: "/calendar-integration", isPro: true },
  
  // Voice & Templates (Pro)
  { id: "voice-journal", label: "Voice 👑", icon: "🎙️", route: "/voice-journal-enhanced", isPro: true },
  { id: "templates", label: "Templates 👑", icon: "📄", route: "/select-template", isPro: true },
  { id: "template-journal", label: "Journal+ 👑", icon: "✍️", route: "/template-journal", isPro: true },
  
  // Notifications & Reminders (Pro)
  { id: "notifications", label: "Alerts 👑", icon: "🔔", route: "/notification-settings", isPro: true },
  { id: "smart-notifications", label: "Smart 👑", icon: "🧠", route: "/smart-notifications-settings", isPro: true },
  { id: "reminders", label: "Reminders 👑", icon: "⏰", route: "/adaptive-reminders", isPro: true },
  
  // Account Management (Pro)
  { id: "appearance", label: "Theme 👑", icon: "🎨", route: "/appearance-settings", isPro: true },
  { id: "subscription", label: "Pro 👑", icon: "👑", route: "/manage-subscription", isPro: true },
  { id: "referral", label: "Refer 👑", icon: "🎁", route: "/referral", isPro: true },
];

const STORAGE_KEY = "@nav_button_order";
const TOOLTIP_KEY = "@nav_tooltip_shown";

// Separate component for each button to properly use hooks
function NavButtonItem({
  item,
  active,
  editMode,
  onPress,
  onLongPress,
}: {
  item: NavButton;
  active: boolean;
  editMode: boolean;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const wiggle = useSharedValue(0);

  useEffect(() => {
    if (editMode) {
      wiggle.value = withRepeat(
        withSequence(
          withTiming(-2, { duration: 100 }),
          withTiming(2, { duration: 100 })
        ),
        -1,
        true
      );
    } else {
      wiggle.value = withTiming(0);
    }
  }, [editMode]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${wiggle.value}deg` }],
  }));

  const longPressGesture = Gesture.LongPress()
    .minDuration(500)
    .onStart(() => {
      'worklet';
      runOnJS(onLongPress)();
    });

  return (
    <GestureDetector gesture={longPressGesture}>
      <Animated.View style={[animatedStyle]}>
        <TouchableOpacity
          onPress={onPress}
          disabled={editMode}
          className={`px-4 py-2.5 rounded-full flex-row items-center gap-2 mr-3 ${
            active ? "bg-primary" : "bg-surface border border-border"
          }`}
          style={{
            minWidth: 100,
            opacity: editMode ? 0.8 : 1,
          }}
        >
          <Text className="text-lg">{item.icon}</Text>
          <Text
            className={`text-sm font-medium ${
              active ? "text-white" : "text-foreground"
            }`}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </GestureDetector>
  );
}

export function ScrollableNavBar() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const [buttons, setButtons] = useState<NavButton[]>(DEFAULT_NAV_BUTTONS);
  const [editMode, setEditMode] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Auto-hide animation
  const translateY = useSharedValue(0);
  const [isVisible, setIsVisible] = useState(true);

  // Load saved button order and tooltip state
  useEffect(() => {
    loadButtonOrder();
    checkTooltip();
  }, []);

  const loadButtonOrder = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        const savedIds = JSON.parse(saved);
        const reordered = savedIds
          .map((id: string) => DEFAULT_NAV_BUTTONS.find((b) => b.id === id))
          .filter(Boolean);
        setButtons(reordered);
      }
    } catch (error) {
      console.error("Failed to load button order:", error);
    }
  };

  const saveButtonOrder = async (newOrder: NavButton[]) => {
    try {
      const ids = newOrder.map((b) => b.id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch (error) {
      console.error("Failed to save button order:", error);
    }
  };

  const checkTooltip = async () => {
    try {
      const shown = await AsyncStorage.getItem(TOOLTIP_KEY);
      if (!shown) {
        setShowTooltip(true);
        setTimeout(() => {
          setShowTooltip(false);
          AsyncStorage.setItem(TOOLTIP_KEY, "true");
        }, 5000);
      }
    } catch (error) {
      console.error("Failed to check tooltip:", error);
    }
  };

  const handlePress = async (route: string, isPro?: boolean) => {
    if (editMode) return; // Disable navigation in edit mode
    
    // Check if Pro feature and user is not Pro
    if (isPro) {
      const userIsPro = await isProUser();
      if (!userIsPro) {
        Alert.alert(
          "Upgrade to Pro",
          "This feature requires Energy Today Pro. Upgrade now to unlock all premium features!",
          [
            { text: "Not Now", style: "cancel" },
            { 
              text: "Upgrade", 
              onPress: () => router.push("/upgrade" as any),
              style: "default"
            }
          ]
        );
        return;
      }
    }
    
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(route as any);
  };

  const handleLongPress = (buttonId: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setEditMode(true);
  };

  const handleDone = () => {
    setEditMode(false);
    saveButtonOrder(buttons);
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const moveButton = (fromIndex: number, toIndex: number) => {
    const newButtons = [...buttons];
    const [moved] = newButtons.splice(fromIndex, 1);
    newButtons.splice(toIndex, 0, moved);
    setButtons(newButtons);
  };

  const isActive = (route: string) => {
    if (route === "/(tabs)" && pathname === "/") return true;
    return pathname.includes(route.replace("/(tabs)", ""));
  };

  // Auto-hide animation style
  const navBarHeight = 24 + 40 + Math.max(insets.bottom, 8);
  
  const animatedNavStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));
  
  // Show/hide nav bar
  const showNavBar = () => {
    translateY.value = withTiming(0, { duration: 200 });
    runOnJS(setIsVisible)(true);
  };
  
  const hideNavBar = () => {
    translateY.value = withTiming(navBarHeight, { duration: 200 });
    runOnJS(setIsVisible)(false);
  };
  
  // Expose show/hide functions globally for screens to use
  useEffect(() => {
    (global as any).showNavBar = showNavBar;
    (global as any).hideNavBar = hideNavBar;
    
    return () => {
      delete (global as any).showNavBar;
      delete (global as any).hideNavBar;
    };
  }, []);
  
  const renderButton = ({ item, index }: { item: NavButton; index: number }) => {
    const active = isActive(item.route);

    return (
      <NavButtonItem
        item={item}
        active={active}
        editMode={editMode}
        onPress={() => handlePress(item.route, item.isPro)}
        onLongPress={() => handleLongPress(item.id)}
      />
    );
  };

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          paddingBottom: Math.max(insets.bottom, 8),
          backgroundColor: colors.background,
          borderTopWidth: 0.5,
          borderTopColor: colors.border,
          zIndex: 1000,
          elevation: 10, // Android shadow
          shadowColor: '#000', // iOS shadow
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
        },
        animatedNavStyle,
      ]}
    >
      {/* Tooltip */}
      {showTooltip && (
        <View
          style={{
            position: "absolute",
            top: -60,
            left: 20,
            right: 20,
            backgroundColor: colors.primary,
            padding: 12,
            borderRadius: 8,
            zIndex: 1000,
          }}
        >
          <Text className="text-white text-sm text-center font-medium">
            💡 Long-press any button to rearrange
          </Text>
        </View>
      )}

      {/* Edit Mode Header */}
      {editMode && (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 8,
            backgroundColor: colors.surface,
          }}
        >
          <Text className="text-foreground text-sm font-medium">
            Drag buttons to reorder
          </Text>
          <TouchableOpacity
            onPress={handleDone}
            className="bg-primary px-4 py-2 rounded-full"
          >
            <Text className="text-white text-sm font-semibold">Done</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Navigation Buttons */}
      <FlatList
        data={buttons}
        renderItem={renderButton}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEnabled={!editMode}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}
      />
    </Animated.View>
  );
}

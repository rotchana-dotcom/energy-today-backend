import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Switch, Linking, TextInput } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { getUserProfile, saveSubscriptionStatus } from "@/lib/storage";
import { getSubscriptionStatus } from "@/lib/subscription-status";
import { UserProfile, SubscriptionStatus } from "@/types";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  requestNotificationPermissions,
  setNotificationEnabled,
  isNotificationEnabled,
  setNotificationTime,
  getNotificationTime,
} from "@/lib/notifications";
import {
  setContextualRemindersEnabled,
  areContextualRemindersEnabled,
  getReminderSummary,
} from "@/lib/contextual-reminders";
import { cancelNotification, getNotificationHistory } from "@/lib/smart-notifications";
import { isADHDModeEnabled, setADHDMode } from "@/lib/adhd-mode";
import { getCurrentLanguage, setLanguage, Language } from "@/lib/i18n";
import { exportJournalToCSV, exportEnergyHistoryToCSV, exportCombinedDataToCSV, EnergyHistoryRecord } from "@/lib/csv-export";
import { getJournalEntries, getUserProfile as getProfile } from "@/lib/storage";
import { calculateDailyEnergy } from "@/lib/energy-engine";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SettingsScreen() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionStatus>({ isPro: false });
  const colorScheme = useColorScheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationTime, setNotificationTimeState] = useState({ hour: 8, minute: 0 });
  const [contextualRemindersEnabled, setContextualRemindersEnabledState] = useState(false);
  const [reminderSummary, setReminderSummary] = useState("Loading...");
  const [smartNotificationsEnabled, setSmartNotificationsEnabledState] = useState(false);
  const [adhdModeEnabled, setAdhdModeEnabledState] = useState(false);
  const [currentLanguage, setCurrentLanguageState] = useState<Language>("en");
  const [exporting, setExporting] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [redeeming, setRedeeming] = useState(false);
  const [promoMessage, setPromoMessage] = useState("");
  const [debugModeEnabled, setDebugModeEnabledState] = useState(false);
  const [communicationStyle, setCommunicationStyleState] = useState<"direct" | "supportive">("direct");

  useEffect(() => {
    loadData();
  }, []);

  // Reload subscription status when screen gains focus (after returning from upgrade screen)
  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        // Note: userId not available in UserProfile, webhook system will use AsyncStorage fallback
        const subStatus = await getSubscriptionStatus();
        setSubscription(subStatus);
      })();
    }, [])
  );

  const loadData = async () => {
    const userProfile = await getUserProfile();
    // Use new webhook-based subscription status helper
    // Note: userId not available in UserProfile, webhook system will use AsyncStorage fallback
    const subStatus = await getSubscriptionStatus();
    const notifEnabled = await isNotificationEnabled();
    const notifTime = await getNotificationTime();
    const contextualEnabled = await areContextualRemindersEnabled();
    const summary = await getReminderSummary();
    const smartEnabled = (await AsyncStorage.getItem("@energy_today_smart_notifications")) === "true";
    const adhdEnabled = await isADHDModeEnabled();
    const lang = await getCurrentLanguage();
    const debugEnabled = (await AsyncStorage.getItem("@energy_today_debug_mode")) === "true";
    const commStyle = (await AsyncStorage.getItem("@energy_today_communication_style")) as "direct" | "supportive" || "direct";
    
    setProfile(userProfile);
    setSubscription(subStatus);
    setNotificationsEnabled(notifEnabled);
    setNotificationTimeState(notifTime);
    setContextualRemindersEnabledState(contextualEnabled);
    setReminderSummary(summary);
    setSmartNotificationsEnabledState(smartEnabled);
    setAdhdModeEnabledState(adhdEnabled);
    setCurrentLanguageState(lang);
    setDebugModeEnabledState(debugEnabled);
    setCommunicationStyleState(commStyle);
    setLoading(false);
  };

  const handleUpgrade = () => {
    if (subscription.isPro) {
      router.push("/manage-subscription" as any);
    } else {
      router.push("/upgrade" as any);
    }
  };

  const handleReportIssue = async () => {
    const { generateFullErrorReport } = await import("@/lib/error-reporting");
    const report = await generateFullErrorReport();
    
    const email = "support@kea.today";
    const subject = "Energy Today - Issue Report";
    const body = encodeURIComponent(report);
    
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${body}`;
    
    const canOpen = await Linking.canOpenURL(mailtoUrl);
    if (canOpen) {
      await Linking.openURL(mailtoUrl);
    } else {
      alert("Unable to open email app. Please email support@kea.today with your issue.");
    }
  };

  const handleViewErrorHistory = () => {
    router.push("/error-history" as any);
  };

  const handleRedeemPromoCode = async () => {
    if (!promoCode.trim()) return;
    
    setRedeeming(true);
    setPromoMessage("");
    
    try {
      // Import secure promo code function
      const { redeemPromoCode } = await import("@/lib/secure-promo-codes");
      
      const result = await redeemPromoCode(promoCode);
      
      if (result.success) {
        setPromoMessage(`🎉 ${result.message}`);
        setPromoCode("");
        
        // Reload subscription status
        const subStatus = await getSubscriptionStatus();
        setSubscription(subStatus);
        
        // Clear message after 5 seconds
        setTimeout(() => setPromoMessage(""), 5000);
      } else {
        setPromoMessage(`❌ ${result.message}`);
      }
    } catch (error) {
      console.error("Promo code redemption error:", error);
      setPromoMessage("❌ Error redeeming code. Please try again.");
    } finally {
      setRedeeming(false);
    }
  };

  if (loading || !profile) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color="#0A7EA4" />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          {/* Header */}
          <View className="flex-row items-center justify-between">
            <Text className="text-2xl font-bold text-foreground">Settings</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/more')}>
              <Text className="text-xl text-foreground">✕</Text>
            </TouchableOpacity>
          </View>

          {/* Profile Section */}
          <View className="bg-surface rounded-2xl p-5 border border-border gap-3">
            <Text className="text-sm font-medium text-muted mb-2">PROFILE</Text>
            
            <View className="gap-2">
              <Text className="text-xs text-muted">Name</Text>
              <Text className="text-base text-foreground font-medium">{profile.name}</Text>
            </View>

            <View className="gap-2">
              <Text className="text-xs text-muted">Date of Birth</Text>
              <Text className="text-base text-foreground font-medium">
                {new Date(profile.dateOfBirth).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
            </View>

            <View className="gap-2">
              <Text className="text-xs text-muted">Place of Birth</Text>
              <Text className="text-base text-foreground font-medium">
                {profile.placeOfBirth.city}, {profile.placeOfBirth.country}
              </Text>
            </View>

            <TouchableOpacity className="mt-2 py-2">
             <Text className="text-base text-foreground font-medium">Subscription</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/referral" as any)}
          className="flex-row items-center justify-between py-4 border-b border-border active:opacity-60"
        >
          <Text className="text-base text-foreground font-medium">Referral Program</Text>
        </TouchableOpacity>
          </View>

          {/* Trial Countdown Banner (only show in last 5 days) - Gentle reminder */}
          {subscription.isTrialActive && subscription.trialDaysRemaining && subscription.trialDaysRemaining <= 5 && (
            <View className="bg-primary/10 border border-primary/30 rounded-2xl p-4 gap-3">
              <View className="flex-row items-center gap-2">
                <Text className="text-2xl">📅</Text>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-foreground">
                    {subscription.trialDaysRemaining === 1 
                      ? "Your trial ends tomorrow" 
                      : `Your trial ends in ${subscription.trialDaysRemaining} days`}
                  </Text>
                  <Text className="text-xs text-muted mt-1">
                    Enjoying the Pro features? Consider upgrading
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => router.push("/upgrade" as any)}
                className="bg-primary py-3 rounded-lg active:opacity-80"
              >
                <Text className="text-center font-semibold text-white">
                  View Plans
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Subscription Section */}
          <View className="bg-surface rounded-2xl p-5 border border-border gap-4">
            <Text className="text-sm font-medium text-muted">SUBSCRIPTION</Text>
            
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-base font-semibold text-foreground">
                  {subscription.isPro && subscription.status === "trial" 
                    ? "Free Trial" 
                    : subscription.isPro 
                    ? "Energy Today Pro" 
                    : "Free Plan"}
                </Text>
                <Text className="text-xs text-muted mt-1">
                  {subscription.isPro && subscription.status === "trial"
                    ? `${subscription.trialDaysRemaining} days remaining`
                    : subscription.isPro 
                    ? "Access to all features" 
                    : "Basic features"}
                </Text>
              </View>
              {subscription.isPro && (
                <View className="bg-primary/20 px-3 py-1 rounded-full">
                  <Text className="text-xs font-medium text-primary">PRO</Text>
                </View>
              )}
            </View>

            {!subscription.isPro && (
              <View className="bg-primary/10 rounded-lg p-4 gap-2">
                <Text className="text-sm font-semibold text-foreground">Upgrade to Pro</Text>
                <Text className="text-xs text-muted leading-relaxed">
                  • Deep dive into energy calculations{"\n"}
                  • Pattern recognition from your journal{"\n"}
                  • Advanced psychological insights{"\n"}
                  • Personalized recommendations
                </Text>
              </View>
            )}

            <TouchableOpacity
              onPress={handleUpgrade}
              className={`py-3 rounded-lg active:opacity-80 ${subscription.isPro ? "bg-border" : "bg-primary"}`}
            >
              <Text className={`text-center font-semibold ${subscription.isPro ? "text-muted" : "text-white"}`}>
                {subscription.isPro ? "Manage Subscription" : "Upgrade to Pro - $9.99/mo"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Promo Code Section */}
          <View className="bg-surface rounded-2xl p-5 border border-border gap-4">
            <Text className="text-sm font-medium text-muted">PROMO CODE</Text>
            
            <View className="gap-3">
              <Text className="text-xs text-muted">
                Have a promo code? Enter it below to unlock Pro features.
              </Text>
              
              <View className="flex-row gap-2">
                <View className="flex-1">
                  <TextInput
                    placeholder="Enter promo code"
                    placeholderTextColor={colorScheme === "dark" ? "#9BA1A6" : "#687076"}
                    className="bg-background border border-border rounded-lg px-4 py-3 text-foreground"
                    autoCapitalize="characters"
                    onChangeText={(text) => setPromoCode(text.toUpperCase())}
                    value={promoCode}
                  />
                </View>
                <TouchableOpacity
                  onPress={handleRedeemPromoCode}
                  disabled={!promoCode.trim() || redeeming}
                  className={`px-6 py-3 rounded-lg justify-center ${
                    !promoCode.trim() || redeeming ? "bg-border" : "bg-primary"
                  }`}
                >
                  {redeeming ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text className={`font-semibold ${
                      !promoCode.trim() || redeeming ? "text-muted" : "text-white"
                    }`}>
                      Redeem
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
              
              {promoMessage && (
                <View className={`rounded-lg p-3 ${
                  promoMessage.includes("unlocked") || promoMessage.includes("Success")
                    ? "bg-success/10 border border-success/30"
                    : "bg-error/10 border border-error/30"
                }`}>
                  <Text className={`text-sm ${
                    promoMessage.includes("unlocked") || promoMessage.includes("Success")
                      ? "text-success"
                      : "text-error"
                  }`}>
                    {promoMessage}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Error Reporting Section */}
          <View className="bg-surface rounded-2xl p-5 border border-border gap-4">
            <Text className="text-sm font-medium text-muted">REPORT ISSUE</Text>
            
            <View className="gap-3">
              <Text className="text-xs text-muted">
                Experiencing a problem? Tap below to report it. You'll get an error code to share with support.
              </Text>
              
              <TouchableOpacity
                onPress={handleReportIssue}
                className="bg-primary py-3 rounded-lg active:opacity-80"
              >
                <Text className="text-center font-semibold text-white">
                  Report an Issue
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleViewErrorHistory}
                className="border border-border py-3 rounded-lg active:opacity-60"
              >
                <Text className="text-center font-medium text-foreground">
                  View Error History
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Usage Analytics Section (For Testing) */}
          <View className="bg-surface rounded-2xl p-5 border border-border gap-4">
            <Text className="text-sm font-medium text-muted">USAGE ANALYTICS</Text>
            
            <View className="gap-3">
              <Text className="text-xs text-muted">
                Track promo code redemptions, trial metrics, and feature usage during closed testing.
              </Text>
              
              <TouchableOpacity
                onPress={() => router.push("/usage-analytics" as any)}
                className="bg-primary py-3 rounded-lg active:opacity-80"
              >
                <Text className="text-center font-semibold text-white">
                  View Usage Analytics
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Calendar Sync Section */}
          <View className="bg-surface rounded-2xl p-5 border border-border gap-4">
            <Text className="text-sm font-medium text-muted">CALENDAR SYNC</Text>
            
            <View className="gap-3">
              <Text className="text-xs text-muted">
                Sync your activities to Google Calendar. Configure which features sync automatically.
              </Text>
              
              <TouchableOpacity
                onPress={() => router.push("/calendar-sync-settings" as any)}
                className="bg-primary py-3 rounded-lg active:opacity-80"
              >
                <Text className="text-center font-semibold text-white">
                  📅 Calendar Sync Settings
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Debug Mode Toggle */}
          <View className="bg-surface rounded-2xl p-5 border border-border gap-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-base text-foreground">Debug Mode</Text>
                <Text className="text-xs text-muted mt-1">
                  Show testing and debugging tools (for developers)
                </Text>
              </View>
              <Switch
                value={debugModeEnabled}
                onValueChange={async (value) => {
                  setDebugModeEnabledState(value);
                  await AsyncStorage.setItem("@energy_today_debug_mode", value.toString());
                }}
              />
            </View>
          </View>

          {/* Debug Tools Section (Testing Phase) - Only show when Debug Mode is ON */}
          {debugModeEnabled && (
          <View className="bg-surface rounded-2xl p-5 border border-border gap-4">
            <Text className="text-sm font-medium text-muted">DEBUG TOOLS (TESTING)</Text>
            
            <Text className="text-xs text-muted">
              Comprehensive tracing and debugging tools for testing phase. View activity logs, feature status, and error reports.
            </Text>
            
            <TouchableOpacity
              onPress={() => router.push("/feature-status" as any)}
              className="bg-primary py-3 rounded-lg active:opacity-80"
            >
              <Text className="text-center font-semibold text-white">
                📊 Feature Status Dashboard
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => router.push("/debug-console" as any)}
              className="bg-surface py-3 rounded-lg border border-border active:opacity-80"
            >
              <Text className="text-center font-semibold text-foreground">
                🐛 Debug Console
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => router.push("/test-screen" as any)}
              className="bg-success py-3 rounded-lg active:opacity-80"
            >
              <Text className="text-center font-semibold text-white">
                🧪 Test Screen (Mock Data)
              </Text>
            </TouchableOpacity>
          </View>
          )}

          {/* Preferences Section */}
          <View className="bg-surface rounded-2xl p-5 border border-border gap-4">
            <Text className="text-sm font-medium text-muted">PREFERENCES</Text>
            
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-base text-foreground">Daily Energy Summary</Text>
                <Text className="text-xs text-muted mt-1">
                  {notificationsEnabled ? `Every day at ${notificationTime.hour}:${notificationTime.minute.toString().padStart(2, '0')}` : "Receive morning energy updates"}
                </Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={async (value) => {
                  if (value) {
                    const granted = await requestNotificationPermissions();
                    if (granted) {
                      await setNotificationEnabled(true);
                      setNotificationsEnabled(true);
                    } else {
                      alert("Please enable notifications in your device settings");
                    }
                  } else {
                    await setNotificationEnabled(false);
                    setNotificationsEnabled(false);
                  }
                }}
              />
            </View>
            
            {notificationsEnabled && (
              <TouchableOpacity
                onPress={async () => {
                  // Simple time picker - in production, use a proper time picker component
                  const newHour = (notificationTime.hour + 1) % 24;
                  await setNotificationTime(newHour, notificationTime.minute);
                  setNotificationTimeState({ hour: newHour, minute: notificationTime.minute });
                }}
                className="py-2 px-4 bg-surface rounded-lg border border-border"
              >
                <Text className="text-sm text-primary">Change Time (Currently {notificationTime.hour}:00)</Text>
              </TouchableOpacity>
            )}

            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-base text-foreground">Contextual Reminders</Text>
                <Text className="text-xs text-muted mt-1">
                  {reminderSummary}
                </Text>
              </View>
              <Switch
                value={contextualRemindersEnabled}
                onValueChange={async (value) => {
                  if (value) {
                    const granted = await requestNotificationPermissions();
                    if (granted) {
                      await setContextualRemindersEnabled(true);
                      setContextualRemindersEnabledState(true);
                      const summary = await getReminderSummary();
                      setReminderSummary(summary);
                    } else {
                      alert("Please enable notifications in your device settings");
                    }
                  } else {
                    await setContextualRemindersEnabled(false);
                    setContextualRemindersEnabledState(false);
                    setReminderSummary("Disabled");
                  }
                }}
              />
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-base text-foreground">Smart Energy Peak Alerts</Text>
                <Text className="text-xs text-muted mt-1">
                  {smartNotificationsEnabled ? "Get notified 1 hour before energy peaks" : "Receive alerts during high-energy windows"}
                </Text>
              </View>
              <Switch
                value={smartNotificationsEnabled}
                onValueChange={async (value) => {
                  if (value && profile) {
                    const granted = await requestNotificationPermissions();
                    if (granted) {
                      // Smart notifications are now managed through the smart-notifications screen
                      await AsyncStorage.setItem("@energy_today_smart_notifications", "true");
                      setSmartNotificationsEnabledState(true);
                    } else {
                      alert("Please enable notifications in your device settings");
                    }
                  } else {
                    // Cancel all notifications
                    const history = await getNotificationHistory();
                    for (const notif of history.filter(n => n.status === 'pending')) {
                      await cancelNotification(notif.id);
                    }
                    await AsyncStorage.setItem("@energy_today_smart_notifications", "false");
                    setSmartNotificationsEnabledState(false);
                  }
                }}
              />
            </View>

            <View className="flex-row items-center justify-between">
              <Text className="text-base text-foreground">Dark Mode</Text>
              <Text className="text-sm text-muted capitalize">{colorScheme}</Text>
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-base text-foreground">ADHD-Friendly Mode</Text>
                <Text className="text-xs text-muted mt-1">
                  {adhdModeEnabled ? "High contrast colors enabled" : "Enable high contrast colors for better focus"}
                </Text>
              </View>
              <Switch
                value={adhdModeEnabled}
                onValueChange={async (value) => {
                  await setADHDMode(value);
                  setAdhdModeEnabledState(value);
                  // Reload the app to apply new theme
                  alert("Theme updated! Please restart the app to see changes.");
                }}
              />
            </View>

            <View className="gap-2">
              <Text className="text-base text-foreground">AI Communication Style</Text>
              <Text className="text-xs text-muted">
                Choose how the AI speaks to you
              </Text>
              <View className="flex-row gap-2 mt-2">
                <TouchableOpacity
                  onPress={async () => {
                    setCommunicationStyleState("direct");
                    await AsyncStorage.setItem("@energy_today_communication_style", "direct");
                  }}
                  className={`flex-1 py-3 rounded-lg border ${
                    communicationStyle === "direct"
                      ? "bg-primary border-primary"
                      : "bg-surface border-border"
                  }`}
                >
                  <Text
                    className={`text-center font-semibold ${
                      communicationStyle === "direct" ? "text-white" : "text-foreground"
                    }`}
                  >
                    💼 Direct
                  </Text>
                  <Text
                    className={`text-xs text-center mt-1 ${
                      communicationStyle === "direct" ? "text-white opacity-90" : "text-muted"
                    }`}
                  >
                    Commanding, action-oriented
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={async () => {
                    setCommunicationStyleState("supportive");
                    await AsyncStorage.setItem("@energy_today_communication_style", "supportive");
                  }}
                  className={`flex-1 py-3 rounded-lg border ${
                    communicationStyle === "supportive"
                      ? "bg-primary border-primary"
                      : "bg-surface border-border"
                  }`}
                >
                  <Text
                    className={`text-center font-semibold ${
                      communicationStyle === "supportive" ? "text-white" : "text-foreground"
                    }`}
                  >
                    🤝 Supportive
                  </Text>
                  <Text
                    className={`text-xs text-center mt-1 ${
                      communicationStyle === "supportive" ? "text-white opacity-90" : "text-muted"
                    }`}
                  >
                    Encouraging, explanatory
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-base text-foreground">Language / ภาษา</Text>
                <Text className="text-xs text-muted mt-1">
                  {currentLanguage === "en" ? "English" : "ไทย (Thai)"}
                </Text>
              </View>
              <TouchableOpacity
                onPress={async () => {
                  const newLang: Language = currentLanguage === "en" ? "th" : "en";
                  await setLanguage(newLang);
                  setCurrentLanguageState(newLang);
                  alert("Language updated! Please restart the app to see changes. / ภาษาอัปเดตแล้ว! โปรดรีสตาร์ทแอปเพื่อดูการเปลี่ยนแปลง");
                }}
                className="bg-primary px-4 py-2 rounded-lg active:opacity-80"
              >
                <Text className="text-white font-semibold">
                  {currentLanguage === "en" ? "Switch to Thai" : "เปลี่ยนเป็นอังกฤษ"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Data Export Section (Pro Only) */}
          {subscription.isPro && (
            <View className="bg-surface rounded-2xl p-5 border border-border gap-3">
              <Text className="text-sm font-medium text-muted">DATA EXPORT (PRO)</Text>
              
              <TouchableOpacity 
                onPress={async () => {
                  setExporting(true);
                  try {
                    const entries = await getJournalEntries();
                    await exportJournalToCSV(entries);
                  } catch (error) {
                    alert("Failed to export journal data");
                  } finally {
                    setExporting(false);
                  }
                }}
                disabled={exporting}
                className="py-2 active:opacity-60"
              >
                <Text className="text-base text-foreground">Export Journal to CSV</Text>
                <Text className="text-xs text-muted mt-1">Download all journal entries</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={async () => {
                  setExporting(true);
                  try {
                    const userProfile = await getProfile();
                    if (!userProfile) {
                      alert("No profile data found");
                      return;
                    }
                    
                    // Generate energy history for past 30 days
                    const history: EnergyHistoryRecord[] = [];
                    for (let i = 0; i < 30; i++) {
                      const date = new Date();
                      date.setDate(date.getDate() - i);
                      const energy = calculateDailyEnergy(userProfile, date);
                      history.push({
                        date: date.toISOString().split("T")[0],
                        yourEnergyScore: energy.userEnergy.intensity,
                        todayEnergyScore: energy.environmentalEnergy.intensity,
                        alignment: energy.connection.alignment,
                        synergy: energy.connection.color,
                      });
                    }
                    
                    await exportEnergyHistoryToCSV(history);
                  } catch (error) {
                    alert("Failed to export energy history");
                  } finally {
                    setExporting(false);
                  }
                }}
                disabled={exporting}
                className="py-2 active:opacity-60"
              >
                <Text className="text-base text-foreground">Export Energy History to CSV</Text>
                <Text className="text-xs text-muted mt-1">Download 30-day energy data</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={async () => {
                  setExporting(true);
                  try {
                    const userProfile = await getProfile();
                    if (!userProfile) {
                      alert("No profile data found");
                      return;
                    }
                    
                    // Generate energy history
                    const history: EnergyHistoryRecord[] = [];
                    for (let i = 0; i < 30; i++) {
                      const date = new Date();
                      date.setDate(date.getDate() - i);
                      const energy = calculateDailyEnergy(userProfile, date);
                      history.push({
                        date: date.toISOString().split("T")[0],
                        yourEnergyScore: energy.userEnergy.intensity,
                        todayEnergyScore: energy.environmentalEnergy.intensity,
                        alignment: energy.connection.alignment,
                        synergy: energy.connection.color,
                      });
                    }
                    
                    const entries = await getJournalEntries();
                    await exportCombinedDataToCSV(history, entries);
                  } catch (error) {
                    alert("Failed to export combined data");
                  } finally {
                    setExporting(false);
                  }
                }}
                disabled={exporting}
                className="py-2 active:opacity-60"
              >
                <Text className="text-base text-foreground">Export Combined Data to CSV</Text>
                <Text className="text-xs text-muted mt-1">Energy + journal in one file</Text>
              </TouchableOpacity>

              {exporting && (
                <View className="bg-primary/10 rounded-lg p-3">
                  <Text className="text-xs text-primary text-center">Preparing export...</Text>
                </View>
              )}
            </View>
          )}

          {/* Insights Section */}
          <View className="bg-surface rounded-2xl p-5 border border-border gap-3">
            <Text className="text-sm font-medium text-muted">INSIGHTS</Text>
            
            <TouchableOpacity 
              onPress={() => router.push("/numerology" as any)}
              className="py-2 active:opacity-60"
            >
              <Text className="text-base text-foreground">Personal Energy Profile</Text>
              <Text className="text-xs text-muted mt-1">Your unique timing patterns and strengths</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => router.push("/forecast" as any)}
              className="py-2 active:opacity-60"
            >
              <Text className="text-base text-foreground">Energy Forecast</Text>
              <Text className="text-xs text-muted mt-1">7-day and 30-day predictions</Text>
            </TouchableOpacity>
          </View>

          {/* Help Section */}
          <View className="bg-surface rounded-2xl p-5 border border-border gap-3">
            <Text className="text-sm font-medium text-muted">HELP</Text>
            
            <TouchableOpacity 
              onPress={() => router.push("/guide" as any)}
              className="py-2 active:opacity-60"
            >
              <Text className="text-base text-foreground">User Guide & Tutorial</Text>
              <Text className="text-xs text-muted mt-1">Learn how to use Energy Today</Text>
            </TouchableOpacity>
          </View>

          {/* About Section */}
          <View className="bg-surface rounded-2xl p-5 border border-border gap-3">
            <Text className="text-sm font-medium text-muted">ABOUT</Text>
            
            <TouchableOpacity 
              onPress={() => Linking.openURL("https://rotchana-dotcom.github.io/smart-gate-check/")}
              className="py-2 active:opacity-60"
            >
              <Text className="text-base text-foreground">Privacy Policy</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => Linking.openURL("https://rotchana-dotcom.github.io/smart-gate-check/")}
              className="py-2 active:opacity-60"
            >
              <Text className="text-base text-foreground">Terms of Service</Text>
            </TouchableOpacity>

            <View className="pt-2 border-t border-border">
              <Text className="text-sm text-muted">Version 1.0.1</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

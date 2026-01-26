import { useState, useEffect } from "react";
import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator, Alert, TextInput } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { processStripePayment, getStripePricing } from "@/lib/stripe-payment";
import { processPayPalPayment, getPayPalPricing } from "@/lib/paypal-payment";
import { 
  getSubscriptionOfferings,
  purchaseSubscription,
  restorePurchases,
  getDefaultPricing,
  isBillingAvailable
} from "@/lib/revenuecat-billing";
import { Platform } from "react-native";
import { saveSubscriptionStatus as saveSubscriptionStatusLegacy } from "@/lib/storage";
import { saveSubscriptionStatus } from "@/lib/subscription-status";
import { startFreeTrial, hasUsedTrial, addPaymentToHistory } from "@/lib/subscription-management";
import { redeemPromoCode } from "@/lib/secure-promo-codes";
import * as Haptics from "expo-haptics";

export default function UpgradeScreen() {
  const [processing, setProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<"stripe" | "paypal" | "googleplay" | "trial" | null>(null);
  const [trialUsed, setTrialUsed] = useState(false);
  const [adminCode, setAdminCode] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('annual'); // Default to annual (better value)

  const stripePricing = getStripePricing();
  const paypalPricing = getPayPalPricing();

  useEffect(() => {
    checkTrialStatus();
  }, []);

  const checkTrialStatus = async () => {
    const used = await hasUsedTrial();
    setTrialUsed(used);
  };

  const handleStartTrial = async () => {
    setProcessing(true);
    setSelectedMethod("trial");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const result = await startFreeTrial();

    if (result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "Trial Started!",
        "Enjoy 7 days of Energy Today Pro for free. You can upgrade anytime during your trial.",
        [{ text: "Continue", onPress: () => router.push('/(tabs)/more') }]
      );
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", result.error || "Failed to start trial");
    }

    setProcessing(false);
    setSelectedMethod(null);
  };

  const handleStripePayment = async () => {
    setProcessing(true);
    setSelectedMethod("stripe");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const result = await processStripePayment("user-" + Date.now(), selectedPlan); // Pass selected plan

    if (result.success) {
      await saveSubscriptionStatus({ isPro: true });
      const amount = selectedPlan === 'annual' ? 99.99 : 9.99;
      const description = selectedPlan === 'annual' 
        ? "Energy Today Pro - Annual Subscription" 
        : "Energy Today Pro - Monthly Subscription";
      await addPaymentToHistory({
        id: Date.now().toString(),
        date: new Date().toISOString(),
        amount,
        currency: "USD",
        method: "stripe",
        status: "succeeded",
        description,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "Success!",
        "Welcome to Energy Today Pro! You now have access to all premium features.",
        [{ text: "Continue", onPress: () => router.push('/(tabs)/more') }]
      );
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        "Demo Mode",
        result.error || "Payment links not configured yet. Use promo code ENERGY2026PRO to unlock Pro features for testing."
      );
    }

    setProcessing(false);
    setSelectedMethod(null);
  };

  const handlePayPalPayment = async () => {
    setProcessing(true);
    setSelectedMethod("paypal");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const result = await processPayPalPayment("user-" + Date.now(), selectedPlan); // Pass selected plan

    if (result.success) {
      await saveSubscriptionStatus({ isPro: true });
      const amount = selectedPlan === 'annual' ? 99.99 : 9.99;
      const description = selectedPlan === 'annual' 
        ? "Energy Today Pro - Annual Subscription" 
        : "Energy Today Pro - Monthly Subscription";
      await addPaymentToHistory({
        id: Date.now().toString(),
        date: new Date().toISOString(),
        amount,
        currency: "USD",
        method: "paypal",
        status: "succeeded",
        description,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "Success!",
        "Welcome to Energy Today Pro! You now have access to all premium features.",
        [{ text: "Continue", onPress: () => router.push('/(tabs)/more') }]
      );
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        "Demo Mode",
        result.error || "Payment links not configured yet. Use promo code ENERGY2026PRO to unlock Pro features for testing."
      );
    }

    setProcessing(false);
    setSelectedMethod(null);
  };

  const handleGooglePlayPayment = async () => {
    setProcessing(true);
    setSelectedMethod("googleplay");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Get offerings from RevenueCat
    const offerings = await getSubscriptionOfferings();
    if (offerings.length === 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", "No subscription products available. Please try again later.");
      setProcessing(false);
      setSelectedMethod(null);
      return;
    }

    // For now, use first available package (will be configured in RevenueCat dashboard)
    const packageToPurchase = offerings[0];
    const result = await purchaseSubscription(packageToPurchase as any);

    if (result.success) {
      await saveSubscriptionStatus({ isPro: true, provider: "google_play", plan: selectedPlan });
      const amount = selectedPlan === 'annual' ? 79.99 : 9.99;
      const description = selectedPlan === 'annual' 
        ? "Energy Today Pro - Annual Subscription" 
        : "Energy Today Pro - Monthly Subscription";
      await addPaymentToHistory({
        id: result.transactionId || Date.now().toString(),
        date: new Date().toISOString(),
        amount,
        currency: "USD",
        method: "google_play",
        status: "succeeded",
        description,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "Success!",
        "Welcome to Energy Today Pro! You now have access to all premium features.",
        [{ text: "Continue", onPress: () => router.push('/(tabs)/more' as any) }]
      );
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        "Purchase Failed",
        result.error || "Unable to complete purchase. Please try again."
      );
    }

    setProcessing(false);
    setSelectedMethod(null);
  };

  const handleRestorePurchases = async () => {
    setProcessing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const result = await restorePurchases();

    if (result.success) {
      await saveSubscriptionStatus({ isPro: true, provider: "google_play" });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "Purchases Restored!",
        "Your Pro subscription has been restored.",
        [{ text: "Continue", onPress: () => router.push('/(tabs)/more' as any) }]
      );
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        "No Purchases Found",
        result.error || "No active subscriptions to restore."
      );
    }

    setProcessing(false);
  };

  const handleAdminUnlock = async () => {
    if (!adminCode.trim()) {
      Alert.alert("Error", "Please enter an unlock code");
      return;
    }

    setProcessing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const result = await redeemPromoCode(adminCode);

    if (result.success) {
      await saveSubscriptionStatus({ isPro: true });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "Success!",
        result.message,
        [{ text: "Continue", onPress: () => router.push('/(tabs)/more') }]
      );
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Invalid Code", result.message);
    }

    setProcessing(false);
    setAdminCode("");
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24 }}>
        {/* Header */}
        <View className="items-center mb-8">
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/more')}
            className="self-start mb-4 active:opacity-60"
          >
            <Text className="text-primary text-base">← Back</Text>
          </TouchableOpacity>

          <Text className="text-3xl font-bold text-foreground mb-2">Upgrade to Pro</Text>
          <Text className="text-base text-muted text-center">
            Unlock deeper insights and advanced features
          </Text>
        </View>

        {/* Pro Features */}
        <View className="bg-surface rounded-2xl p-6 mb-6 border border-border">
          <Text className="text-lg font-semibold text-foreground mb-4">Pro Features Include:</Text>

          {[
            "Detailed energy analysis and insights",
            "Pattern recognition from journal entries",
            "Advanced psychological guidance",
            "Energy coaching recommendations",
            "Habit-energy correlation tracking",
            "Business metrics dashboard with ROI",
            "Unlimited activity history",
            "Priority support",
          ].map((feature, index) => (
            <View key={index} className="flex-row items-start mb-3">
              <Text className="text-success text-lg mr-2">✓</Text>
              <Text className="text-foreground flex-1">{feature}</Text>
            </View>
          ))}
        </View>

        {/* Free Trial */}
        {!trialUsed && (
          <TouchableOpacity
            onPress={handleStartTrial}
            disabled={processing}
            className="bg-success rounded-xl p-6 mb-6"
          >
            <View className="items-center">
              <Text className="text-white font-bold text-2xl mb-2">Start 7-Day Free Trial</Text>
              <Text className="text-white/90 text-sm text-center mb-3">
                Full access to all Pro features. Cancel anytime.
              </Text>
              {processing && selectedMethod === "trial" ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-white text-4xl">🎁</Text>
              )}
            </View>
          </TouchableOpacity>
        )}

        {/* Plan Selection Toggle */}
        <View className="mb-6">
          <Text className="text-base font-semibold text-foreground mb-3 text-center">
            Choose Your Plan
          </Text>
          <View className="flex-row gap-3">
            {/* Monthly Plan */}
            <TouchableOpacity
              onPress={() => {
                setSelectedPlan('monthly');
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              className={`flex-1 rounded-xl p-4 border-2 ${
                selectedPlan === 'monthly' 
                  ? 'bg-primary/10 border-primary' 
                  : 'bg-surface border-border'
              }`}
            >
              <Text className={`text-center font-semibold mb-1 ${
                selectedPlan === 'monthly' ? 'text-primary' : 'text-foreground'
              }`}>
                Monthly
              </Text>
              <Text className={`text-center text-2xl font-bold mb-1 ${
                selectedPlan === 'monthly' ? 'text-primary' : 'text-foreground'
              }`}>
                ${stripePricing.monthly.amount}
              </Text>
              <Text className="text-center text-xs text-muted">per month</Text>
              <Text className="text-center text-xs text-muted mt-1">
                ${stripePricing.monthly.total}/year
              </Text>
            </TouchableOpacity>

            {/* Annual Plan */}
            <TouchableOpacity
              onPress={() => {
                setSelectedPlan('annual');
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              className={`flex-1 rounded-xl p-4 border-2 ${
                selectedPlan === 'annual' 
                  ? 'bg-primary/10 border-primary' 
                  : 'bg-surface border-border'
              }`}
            >
              <View className="absolute -top-2 right-2 bg-success px-2 py-1 rounded-full">
                <Text className="text-white text-xs font-bold">SAVE {stripePricing.annual.discount}%</Text>
              </View>
              <Text className={`text-center font-semibold mb-1 ${
                selectedPlan === 'annual' ? 'text-primary' : 'text-foreground'
              }`}>
                Annual
              </Text>
              <Text className={`text-center text-2xl font-bold mb-1 ${
                selectedPlan === 'annual' ? 'text-primary' : 'text-foreground'
              }`}>
                ${stripePricing.annual.amount}
              </Text>
              <Text className="text-center text-xs text-muted">per year</Text>
              <Text className="text-center text-xs text-success mt-1 font-semibold">
                Save ${stripePricing.annual.savings.toFixed(2)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Payment Methods */}
        <Text className="text-base font-semibold text-foreground mb-4">
          {trialUsed ? "Choose Payment Method:" : "Or subscribe now:"}
        </Text>

        {/* Google Play (Android only) */}
        {Platform.OS === 'android' && (
          <>
            <TouchableOpacity
              onPress={handleGooglePlayPayment}
              disabled={processing}
              className="bg-[#01875F] rounded-xl p-5 mb-4 active:opacity-70"
            >
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-white font-semibold text-lg mb-1">Google Play</Text>
                  <Text className="text-white/80 text-sm">Secure in-app billing</Text>
                </View>
                {processing && selectedMethod === "googleplay" ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="text-white text-2xl">▶️</Text>
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleRestorePurchases}
              disabled={processing}
              className="mb-6"
            >
              <Text className="text-center text-primary text-sm font-semibold">Restore Purchases</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Stripe & PayPal (non-Android or fallback) */}
        {Platform.OS !== 'android' && (
          <>
            {/* Stripe */}
            <TouchableOpacity
              onPress={handleStripePayment}
              disabled={processing}
              className="bg-primary rounded-xl p-5 mb-4 active:opacity-70"
            >
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-white font-semibold text-lg mb-1">Credit Card</Text>
                  <Text className="text-white/80 text-sm">Powered by Stripe</Text>
                </View>
                {processing && selectedMethod === "stripe" ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="text-white text-2xl">💳</Text>
                )}
              </View>
            </TouchableOpacity>

            {/* PayPal */}
            <TouchableOpacity
              onPress={handlePayPalPayment}
              disabled={processing}
              className="bg-[#0070BA] rounded-xl p-5 mb-6 active:opacity-70"
            >
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-white font-semibold text-lg mb-1">PayPal</Text>
                  <Text className="text-white/80 text-sm">Fast and secure</Text>
                </View>
                {processing && selectedMethod === "paypal" ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="text-white text-2xl">🅿️</Text>
                )}
              </View>
            </TouchableOpacity>
          </>
        )}

        {/* Promo Code */}
        <View className="bg-surface rounded-xl p-4 border border-border mb-6">
          <Text className="text-sm font-semibold text-foreground mb-3">Have a promo code?</Text>
          <View className="flex-row gap-3">
            <TextInput
              value={adminCode}
              onChangeText={setAdminCode}
              placeholder="Enter promo code"
              autoCapitalize="characters"
              autoCorrect={false}
              className="flex-1 px-4 py-3 rounded-lg border border-border bg-background text-foreground"
            />
            <TouchableOpacity
              onPress={handleAdminUnlock}
              disabled={processing || !adminCode.trim()}
              className="bg-primary rounded-lg px-6 py-3 active:opacity-70 justify-center"
            >
              <Text className="text-white font-semibold">
                {processing ? "..." : "Apply"}
              </Text>
            </TouchableOpacity>
          </View>
          <Text className="text-xs text-muted mt-2">
            For testing: ENERGY2026PRO
          </Text>
        </View>

        {/* Footer */}
        <Text className="text-xs text-muted text-center mb-4">
          Secure payment processing. Your subscription will renew automatically each month. Cancel
          anytime from settings.
        </Text>

        <Text className="text-xs text-muted text-center mb-8">
          By subscribing, you agree to our Terms of Service and Privacy Policy.
        </Text>
      </ScrollView>
    </ScreenContainer>
  );
}

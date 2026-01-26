import { useState, useEffect } from "react";
import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator, Alert, TextInput } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import {
  getPaymentHistory,
  getBillingInfo,
  cancelSubscription,
  getTrialDaysRemaining,
  isTrialActive,
  type PaymentHistory,
  type BillingInfo,
} from "@/lib/subscription-management";
import { getSubscriptionStatus } from "@/lib/storage";
import { SubscriptionStatus } from "@/types";
import * as Haptics from "expo-haptics";
import { redeemPromoCode } from "@/lib/secure-promo-codes";
import { saveSubscriptionStatus } from "@/lib/subscription-status";

export default function ManageSubscriptionScreen() {
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionStatus>({ isPro: false });
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [billingInfo, setBillingInfo] = useState<BillingInfo>({});
  const [trialDaysRemaining, setTrialDaysRemaining] = useState(0);
  const [isTrial, setIsTrial] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [adminCode, setAdminCode] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const sub = await getSubscriptionStatus();
    const history = await getPaymentHistory();
    const billing = await getBillingInfo();
    const daysRemaining = await getTrialDaysRemaining();
    const trialActive = await isTrialActive();

    setSubscription(sub);
    setPaymentHistory(history);
    setBillingInfo(billing);
    setTrialDaysRemaining(daysRemaining);
    setIsTrial(trialActive);
    setLoading(false);
  };

  const handleAdminUnlock = async () => {
    if (!adminCode.trim()) {
      Alert.alert("Error", "Please enter a promo code");
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
        [{ text: "Continue", onPress: () => loadData() }]
      );
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Invalid Code", result.message);
    }

    setProcessing(false);
    setAdminCode("");
  };

  const handleCancelSubscription = () => {
    const title = isTrial ? "Cancel Trial" : "Cancel Subscription";
    const message = isTrial 
      ? "Are you sure you want to cancel your free trial? You'll lose access to all Pro features immediately."
      : "Are you sure you want to cancel your Pro subscription? You'll lose access to all Pro features at the end of your billing period.";
    
    Alert.alert(
      title,
      message,
      [
        { text: "Keep Subscription", style: "cancel" },
        {
          text: "Cancel",
          style: "destructive",
          onPress: async () => {
            setCanceling(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

            const result = await cancelSubscription();

            if (result.success) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert(
                "Subscription Canceled",
                "Your subscription has been canceled. You'll continue to have Pro access until the end of your billing period.",
                [{ text: "OK", onPress: () => router.push('/(tabs)/more') }]
              );
            } else {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert("Error", result.error || "Failed to cancel subscription");
            }

            setCanceling(false);
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color="#0A7EA4" />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity onPress={() => router.push('/(tabs)/more')} className="active:opacity-60">
            <Text className="text-primary text-base">← Back</Text>
          </TouchableOpacity>
          <Text className="text-xl font-bold text-foreground">Manage Subscription</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Subscription Status */}
        <View className="bg-surface rounded-2xl p-6 mb-6 border border-border">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold text-foreground">
              {isTrial ? "Free Trial" : subscription.isPro ? "Pro Plan" : "Free Plan"}
            </Text>
            {subscription.isPro && (
              <View className={`px-3 py-1 rounded-full ${isTrial ? "bg-warning/20" : "bg-primary/20"}`}>
                <Text className={`text-xs font-medium ${isTrial ? "text-warning" : "text-primary"}`}>
                  {isTrial ? "TRIAL" : "PRO"}
                </Text>
              </View>
            )}
          </View>

          {/* Trial Countdown Banner (only show in last 5 days) */}
          {isTrial && trialDaysRemaining <= 5 && (
            <View className="bg-primary/10 border border-primary/30 rounded-2xl p-4 gap-3 mb-4">
              <View className="flex-row items-center gap-2">
                <Text className="text-2xl">📅</Text>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-foreground">
                    {trialDaysRemaining === 1 
                      ? "Your trial ends tomorrow" 
                      : `Your trial ends in ${trialDaysRemaining} days`}
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

          {subscription.isPro && !isTrial && (
            <>
              <View className="mb-4">
                <Text className="text-sm text-muted mb-1">Next Billing Date</Text>
                <Text className="text-base text-foreground font-medium">
                  {billingInfo.nextBillingDate
                    ? new Date(billingInfo.nextBillingDate).toLocaleDateString()
                    : "Not available"}
                </Text>
              </View>

              {billingInfo.cardLast4 && (
                <View className="mb-4">
                  <Text className="text-sm text-muted mb-1">Payment Method</Text>
                  <Text className="text-base text-foreground font-medium">
                    {billingInfo.cardBrand} •••• {billingInfo.cardLast4}
                  </Text>
                </View>
              )}
            </>
          )}

          {subscription.isPro && (
            <TouchableOpacity
              onPress={handleCancelSubscription}
              disabled={canceling}
              className="bg-error/10 rounded-lg p-4 active:opacity-80"
            >
              {canceling ? (
                <ActivityIndicator color="#EF4444" />
              ) : (
                <Text className="text-error font-medium text-center">
                  {isTrial ? "Cancel Trial" : "Cancel Subscription"}
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>

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

        {/* Payment History */}
        {paymentHistory.length > 0 && (
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <Text className="text-lg font-semibold text-foreground mb-4">Payment History</Text>

            {paymentHistory.map((payment) => (
              <View
                key={payment.id}
                className="flex-row items-center justify-between py-3 border-b border-border last:border-b-0"
              >
                <View className="flex-1">
                  <Text className="text-base text-foreground font-medium mb-1">
                    {payment.description}
                  </Text>
                  <Text className="text-xs text-muted">
                    {new Date(payment.date).toLocaleDateString()} • {payment.method.toUpperCase()}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-base font-semibold text-foreground">
                    ${payment.amount.toFixed(2)}
                  </Text>
                  <Text
                    className={`text-xs ${
                      payment.status === "succeeded"
                        ? "text-success"
                        : payment.status === "failed"
                        ? "text-error"
                        : "text-warning"
                    }`}
                  >
                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

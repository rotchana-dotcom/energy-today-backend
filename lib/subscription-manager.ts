import AsyncStorage from "@react-native-async-storage/async-storage";

const SUBSCRIPTION_KEY = "user_subscription";
const SUBSCRIPTION_HISTORY_KEY = "subscription_history";
const TRIAL_KEY = "trial_status";

export type SubscriptionTier = "free" | "pro" | "family";

export interface SubscriptionPlan {
  tier: SubscriptionTier;
  name: string;
  price: number; // monthly price in USD
  features: string[];
  maxFamilyMembers?: number;
}

export interface UserSubscription {
  tier: SubscriptionTier;
  status: "active" | "cancelled" | "expired" | "trial";
  startDate: string;
  endDate?: string;
  autoRenew: boolean;
  paymentMethod?: string;
  lastPaymentDate?: string;
  nextBillingDate?: string;
}

export interface SubscriptionHistory {
  id: string;
  tier: SubscriptionTier;
  action: "subscribed" | "upgraded" | "downgraded" | "cancelled" | "renewed";
  date: string;
  amount?: number;
}

export interface TrialStatus {
  hasUsedTrial: boolean;
  trialStartDate?: string;
  trialEndDate?: string;
  daysRemaining?: number;
}

/**
 * Subscription plans
 */
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    tier: "free",
    name: "Free",
    price: 0,
    features: [
      "Basic energy tracking",
      "Daily journal",
      "Up to 3 habits",
      "Basic insights",
      "7-day history",
    ],
  },
  {
    tier: "pro",
    name: "Pro",
    price: 9.99,
    features: [
      "Everything in Free",
      "Unlimited habits",
      "Advanced AI insights",
      "Predictive analytics",
      "Unlimited history",
      "Custom reports",
      "Priority support",
      "No ads",
    ],
  },
  {
    tier: "family",
    name: "Family",
    price: 19.99,
    maxFamilyMembers: 5,
    features: [
      "Everything in Pro",
      "Up to 5 family members",
      "Family dashboard",
      "Shared challenges",
      "Group activity planning",
      "Family insights",
      "Emergency alerts",
    ],
  },
];

/**
 * Get user subscription
 */
export async function getUserSubscription(): Promise<UserSubscription> {
  try {
    const data = await AsyncStorage.getItem(SUBSCRIPTION_KEY);
    if (data) {
      return JSON.parse(data);
    }
    
    // Default to free tier
    return {
      tier: "free",
      status: "active",
      startDate: new Date().toISOString(),
      autoRenew: false,
    };
  } catch (error) {
    console.error("Failed to get user subscription:", error);
    return {
      tier: "free",
      status: "active",
      startDate: new Date().toISOString(),
      autoRenew: false,
    };
  }
}

/**
 * Update user subscription
 */
export async function updateUserSubscription(
  subscription: UserSubscription
): Promise<void> {
  try {
    await AsyncStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(subscription));
  } catch (error) {
    console.error("Failed to update user subscription:", error);
    throw error;
  }
}

/**
 * Get subscription plan details
 */
export function getSubscriptionPlan(tier: SubscriptionTier): SubscriptionPlan {
  const plan = SUBSCRIPTION_PLANS.find((p) => p.tier === tier);
  if (!plan) {
    return SUBSCRIPTION_PLANS[0]; // Return free plan as fallback
  }
  return plan;
}

/**
 * Check if feature is available for current subscription
 */
export async function isFeatureAvailable(feature: string): Promise<boolean> {
  const subscription = await getUserSubscription();
  const plan = getSubscriptionPlan(subscription.tier);
  
  // Check if subscription is active
  if (subscription.status !== "active" && subscription.status !== "trial") {
    return plan.tier === "free";
  }
  
  // Feature mapping
  const featureMap: { [key: string]: SubscriptionTier[] } = {
    unlimited_habits: ["pro", "family"],
    advanced_insights: ["pro", "family"],
    predictive_analytics: ["pro", "family"],
    custom_reports: ["pro", "family"],
    family_sharing: ["family"],
    family_dashboard: ["family"],
    group_challenges: ["family"],
    priority_support: ["pro", "family"],
    no_ads: ["pro", "family"],
  };
  
  const requiredTiers = featureMap[feature];
  if (!requiredTiers) {
    return true; // Feature not gated
  }
  
  return requiredTiers.includes(subscription.tier);
}

/**
 * Start free trial
 */
export async function startFreeTrial(): Promise<{
  success: boolean;
  message: string;
  trialEndDate?: string;
}> {
  try {
    const trialStatus = await getTrialStatus();
    
    if (trialStatus.hasUsedTrial) {
      return {
        success: false,
        message: "You have already used your free trial",
      };
    }
    
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7); // 7-day trial
    
    // Update trial status
    const newTrialStatus: TrialStatus = {
      hasUsedTrial: true,
      trialStartDate: startDate.toISOString(),
      trialEndDate: endDate.toISOString(),
      daysRemaining: 7,
    };
    
    await AsyncStorage.setItem(TRIAL_KEY, JSON.stringify(newTrialStatus));
    
    // Update subscription
    const subscription: UserSubscription = {
      tier: "pro",
      status: "trial",
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      autoRenew: false,
    };
    
    await updateUserSubscription(subscription);
    
    // Add to history
    await addSubscriptionHistory({
      tier: "pro",
      action: "subscribed",
      date: startDate.toISOString(),
      amount: 0,
    });
    
    return {
      success: true,
      message: "Free trial started successfully!",
      trialEndDate: endDate.toISOString(),
    };
  } catch (error) {
    console.error("Failed to start free trial:", error);
    return {
      success: false,
      message: `Failed to start trial: ${error}`,
    };
  }
}

/**
 * Get trial status
 */
export async function getTrialStatus(): Promise<TrialStatus> {
  try {
    const data = await AsyncStorage.getItem(TRIAL_KEY);
    if (data) {
      const status: TrialStatus = JSON.parse(data);
      
      // Calculate days remaining
      if (status.trialEndDate) {
        const endDate = new Date(status.trialEndDate);
        const now = new Date();
        const daysRemaining = Math.max(
          0,
          Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        );
        status.daysRemaining = daysRemaining;
      }
      
      return status;
    }
    
    return {
      hasUsedTrial: false,
    };
  } catch (error) {
    console.error("Failed to get trial status:", error);
    return {
      hasUsedTrial: false,
    };
  }
}

/**
 * Subscribe to a plan
 */
export async function subscribeToPlan(
  tier: SubscriptionTier,
  paymentMethod: string
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    if (tier === "free") {
      return {
        success: false,
        message: "Cannot subscribe to free plan",
      };
    }
    
    const plan = getSubscriptionPlan(tier);
    const startDate = new Date();
    const nextBillingDate = new Date();
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
    
    // In real implementation, would process payment with Stripe
    // For now, simulate successful payment
    
    const subscription: UserSubscription = {
      tier,
      status: "active",
      startDate: startDate.toISOString(),
      autoRenew: true,
      paymentMethod,
      lastPaymentDate: startDate.toISOString(),
      nextBillingDate: nextBillingDate.toISOString(),
    };
    
    await updateUserSubscription(subscription);
    
    // Add to history
    await addSubscriptionHistory({
      tier,
      action: "subscribed",
      date: startDate.toISOString(),
      amount: plan.price,
    });
    
    return {
      success: true,
      message: `Successfully subscribed to ${plan.name} plan!`,
    };
  } catch (error) {
    console.error("Failed to subscribe:", error);
    return {
      success: false,
      message: `Subscription failed: ${error}`,
    };
  }
}

/**
 * Upgrade subscription
 */
export async function upgradeSubscription(
  newTier: SubscriptionTier
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const currentSubscription = await getUserSubscription();
    const currentPlan = getSubscriptionPlan(currentSubscription.tier);
    const newPlan = getSubscriptionPlan(newTier);
    
    if (newPlan.price <= currentPlan.price) {
      return {
        success: false,
        message: "Cannot upgrade to a lower or same tier",
      };
    }
    
    // Calculate prorated amount
    const proratedAmount = newPlan.price - currentPlan.price;
    
    // In real implementation, would process payment with Stripe
    
    const subscription: UserSubscription = {
      ...currentSubscription,
      tier: newTier,
      status: "active",
    };
    
    await updateUserSubscription(subscription);
    
    // Add to history
    await addSubscriptionHistory({
      tier: newTier,
      action: "upgraded",
      date: new Date().toISOString(),
      amount: proratedAmount,
    });
    
    return {
      success: true,
      message: `Successfully upgraded to ${newPlan.name} plan!`,
    };
  } catch (error) {
    console.error("Failed to upgrade subscription:", error);
    return {
      success: false,
      message: `Upgrade failed: ${error}`,
    };
  }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const subscription = await getUserSubscription();
    
    if (subscription.tier === "free") {
      return {
        success: false,
        message: "Cannot cancel free plan",
      };
    }
    
    // Set to cancel at end of billing period
    const updatedSubscription: UserSubscription = {
      ...subscription,
      status: "cancelled",
      autoRenew: false,
      endDate: subscription.nextBillingDate,
    };
    
    await updateUserSubscription(updatedSubscription);
    
    // Add to history
    await addSubscriptionHistory({
      tier: subscription.tier,
      action: "cancelled",
      date: new Date().toISOString(),
    });
    
    return {
      success: true,
      message: "Subscription cancelled. You can continue using until the end of your billing period.",
    };
  } catch (error) {
    console.error("Failed to cancel subscription:", error);
    return {
      success: false,
      message: `Cancellation failed: ${error}`,
    };
  }
}

/**
 * Get subscription history
 */
export async function getSubscriptionHistory(): Promise<SubscriptionHistory[]> {
  try {
    const data = await AsyncStorage.getItem(SUBSCRIPTION_HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to get subscription history:", error);
    return [];
  }
}

/**
 * Add subscription history entry
 */
async function addSubscriptionHistory(
  entry: Omit<SubscriptionHistory, "id">
): Promise<void> {
  try {
    const history = await getSubscriptionHistory();
    
    const newEntry: SubscriptionHistory = {
      ...entry,
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    
    history.push(newEntry);
    
    await AsyncStorage.setItem(SUBSCRIPTION_HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error("Failed to add subscription history:", error);
    throw error;
  }
}

/**
 * Get subscription statistics
 */
export async function getSubscriptionStatistics(): Promise<{
  currentTier: SubscriptionTier;
  status: string;
  daysRemaining?: number;
  totalSpent: number;
  subscriptionDuration: number; // days
}> {
  const subscription = await getUserSubscription();
  const history = await getSubscriptionHistory();
  
  // Calculate total spent
  const totalSpent = history.reduce((sum, entry) => sum + (entry.amount || 0), 0);
  
  // Calculate subscription duration
  const startDate = new Date(subscription.startDate);
  const now = new Date();
  const subscriptionDuration = Math.floor(
    (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  // Calculate days remaining for trial or cancelled subscriptions
  let daysRemaining: number | undefined;
  if (subscription.endDate) {
    const endDate = new Date(subscription.endDate);
    daysRemaining = Math.max(
      0,
      Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    );
  }
  
  return {
    currentTier: subscription.tier,
    status: subscription.status,
    daysRemaining,
    totalSpent,
    subscriptionDuration,
  };
}

/**
 * Check if subscription needs renewal
 */
export async function checkSubscriptionRenewal(): Promise<{
  needsRenewal: boolean;
  daysUntilExpiry?: number;
}> {
  const subscription = await getUserSubscription();
  
  if (!subscription.nextBillingDate) {
    return { needsRenewal: false };
  }
  
  const nextBilling = new Date(subscription.nextBillingDate);
  const now = new Date();
  const daysUntilExpiry = Math.ceil(
    (nextBilling.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  // Notify if less than 3 days until renewal
  return {
    needsRenewal: daysUntilExpiry <= 3 && daysUntilExpiry > 0,
    daysUntilExpiry,
  };
}

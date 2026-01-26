import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Analytics Integration with Mixpanel
 * Tracks user behavior, events, and properties for product analytics
 */

const ANALYTICS_SETTINGS_KEY = "analytics_settings";
const ANALYTICS_QUEUE_KEY = "analytics_queue";

export interface AnalyticsSettings {
  enabled: boolean;
  userId?: string;
  distinctId?: string;
  optedOut: boolean;
  trackingConsent: boolean;
}

export interface UserProperties {
  $name?: string;
  $email?: string;
  $created?: string;
  subscription_tier?: "free" | "pro" | "family";
  usage_frequency?: "daily" | "weekly" | "monthly";
  onboarding_completed?: boolean;
  features_used?: string[];
  last_active?: string;
  [key: string]: any;
}

export interface EventProperties {
  [key: string]: string | number | boolean | undefined;
}

export interface AnalyticsEvent {
  event: string;
  properties?: EventProperties;
  timestamp: string;
}

/**
 * Initialize analytics
 */
export async function initializeAnalytics(userId?: string): Promise<void> {
  try {
    const settings = await getAnalyticsSettings();
    
    if (!settings.distinctId) {
      // Generate distinct ID
      const distinctId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await updateAnalyticsSettings({ distinctId, userId });
    }
    
    console.log("Analytics initialized");
    
    // Track app open
    await trackEvent("App Opened");
  } catch (error) {
    console.error("Failed to initialize analytics:", error);
  }
}

/**
 * Get analytics settings
 */
export async function getAnalyticsSettings(): Promise<AnalyticsSettings> {
  try {
    const data = await AsyncStorage.getItem(ANALYTICS_SETTINGS_KEY);
    
    if (data) {
      return JSON.parse(data);
    }
    
    // Default settings
    return {
      enabled: true,
      optedOut: false,
      trackingConsent: false, // User must explicitly opt in
    };
  } catch (error) {
    console.error("Failed to get analytics settings:", error);
    return {
      enabled: false,
      optedOut: true,
      trackingConsent: false,
    };
  }
}

/**
 * Update analytics settings
 */
export async function updateAnalyticsSettings(
  updates: Partial<AnalyticsSettings>
): Promise<void> {
  try {
    const settings = await getAnalyticsSettings();
    const updated = { ...settings, ...updates };
    await AsyncStorage.setItem(ANALYTICS_SETTINGS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to update analytics settings:", error);
    throw error;
  }
}

/**
 * Opt in to analytics tracking
 */
export async function optInToAnalytics(): Promise<void> {
  await updateAnalyticsSettings({
    enabled: true,
    optedOut: false,
    trackingConsent: true,
  });
  
  await trackEvent("Analytics Opted In");
}

/**
 * Opt out of analytics tracking
 */
export async function optOutOfAnalytics(): Promise<void> {
  await updateAnalyticsSettings({
    enabled: false,
    optedOut: true,
    trackingConsent: false,
  });
  
  // Clear queued events
  await AsyncStorage.setItem(ANALYTICS_QUEUE_KEY, JSON.stringify([]));
}

/**
 * Track event
 */
export async function trackEvent(
  eventName: string,
  properties?: EventProperties
): Promise<void> {
  try {
    const settings = await getAnalyticsSettings();
    
    if (!settings.enabled || settings.optedOut || !settings.trackingConsent) {
      return;
    }
    
    const event: AnalyticsEvent = {
      event: eventName,
      properties: {
        ...properties,
        distinct_id: settings.distinctId,
        user_id: settings.userId,
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    };
    
    // Queue event
    await queueEvent(event);
    
    // In production, would send to Mixpanel API
    console.log("Event tracked:", eventName, properties);
  } catch (error) {
    console.error("Failed to track event:", error);
  }
}

/**
 * Set user properties
 */
export async function setUserProperties(properties: UserProperties): Promise<void> {
  try {
    const settings = await getAnalyticsSettings();
    
    if (!settings.enabled || settings.optedOut || !settings.trackingConsent) {
      return;
    }
    
    // In production, would send to Mixpanel People API
    console.log("User properties set:", properties);
    
    await trackEvent("User Properties Updated", properties as EventProperties);
  } catch (error) {
    console.error("Failed to set user properties:", error);
  }
}

/**
 * Identify user
 */
export async function identifyUser(userId: string, properties?: UserProperties): Promise<void> {
  try {
    await updateAnalyticsSettings({ userId });
    
    if (properties) {
      await setUserProperties(properties);
    }
    
    await trackEvent("User Identified", { user_id: userId });
  } catch (error) {
    console.error("Failed to identify user:", error);
  }
}

/**
 * Track screen view
 */
export async function trackScreenView(screenName: string, properties?: EventProperties): Promise<void> {
  await trackEvent("Screen Viewed", {
    screen_name: screenName,
    ...properties,
  });
}

/**
 * Track button click
 */
export async function trackButtonClick(buttonName: string, properties?: EventProperties): Promise<void> {
  await trackEvent("Button Clicked", {
    button_name: buttonName,
    ...properties,
  });
}

/**
 * Track feature usage
 */
export async function trackFeatureUsage(featureName: string, properties?: EventProperties): Promise<void> {
  await trackEvent("Feature Used", {
    feature_name: featureName,
    ...properties,
  });
}

/**
 * Track subscription event
 */
export async function trackSubscription(
  action: "started" | "completed" | "cancelled" | "renewed",
  tier: "free" | "pro" | "family",
  properties?: EventProperties
): Promise<void> {
  await trackEvent(`Subscription ${action}`, {
    subscription_tier: tier,
    ...properties,
  });
  
  // Update user property
  await setUserProperties({ subscription_tier: tier });
}

/**
 * Track onboarding progress
 */
export async function trackOnboardingStep(
  step: number,
  stepName: string,
  completed: boolean
): Promise<void> {
  await trackEvent("Onboarding Step", {
    step_number: step,
    step_name: stepName,
    completed,
  });
  
  if (completed && step === 100) {
    // Final step
    await setUserProperties({ onboarding_completed: true });
  }
}

/**
 * Track error
 */
export async function trackError(
  errorName: string,
  errorMessage: string,
  properties?: EventProperties
): Promise<void> {
  await trackEvent("Error Occurred", {
    error_name: errorName,
    error_message: errorMessage,
    ...properties,
  });
}

/**
 * Queue event for batch sending
 */
async function queueEvent(event: AnalyticsEvent): Promise<void> {
  try {
    const data = await AsyncStorage.getItem(ANALYTICS_QUEUE_KEY);
    const queue: AnalyticsEvent[] = data ? JSON.parse(data) : [];
    
    queue.push(event);
    
    await AsyncStorage.setItem(ANALYTICS_QUEUE_KEY, JSON.stringify(queue));
    
    // If queue is large, flush it
    if (queue.length >= 10) {
      await flushEvents();
    }
  } catch (error) {
    console.error("Failed to queue event:", error);
  }
}

/**
 * Flush queued events
 */
export async function flushEvents(): Promise<void> {
  try {
    const data = await AsyncStorage.getItem(ANALYTICS_QUEUE_KEY);
    const queue: AnalyticsEvent[] = data ? JSON.parse(data) : [];
    
    if (queue.length === 0) {
      return;
    }
    
    // In production, would send batch to Mixpanel API
    console.log(`Flushing ${queue.length} events to Mixpanel`);
    
    // Clear queue
    await AsyncStorage.setItem(ANALYTICS_QUEUE_KEY, JSON.stringify([]));
  } catch (error) {
    console.error("Failed to flush events:", error);
  }
}

/**
 * Get analytics data for debugging
 */
export async function getAnalyticsDebugInfo(): Promise<{
  settings: AnalyticsSettings;
  queuedEvents: number;
  lastEvent?: AnalyticsEvent;
}> {
  try {
    const settings = await getAnalyticsSettings();
    const data = await AsyncStorage.getItem(ANALYTICS_QUEUE_KEY);
    const queue: AnalyticsEvent[] = data ? JSON.parse(data) : [];
    
    return {
      settings,
      queuedEvents: queue.length,
      lastEvent: queue[queue.length - 1],
    };
  } catch (error) {
    console.error("Failed to get analytics debug info:", error);
    return {
      settings: {
        enabled: false,
        optedOut: true,
        trackingConsent: false,
      },
      queuedEvents: 0,
    };
  }
}

/**
 * Funnel tracking
 */
export interface FunnelStep {
  name: string;
  completed: boolean;
  timestamp?: string;
}

export async function trackFunnel(
  funnelName: string,
  steps: FunnelStep[]
): Promise<void> {
  for (const step of steps) {
    await trackEvent(`Funnel: ${funnelName}`, {
      step_name: step.name,
      completed: step.completed,
      funnel_name: funnelName,
    });
  }
}

/**
 * A/B test tracking
 */
export async function trackABTest(
  testName: string,
  variant: string,
  properties?: EventProperties
): Promise<void> {
  await trackEvent("AB Test Viewed", {
    test_name: testName,
    variant,
    ...properties,
  });
  
  // Store variant for user
  await setUserProperties({
    [`ab_test_${testName}`]: variant,
  });
}

/**
 * Cohort analysis helpers
 */
export async function trackCohort(cohortName: string): Promise<void> {
  await setUserProperties({
    cohort: cohortName,
    cohort_joined_date: new Date().toISOString(),
  });
}

/**
 * Revenue tracking
 */
export async function trackRevenue(
  amount: number,
  currency: string = "USD",
  properties?: EventProperties
): Promise<void> {
  await trackEvent("Revenue", {
    amount,
    currency,
    ...properties,
  });
}

/**
 * Retention tracking
 */
export async function trackRetention(daysActive: number): Promise<void> {
  await setUserProperties({
    days_active: daysActive,
    last_active: new Date().toISOString(),
  });
}

/**
 * Common event tracking helpers
 */
export const Analytics = {
  // App lifecycle
  appOpened: () => trackEvent("App Opened"),
  appClosed: () => trackEvent("App Closed"),
  appBackgrounded: () => trackEvent("App Backgrounded"),
  appForegrounded: () => trackEvent("App Foregrounded"),
  
  // User actions
  signUp: (method: string) => trackEvent("Sign Up", { method }),
  signIn: (method: string) => trackEvent("Sign In", { method }),
  signOut: () => trackEvent("Sign Out"),
  
  // Content
  contentViewed: (contentType: string, contentId: string) =>
    trackEvent("Content Viewed", { content_type: contentType, content_id: contentId }),
  contentShared: (contentType: string, contentId: string, method: string) =>
    trackEvent("Content Shared", { content_type: contentType, content_id: contentId, method }),
  
  // Engagement
  searchPerformed: (query: string, results: number) =>
    trackEvent("Search Performed", { query, results_count: results }),
  filterApplied: (filterType: string, filterValue: string) =>
    trackEvent("Filter Applied", { filter_type: filterType, filter_value: filterValue }),
  
  // Commerce
  productViewed: (productId: string, productName: string, price: number) =>
    trackEvent("Product Viewed", { product_id: productId, product_name: productName, price }),
  addToCart: (productId: string, quantity: number) =>
    trackEvent("Add to Cart", { product_id: productId, quantity }),
  checkoutStarted: (cartValue: number, itemCount: number) =>
    trackEvent("Checkout Started", { cart_value: cartValue, item_count: itemCount }),
  purchaseCompleted: (orderId: string, revenue: number, itemCount: number) =>
    trackEvent("Purchase Completed", { order_id: orderId, revenue, item_count: itemCount }),
  
  // Social
  friendAdded: (friendId: string) => trackEvent("Friend Added", { friend_id: friendId }),
  messagesSent: (recipientId: string) => trackEvent("Message Sent", { recipient_id: recipientId }),
  postCreated: (postType: string) => trackEvent("Post Created", { post_type: postType }),
  
  // Settings
  settingChanged: (settingName: string, newValue: string) =>
    trackEvent("Setting Changed", { setting_name: settingName, new_value: newValue }),
  notificationEnabled: (notificationType: string) =>
    trackEvent("Notification Enabled", { notification_type: notificationType }),
  
  // Errors
  errorOccurred: (errorName: string, errorMessage: string) =>
    trackError(errorName, errorMessage),
};

/**
 * Clear all analytics data
 */
export async function clearAnalyticsData(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ANALYTICS_SETTINGS_KEY);
    await AsyncStorage.removeItem(ANALYTICS_QUEUE_KEY);
    console.log("Analytics data cleared");
  } catch (error) {
    console.error("Failed to clear analytics data:", error);
  }
}

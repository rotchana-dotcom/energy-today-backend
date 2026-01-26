import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Sharing from "expo-sharing";
import { captureRef } from "react-native-view-shot";

const FEEDBACK_KEY = "user_feedback";
const FEEDBACK_SETTINGS_KEY = "feedback_settings";

export type FeedbackType = "bug" | "feature" | "general" | "nps" | "satisfaction";

export interface Feedback {
  id: string;
  type: FeedbackType;
  rating?: number; // 1-5 for satisfaction, 0-10 for NPS
  title?: string;
  description: string;
  screenshot?: string; // base64 or file path
  userEmail?: string;
  deviceInfo: {
    platform: string;
    version: string;
    model?: string;
  };
  appVersion: string;
  timestamp: string;
  status: "pending" | "submitted" | "acknowledged";
  tags?: string[];
}

export interface NPSSurvey {
  score: number; // 0-10
  reason?: string;
  timestamp: string;
}

export interface SatisfactionSurvey {
  feature: string;
  rating: number; // 1-5
  comments?: string;
  timestamp: string;
}

export interface FeedbackSettings {
  enabled: boolean;
  autoPrompt: boolean;
  promptFrequency: "always" | "once_per_session" | "once_per_day" | "once_per_week";
  lastPromptDate?: string;
  promptTriggers: {
    afterOnboarding: boolean;
    afterSubscription: boolean;
    afterKeyFeatureUse: boolean;
    afterNDays: number; // e.g., 7, 14, 30
  };
}

/**
 * Get feedback settings
 */
export async function getFeedbackSettings(): Promise<FeedbackSettings> {
  try {
    const data = await AsyncStorage.getItem(FEEDBACK_SETTINGS_KEY);
    
    if (data) {
      return JSON.parse(data);
    }
    
    // Default settings
    return {
      enabled: true,
      autoPrompt: true,
      promptFrequency: "once_per_week",
      promptTriggers: {
        afterOnboarding: true,
        afterSubscription: true,
        afterKeyFeatureUse: false,
        afterNDays: 7,
      },
    };
  } catch (error) {
    console.error("Failed to get feedback settings:", error);
    return {
      enabled: true,
      autoPrompt: false,
      promptFrequency: "once_per_week",
      promptTriggers: {
        afterOnboarding: false,
        afterSubscription: false,
        afterKeyFeatureUse: false,
        afterNDays: 30,
      },
    };
  }
}

/**
 * Update feedback settings
 */
export async function updateFeedbackSettings(
  updates: Partial<FeedbackSettings>
): Promise<void> {
  try {
    const settings = await getFeedbackSettings();
    const updated = { ...settings, ...updates };
    await AsyncStorage.setItem(FEEDBACK_SETTINGS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to update feedback settings:", error);
    throw error;
  }
}

/**
 * Check if should show feedback prompt
 */
export async function shouldShowFeedbackPrompt(trigger?: string): Promise<boolean> {
  try {
    const settings = await getFeedbackSettings();
    
    if (!settings.enabled || !settings.autoPrompt) {
      return false;
    }
    
    // Check frequency
    if (settings.lastPromptDate) {
      const lastPrompt = new Date(settings.lastPromptDate);
      const now = new Date();
      const daysSinceLastPrompt = Math.floor(
        (now.getTime() - lastPrompt.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      switch (settings.promptFrequency) {
        case "once_per_day":
          if (daysSinceLastPrompt < 1) return false;
          break;
        case "once_per_week":
          if (daysSinceLastPrompt < 7) return false;
          break;
        case "once_per_session":
          // Would need session tracking
          break;
      }
    }
    
    // Check trigger
    if (trigger) {
      switch (trigger) {
        case "onboarding":
          return settings.promptTriggers.afterOnboarding;
        case "subscription":
          return settings.promptTriggers.afterSubscription;
        case "key_feature":
          return settings.promptTriggers.afterKeyFeatureUse;
      }
    }
    
    return true;
  } catch (error) {
    console.error("Failed to check feedback prompt:", error);
    return false;
  }
}

/**
 * Mark feedback prompt as shown
 */
export async function markFeedbackPromptShown(): Promise<void> {
  try {
    await updateFeedbackSettings({
      lastPromptDate: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to mark feedback prompt shown:", error);
  }
}

/**
 * Submit feedback
 */
export async function submitFeedback(feedback: Omit<Feedback, "id" | "timestamp" | "status">): Promise<string> {
  try {
    const feedbackItem: Feedback = {
      ...feedback,
      id: `feedback_${Date.now()}_${Math.random()}`,
      timestamp: new Date().toISOString(),
      status: "pending",
    };
    
    // Store locally
    const data = await AsyncStorage.getItem(FEEDBACK_KEY);
    const feedbackList: Feedback[] = data ? JSON.parse(data) : [];
    feedbackList.push(feedbackItem);
    await AsyncStorage.setItem(FEEDBACK_KEY, JSON.stringify(feedbackList));
    
    // In production, would send to backend API
    // For now, simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // Update status
    feedbackItem.status = "submitted";
    await AsyncStorage.setItem(FEEDBACK_KEY, JSON.stringify(feedbackList));
    
    console.log("Feedback submitted:", feedbackItem.id);
    return feedbackItem.id;
  } catch (error) {
    console.error("Failed to submit feedback:", error);
    throw error;
  }
}

/**
 * Get all feedback
 */
export async function getAllFeedback(filters?: {
  type?: FeedbackType;
  status?: Feedback["status"];
}): Promise<Feedback[]> {
  try {
    const data = await AsyncStorage.getItem(FEEDBACK_KEY);
    let feedback: Feedback[] = data ? JSON.parse(data) : [];
    
    // Apply filters
    if (filters) {
      if (filters.type) {
        feedback = feedback.filter((f) => f.type === filters.type);
      }
      if (filters.status) {
        feedback = feedback.filter((f) => f.status === filters.status);
      }
    }
    
    return feedback.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } catch (error) {
    console.error("Failed to get feedback:", error);
    return [];
  }
}

/**
 * Get feedback by ID
 */
export async function getFeedbackById(id: string): Promise<Feedback | null> {
  try {
    const feedback = await getAllFeedback();
    return feedback.find((f) => f.id === id) || null;
  } catch (error) {
    console.error("Failed to get feedback by ID:", error);
    return null;
  }
}

/**
 * Update feedback status
 */
export async function updateFeedbackStatus(
  id: string,
  status: Feedback["status"]
): Promise<void> {
  try {
    const data = await AsyncStorage.getItem(FEEDBACK_KEY);
    const feedback: Feedback[] = data ? JSON.parse(data) : [];
    
    const index = feedback.findIndex((f) => f.id === id);
    if (index !== -1) {
      feedback[index].status = status;
      await AsyncStorage.setItem(FEEDBACK_KEY, JSON.stringify(feedback));
    }
  } catch (error) {
    console.error("Failed to update feedback status:", error);
    throw error;
  }
}

/**
 * Delete feedback
 */
export async function deleteFeedback(id: string): Promise<void> {
  try {
    const data = await AsyncStorage.getItem(FEEDBACK_KEY);
    const feedback: Feedback[] = data ? JSON.parse(data) : [];
    
    const filtered = feedback.filter((f) => f.id !== id);
    await AsyncStorage.setItem(FEEDBACK_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Failed to delete feedback:", error);
    throw error;
  }
}

/**
 * Capture screenshot for bug report
 */
export async function captureScreenshot(viewRef: any): Promise<string | null> {
  try {
    const uri = await captureRef(viewRef, {
      format: "png",
      quality: 0.8,
    });
    return uri;
  } catch (error) {
    console.error("Failed to capture screenshot:", error);
    return null;
  }
}

/**
 * Submit bug report
 */
export async function submitBugReport(
  title: string,
  description: string,
  screenshot?: string,
  userEmail?: string
): Promise<string> {
  const deviceInfo = {
    platform: "iOS", // Would use Platform.OS
    version: "17.0", // Would use Platform.Version
    model: "iPhone 14 Pro", // Would use Device.modelName
  };
  
  return await submitFeedback({
    type: "bug",
    title,
    description,
    screenshot,
    userEmail,
    deviceInfo,
    appVersion: "1.0.0", // Would get from app.config
  });
}

/**
 * Submit feature request
 */
export async function submitFeatureRequest(
  title: string,
  description: string,
  userEmail?: string
): Promise<string> {
  const deviceInfo = {
    platform: "iOS",
    version: "17.0",
  };
  
  return await submitFeedback({
    type: "feature",
    title,
    description,
    userEmail,
    deviceInfo,
    appVersion: "1.0.0",
  });
}

/**
 * Submit NPS survey
 */
export async function submitNPSSurvey(
  score: number,
  reason?: string
): Promise<string> {
  const deviceInfo = {
    platform: "iOS",
    version: "17.0",
  };
  
  return await submitFeedback({
    type: "nps",
    rating: score,
    description: reason || `NPS Score: ${score}`,
    deviceInfo,
    appVersion: "1.0.0",
  });
}

/**
 * Submit satisfaction survey
 */
export async function submitSatisfactionSurvey(
  feature: string,
  rating: number,
  comments?: string
): Promise<string> {
  const deviceInfo = {
    platform: "iOS",
    version: "17.0",
  };
  
  return await submitFeedback({
    type: "satisfaction",
    title: `Satisfaction: ${feature}`,
    rating,
    description: comments || `Rating: ${rating}/5`,
    deviceInfo,
    appVersion: "1.0.0",
    tags: [feature],
  });
}

/**
 * Get NPS category
 */
export function getNPSCategory(score: number): "promoter" | "passive" | "detractor" {
  if (score >= 9) return "promoter";
  if (score >= 7) return "passive";
  return "detractor";
}

/**
 * Calculate NPS score
 */
export async function calculateNPS(): Promise<{
  score: number;
  promoters: number;
  passives: number;
  detractors: number;
  total: number;
}> {
  try {
    const feedback = await getAllFeedback({ type: "nps" });
    
    if (feedback.length === 0) {
      return {
        score: 0,
        promoters: 0,
        passives: 0,
        detractors: 0,
        total: 0,
      };
    }
    
    let promoters = 0;
    let passives = 0;
    let detractors = 0;
    
    feedback.forEach((f) => {
      if (f.rating !== undefined) {
        const category = getNPSCategory(f.rating);
        if (category === "promoter") promoters++;
        else if (category === "passive") passives++;
        else detractors++;
      }
    });
    
    const total = feedback.length;
    const score = Math.round(((promoters - detractors) / total) * 100);
    
    return {
      score,
      promoters,
      passives,
      detractors,
      total,
    };
  } catch (error) {
    console.error("Failed to calculate NPS:", error);
    return {
      score: 0,
      promoters: 0,
      passives: 0,
      detractors: 0,
      total: 0,
    };
  }
}

/**
 * Get feedback analytics
 */
export async function getFeedbackAnalytics(): Promise<{
  totalFeedback: number;
  byType: Record<FeedbackType, number>;
  byStatus: Record<Feedback["status"], number>;
  averageSatisfaction: number;
  npsScore: number;
  recentFeedback: Feedback[];
}> {
  try {
    const feedback = await getAllFeedback();
    
    const byType: Record<FeedbackType, number> = {
      bug: 0,
      feature: 0,
      general: 0,
      nps: 0,
      satisfaction: 0,
    };
    
    const byStatus: Record<Feedback["status"], number> = {
      pending: 0,
      submitted: 0,
      acknowledged: 0,
    };
    
    let satisfactionSum = 0;
    let satisfactionCount = 0;
    
    feedback.forEach((f) => {
      byType[f.type]++;
      byStatus[f.status]++;
      
      if (f.type === "satisfaction" && f.rating) {
        satisfactionSum += f.rating;
        satisfactionCount++;
      }
    });
    
    const nps = await calculateNPS();
    
    return {
      totalFeedback: feedback.length,
      byType,
      byStatus,
      averageSatisfaction: satisfactionCount > 0 ? satisfactionSum / satisfactionCount : 0,
      npsScore: nps.score,
      recentFeedback: feedback.slice(0, 10),
    };
  } catch (error) {
    console.error("Failed to get feedback analytics:", error);
    return {
      totalFeedback: 0,
      byType: { bug: 0, feature: 0, general: 0, nps: 0, satisfaction: 0 },
      byStatus: { pending: 0, submitted: 0, acknowledged: 0 },
      averageSatisfaction: 0,
      npsScore: 0,
      recentFeedback: [],
    };
  }
}

/**
 * Export feedback to CSV
 */
export async function exportFeedbackToCSV(): Promise<string> {
  try {
    const feedback = await getAllFeedback();
    
    let csv = "ID,Type,Rating,Title,Description,Timestamp,Status\n";
    
    feedback.forEach((f) => {
      csv += `"${f.id}","${f.type}","${f.rating || ""}","${f.title || ""}","${f.description.replace(/"/g, '""')}","${f.timestamp}","${f.status}"\n`;
    });
    
    return csv;
  } catch (error) {
    console.error("Failed to export feedback to CSV:", error);
    throw error;
  }
}

/**
 * Share feedback report
 */
export async function shareFeedbackReport(): Promise<void> {
  try {
    const csv = await exportFeedbackToCSV();
    
    // In production, would save to file and share
    // For now, log the CSV
    console.log("Feedback Report CSV:", csv);
    
    // Would use Sharing.shareAsync() with file URI
  } catch (error) {
    console.error("Failed to share feedback report:", error);
    throw error;
  }
}

/**
 * Clear all feedback
 */
export async function clearAllFeedback(): Promise<void> {
  try {
    await AsyncStorage.setItem(FEEDBACK_KEY, JSON.stringify([]));
  } catch (error) {
    console.error("Failed to clear feedback:", error);
    throw error;
  }
}

/**
 * Get feedback statistics
 */
export async function getFeedbackStatistics(): Promise<{
  last7Days: number;
  last30Days: number;
  bugReports: number;
  featureRequests: number;
  responseRate: number; // percentage of feedback acknowledged
}> {
  try {
    const feedback = await getAllFeedback();
    const now = new Date();
    
    const last7Days = feedback.filter((f) => {
      const date = new Date(f.timestamp);
      const daysDiff = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 7;
    }).length;
    
    const last30Days = feedback.filter((f) => {
      const date = new Date(f.timestamp);
      const daysDiff = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 30;
    }).length;
    
    const bugReports = feedback.filter((f) => f.type === "bug").length;
    const featureRequests = feedback.filter((f) => f.type === "feature").length;
    
    const acknowledged = feedback.filter((f) => f.status === "acknowledged").length;
    const responseRate = feedback.length > 0 ? (acknowledged / feedback.length) * 100 : 0;
    
    return {
      last7Days,
      last30Days,
      bugReports,
      featureRequests,
      responseRate,
    };
  } catch (error) {
    console.error("Failed to get feedback statistics:", error);
    return {
      last7Days: 0,
      last30Days: 0,
      bugReports: 0,
      featureRequests: 0,
      responseRate: 0,
    };
  }
}

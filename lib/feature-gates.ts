/**
 * Feature Gates
 * Centralized Pro feature access control
 */

import { isProUser } from "./storage";

export interface FeatureGateResult {
  allowed: boolean;
  reason?: string;
  upgradeMessage?: string;
}

/**
 * Check if user can access Pro feature
 */
export async function canAccessProFeature(featureName: string): Promise<FeatureGateResult> {
  const isPro = await isProUser();
  
  if (isPro) {
    return { allowed: true };
  }
  
  return {
    allowed: false,
    reason: "pro_required",
    upgradeMessage: getUpgradeMessage(featureName),
  };
}

/**
 * Get upgrade message for specific feature
 */
function getUpgradeMessage(featureName: string): string {
  const messages: Record<string, string> = {
    // Wellness Features
    meditation: "Unlock guided meditation sessions with Energy Today Pro",
    stress_management: "Access breathing exercises and stress tools with Pro",
    mood_tracking: "Track detailed moods and emotions with Pro",
    relationship_tracking: "Monitor social energy impact with Pro",
    financial_wellness: "Manage financial stress with Pro",
    career_energy: "Optimize work-life balance with Pro",
    
    // AI Features
    ai_assistant: "Get proactive AI suggestions with Pro",
    smart_scheduling: "Optimize your schedule with AI with Pro",
    auto_journaling: "Generate automatic journals with Pro",
    ai_coaching_evolution: "Unlock adaptive AI coaching with Pro",
    
    // Integrations
    voice_assistant: "Use voice commands with Pro",
    email_integration: "Get email digests with Pro",
    
    // Analytics
    revenue_analytics: "View revenue analytics with Pro",
    advanced_analytics: "Access advanced analytics with Pro",
    
    // Content
    ugc_create: "Create and share content with Pro",
    
    // Admin
    admin_dashboard: "Access admin dashboard with Pro",
    cms: "Manage content with Pro",
  };
  
  return messages[featureName] || "Upgrade to Energy Today Pro to unlock this feature";
}

/**
 * Pro-only feature list
 */
export const PRO_FEATURES = {
  // Wellness (Phases 163-168)
  MEDITATION: "meditation",
  STRESS_MANAGEMENT: "stress_management",
  MOOD_TRACKING: "mood_tracking",
  RELATIONSHIP_TRACKING: "relationship_tracking",
  FINANCIAL_WELLNESS: "financial_wellness",
  CAREER_ENERGY: "career_energy",
  
  // AI Features (Phases 169-171, 174)
  AI_ASSISTANT: "ai_assistant",
  SMART_SCHEDULING: "smart_scheduling",
  AUTO_JOURNALING: "auto_journaling",
  AI_COACHING_EVOLUTION: "ai_coaching_evolution",
  
  // Integrations (Phases 141, 143)
  VOICE_ASSISTANT: "voice_assistant",
  EMAIL_INTEGRATION: "email_integration",
  
  // Analytics (Phase 150)
  REVENUE_ANALYTICS: "revenue_analytics",
  ADVANCED_ANALYTICS: "advanced_analytics",
  
  // Content (Phase 158)
  UGC_CREATE: "ugc_create",
  
  // Admin (Phases 133-134)
  ADMIN_DASHBOARD: "admin_dashboard",
  CMS: "cms",
  
  // Existing Pro Features
  AI_COACHING: "ai_coaching",
  UNLIMITED_HABITS: "unlimited_habits",
  EXPORT_DATA: "export_data",
  SOCIAL_FEATURES: "social_features",
  ADVANCED_REPORTS: "advanced_reports",
} as const;

/**
 * Check specific Pro features
 */
export async function canAccessMeditation(): Promise<FeatureGateResult> {
  return canAccessProFeature(PRO_FEATURES.MEDITATION);
}

export async function canAccessStressManagement(): Promise<FeatureGateResult> {
  return canAccessProFeature(PRO_FEATURES.STRESS_MANAGEMENT);
}

export async function canAccessMoodTracking(): Promise<FeatureGateResult> {
  return canAccessProFeature(PRO_FEATURES.MOOD_TRACKING);
}

export async function canAccessRelationshipTracking(): Promise<FeatureGateResult> {
  return canAccessProFeature(PRO_FEATURES.RELATIONSHIP_TRACKING);
}

export async function canAccessFinancialWellness(): Promise<FeatureGateResult> {
  return canAccessProFeature(PRO_FEATURES.FINANCIAL_WELLNESS);
}

export async function canAccessCareerEnergy(): Promise<FeatureGateResult> {
  return canAccessProFeature(PRO_FEATURES.CAREER_ENERGY);
}

export async function canAccessAIAssistant(): Promise<FeatureGateResult> {
  return canAccessProFeature(PRO_FEATURES.AI_ASSISTANT);
}

export async function canAccessSmartScheduling(): Promise<FeatureGateResult> {
  return canAccessProFeature(PRO_FEATURES.SMART_SCHEDULING);
}

export async function canAccessAutoJournaling(): Promise<FeatureGateResult> {
  return canAccessProFeature(PRO_FEATURES.AUTO_JOURNALING);
}

export async function canAccessAICoachingEvolution(): Promise<FeatureGateResult> {
  return canAccessProFeature(PRO_FEATURES.AI_COACHING_EVOLUTION);
}

export async function canAccessVoiceAssistant(): Promise<FeatureGateResult> {
  return canAccessProFeature(PRO_FEATURES.VOICE_ASSISTANT);
}

export async function canAccessEmailIntegration(): Promise<FeatureGateResult> {
  return canAccessProFeature(PRO_FEATURES.EMAIL_INTEGRATION);
}

export async function canAccessRevenueAnalytics(): Promise<FeatureGateResult> {
  return canAccessProFeature(PRO_FEATURES.REVENUE_ANALYTICS);
}

export async function canCreateUserContent(): Promise<FeatureGateResult> {
  return canAccessProFeature(PRO_FEATURES.UGC_CREATE);
}

export async function canAccessAdminDashboard(): Promise<FeatureGateResult> {
  return canAccessProFeature(PRO_FEATURES.ADMIN_DASHBOARD);
}

export async function canAccessCMS(): Promise<FeatureGateResult> {
  return canAccessProFeature(PRO_FEATURES.CMS);
}

/**
 * Get all locked features for free user
 */
export async function getLockedFeatures(): Promise<string[]> {
  const isPro = await isProUser();
  
  if (isPro) return [];
  
  return Object.values(PRO_FEATURES);
}

/**
 * Get Pro feature count
 */
export function getProFeatureCount(): number {
  return Object.keys(PRO_FEATURES).length;
}

/**
 * Check if feature name is Pro-only
 */
export function isProOnlyFeature(featureName: string): boolean {
  return Object.values(PRO_FEATURES).includes(featureName as any);
}

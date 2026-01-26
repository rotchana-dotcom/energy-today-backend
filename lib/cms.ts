/**
 * Content Management System
 * Dynamic content updates without app releases
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { canAccessCMS } from "./feature-gates";

const STORAGE_KEY = "cms_content";

export interface CMSContent {
  id: string;
  type: "article" | "tip" | "banner" | "notification" | "feature_flag";
  title: string;
  content: string;
  metadata: Record<string, any>;
  status: "draft" | "published" | "archived";
  publishedAt?: Date;
  expiresAt?: Date;
  targetAudience?: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FeatureFlag {
  id: string;
  name: string;
  enabled: boolean;
  rolloutPercentage: number;
  targetUsers?: string[];
  targetPlans?: string[];
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Get all published content
 */
export async function getPublishedContent(type?: CMSContent["type"]): Promise<CMSContent[]> {
  const key = STORAGE_KEY;
  const data = await AsyncStorage.getItem(key);
  
  if (!data) return [];
  
  const content: CMSContent[] = JSON.parse(data).map((item: any) => ({
    ...item,
    createdAt: new Date(item.createdAt),
    updatedAt: new Date(item.updatedAt),
    publishedAt: item.publishedAt ? new Date(item.publishedAt) : undefined,
    expiresAt: item.expiresAt ? new Date(item.expiresAt) : undefined,
  }));
  
  const now = new Date();
  
  return content.filter(item => {
    if (item.status !== "published") return false;
    if (item.expiresAt && item.expiresAt < now) return false;
    if (type && item.type !== type) return false;
    return true;
  });
}

/**
 * Create content
 */
export async function createContent(
  content: Omit<CMSContent, "id" | "createdAt" | "updatedAt">
): Promise<CMSContent> {
  const access = await canAccessCMS();
  if (!access.allowed) {
    throw new Error(access.upgradeMessage || "Pro subscription required");
  }
  
  const key = STORAGE_KEY;
  const data = await AsyncStorage.getItem(key);
  const existing: CMSContent[] = data ? JSON.parse(data) : [];
  
  const newContent: CMSContent = {
    ...content,
    id: Date.now().toString(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  existing.push(newContent);
  await AsyncStorage.setItem(key, JSON.stringify(existing));
  
  return newContent;
}

/**
 * Update content
 */
export async function updateContent(
  id: string,
  updates: Partial<CMSContent>
): Promise<CMSContent> {
  const key = STORAGE_KEY;
  const data = await AsyncStorage.getItem(key);
  const content: CMSContent[] = data ? JSON.parse(data) : [];
  
  const index = content.findIndex(item => item.id === id);
  if (index === -1) throw new Error("Content not found");
  
  content[index] = {
    ...content[index],
    ...updates,
    updatedAt: new Date(),
  };
  
  await AsyncStorage.setItem(key, JSON.stringify(content));
  return content[index];
}

/**
 * Delete content
 */
export async function deleteContent(id: string): Promise<void> {
  const key = STORAGE_KEY;
  const data = await AsyncStorage.getItem(key);
  const content: CMSContent[] = data ? JSON.parse(data) : [];
  
  const filtered = content.filter(item => item.id !== id);
  await AsyncStorage.setItem(key, JSON.stringify(filtered));
}

/**
 * Get feature flags
 */
export async function getFeatureFlags(): Promise<FeatureFlag[]> {
  const key = `${STORAGE_KEY}_flags`;
  const data = await AsyncStorage.getItem(key);
  
  if (!data) return getDefaultFeatureFlags();
  
  return JSON.parse(data).map((flag: any) => ({
    ...flag,
    createdAt: new Date(flag.createdAt),
    updatedAt: new Date(flag.updatedAt),
  }));
}

/**
 * Check if feature is enabled for user
 */
export async function isFeatureEnabled(
  featureName: string,
  userId?: string,
  userPlan?: string
): Promise<boolean> {
  const flags = await getFeatureFlags();
  const flag = flags.find(f => f.name === featureName);
  
  if (!flag) return false;
  if (!flag.enabled) return false;
  
  // Check target users
  if (flag.targetUsers && flag.targetUsers.length > 0) {
    if (!userId || !flag.targetUsers.includes(userId)) return false;
  }
  
  // Check target plans
  if (flag.targetPlans && flag.targetPlans.length > 0) {
    if (!userPlan || !flag.targetPlans.includes(userPlan)) return false;
  }
  
  // Check rollout percentage
  if (flag.rolloutPercentage < 100) {
    const hash = userId ? simpleHash(userId) : Math.random();
    return hash < flag.rolloutPercentage / 100;
  }
  
  return true;
}

/**
 * Update feature flag
 */
export async function updateFeatureFlag(
  name: string,
  updates: Partial<FeatureFlag>
): Promise<void> {
  const key = `${STORAGE_KEY}_flags`;
  const flags = await getFeatureFlags();
  
  const index = flags.findIndex(f => f.name === name);
  if (index === -1) throw new Error("Feature flag not found");
  
  flags[index] = {
    ...flags[index],
    ...updates,
    updatedAt: new Date(),
  };
  
  await AsyncStorage.setItem(key, JSON.stringify(flags));
}

/**
 * Simple hash function for consistent rollout
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash) / 2147483647;
}

/**
 * Get default feature flags
 */
function getDefaultFeatureFlags(): FeatureFlag[] {
  return [
    {
      id: "1",
      name: "ai_coaching",
      enabled: true,
      rolloutPercentage: 100,
      targetPlans: ["pro", "family"],
      description: "AI coaching chatbot",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "2",
      name: "voice_journal",
      enabled: true,
      rolloutPercentage: 100,
      description: "Voice journal entries",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "3",
      name: "social_features",
      enabled: true,
      rolloutPercentage: 100,
      description: "Energy circles and challenges",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "4",
      name: "advanced_analytics",
      enabled: true,
      rolloutPercentage: 100,
      targetPlans: ["pro", "family"],
      description: "Advanced analytics and reports",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
}

/**
 * Get daily tips
 */
export async function getDailyTip(): Promise<CMSContent | null> {
  const tips = await getPublishedContent("tip");
  if (tips.length === 0) return null;
  
  // Return random tip
  return tips[Math.floor(Math.random() * tips.length)];
}

/**
 * Get active banners
 */
export async function getActiveBanners(): Promise<CMSContent[]> {
  return getPublishedContent("banner");
}

/**
 * Sync content from server
 */
export async function syncContentFromServer(): Promise<void> {
  // In production, fetch from API
  // For now, initialize with default content
  const existing = await AsyncStorage.getItem(STORAGE_KEY);
  if (existing) return;
  
  const defaultContent: CMSContent[] = [
    {
      id: "tip_1",
      type: "tip",
      title: "Morning Energy Boost",
      content: "Get 10 minutes of sunlight within 30 minutes of waking to set your circadian rhythm and boost morning energy.",
      metadata: { category: "energy", difficulty: "easy" },
      status: "published",
      publishedAt: new Date(),
      createdBy: "system",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "tip_2",
      type: "tip",
      title: "Afternoon Slump Solution",
      content: "Take a 5-minute walk instead of reaching for coffee during your afternoon energy dip. Movement is more effective than caffeine.",
      metadata: { category: "energy", difficulty: "easy" },
      status: "published",
      publishedAt: new Date(),
      createdBy: "system",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
  
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(defaultContent));
}

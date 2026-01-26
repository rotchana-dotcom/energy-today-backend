/**
 * Advanced Features
 * Revenue analytics and user-generated content
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { canAccessRevenueAnalytics, canCreateUserContent } from "./feature-gates";

const STORAGE_KEY = "advanced_features";

// ============================================================================
// Revenue Analytics (Phase 150)
// ============================================================================

export interface RevenueMetrics {
  mrr: number; // Monthly Recurring Revenue
  arr: number; // Annual Recurring Revenue
  ltv: number; // Lifetime Value
  cac: number; // Customer Acquisition Cost
  churnRate: number;
  netRevenue: number;
  grossRevenue: number;
  refunds: number;
}

export interface RevenueByPlan {
  plan: string;
  revenue: number;
  users: number;
  avgRevenuePerUser: number;
}

export interface RevenueTrend {
  date: Date;
  revenue: number;
  newRevenue: number;
  churnedRevenue: number;
  expansionRevenue: number;
}

/**
 * Get revenue metrics
 */
export async function getRevenueMetrics(): Promise<RevenueMetrics> {
  const access = await canAccessRevenueAnalytics();
  if (!access.allowed) {
    throw new Error(access.upgradeMessage || "Pro subscription required");
  }
  
  // Mock data - replace with actual analytics
  return {
    mrr: 34567,
    arr: 414804,
    ltv: 287,
    cac: 45,
    churnRate: 0.05,
    netRevenue: 32890,
    grossRevenue: 34567,
    refunds: 1677,
  };
}

/**
 * Get revenue by plan
 */
export async function getRevenueByPlan(): Promise<RevenueByPlan[]> {
  return [
    {
      plan: "Pro",
      revenue: 25650,
      users: 2567,
      avgRevenuePerUser: 9.99,
    },
    {
      plan: "Family",
      revenue: 17078,
      users: 854,
      avgRevenuePerUser: 19.99,
    },
  ];
}

/**
 * Get revenue trend
 */
export async function getRevenueTrend(days: number = 30): Promise<RevenueTrend[]> {
  const trend: RevenueTrend[] = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    trend.push({
      date,
      revenue: 1000 + Math.random() * 500,
      newRevenue: 200 + Math.random() * 100,
      churnedRevenue: 50 + Math.random() * 30,
      expansionRevenue: 100 + Math.random() * 50,
    });
  }
  
  return trend;
}

/**
 * Calculate LTV
 */
export function calculateLTV(
  avgRevenuePerUser: number,
  avgCustomerLifespan: number
): number {
  return avgRevenuePerUser * avgCustomerLifespan;
}

/**
 * Calculate CAC payback period
 */
export function calculateCACPayback(cac: number, mrr: number): number {
  return cac / mrr;
}

/**
 * Get cohort revenue
 */
export async function getCohortRevenue(cohortMonth: string): Promise<{
  cohort: string;
  month0: number;
  month1: number;
  month2: number;
  month3: number;
  month6: number;
  month12: number;
}> {
  return {
    cohort: cohortMonth,
    month0: 1000,
    month1: 850,
    month2: 750,
    month3: 700,
    month6: 600,
    month12: 500,
  };
}

// ============================================================================
// User-Generated Content (Phase 158)
// ============================================================================

export interface UserContent {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  type: "tip" | "recipe" | "routine" | "story";
  title: string;
  content: string;
  tags: string[];
  likes: number;
  comments: number;
  shares: number;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentComment {
  id: string;
  contentId: string;
  userId: string;
  userName: string;
  comment: string;
  likes: number;
  createdAt: Date;
}

/**
 * Get user-generated content
 */
export async function getUserGeneratedContent(
  type?: UserContent["type"],
  limit: number = 20
): Promise<UserContent[]> {
  const key = `${STORAGE_KEY}_ugc`;
  const data = await AsyncStorage.getItem(key);
  
  if (!data) return [];
  
  let content: UserContent[] = JSON.parse(data).map((item: any) => ({
    ...item,
    createdAt: new Date(item.createdAt),
    updatedAt: new Date(item.updatedAt),
  }));
  
  // Filter by type and status
  content = content.filter(item => {
    if (item.status !== "approved") return false;
    if (type && item.type !== type) return false;
    return true;
  });
  
  // Sort by likes
  content.sort((a, b) => b.likes - a.likes);
  
  return content.slice(0, limit);
}

/**
 * Submit user content
 */
export async function submitUserContent(
  content: Omit<UserContent, "id" | "likes" | "comments" | "shares" | "status" | "createdAt" | "updatedAt">
): Promise<UserContent> {
  const access = await canCreateUserContent();
  if (!access.allowed) {
    throw new Error(access.upgradeMessage || "Pro subscription required");
  }
  
  const key = `${STORAGE_KEY}_ugc`;
  const data = await AsyncStorage.getItem(key);
  const existing: UserContent[] = data ? JSON.parse(data) : [];
  
  const newContent: UserContent = {
    ...content,
    id: Date.now().toString(),
    likes: 0,
    comments: 0,
    shares: 0,
    status: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  existing.push(newContent);
  await AsyncStorage.setItem(key, JSON.stringify(existing));
  
  return newContent;
}

/**
 * Like content
 */
export async function likeContent(contentId: string, userId: string): Promise<void> {
  const key = `${STORAGE_KEY}_ugc`;
  const data = await AsyncStorage.getItem(key);
  const content: UserContent[] = data ? JSON.parse(data) : [];
  
  const item = content.find(c => c.id === contentId);
  if (item) {
    item.likes++;
    await AsyncStorage.setItem(key, JSON.stringify(content));
  }
  
  // Track user's like
  const likeKey = `${STORAGE_KEY}_likes_${userId}`;
  const likes = await AsyncStorage.getItem(likeKey);
  const likedIds = likes ? JSON.parse(likes) : [];
  
  if (!likedIds.includes(contentId)) {
    likedIds.push(contentId);
    await AsyncStorage.setItem(likeKey, JSON.stringify(likedIds));
  }
}

/**
 * Unlike content
 */
export async function unlikeContent(contentId: string, userId: string): Promise<void> {
  const key = `${STORAGE_KEY}_ugc`;
  const data = await AsyncStorage.getItem(key);
  const content: UserContent[] = data ? JSON.parse(data) : [];
  
  const item = content.find(c => c.id === contentId);
  if (item && item.likes > 0) {
    item.likes--;
    await AsyncStorage.setItem(key, JSON.stringify(content));
  }
  
  // Remove from user's likes
  const likeKey = `${STORAGE_KEY}_likes_${userId}`;
  const likes = await AsyncStorage.getItem(likeKey);
  const likedIds = likes ? JSON.parse(likes) : [];
  
  const filtered = likedIds.filter((id: string) => id !== contentId);
  await AsyncStorage.setItem(likeKey, JSON.stringify(filtered));
}

/**
 * Check if user liked content
 */
export async function hasUserLiked(contentId: string, userId: string): Promise<boolean> {
  const key = `${STORAGE_KEY}_likes_${userId}`;
  const data = await AsyncStorage.getItem(key);
  
  if (!data) return false;
  
  const likedIds = JSON.parse(data);
  return likedIds.includes(contentId);
}

/**
 * Add comment
 */
export async function addComment(
  contentId: string,
  userId: string,
  userName: string,
  comment: string
): Promise<ContentComment> {
  const key = `${STORAGE_KEY}_comments_${contentId}`;
  const data = await AsyncStorage.getItem(key);
  const comments: ContentComment[] = data ? JSON.parse(data) : [];
  
  const newComment: ContentComment = {
    id: Date.now().toString(),
    contentId,
    userId,
    userName,
    comment,
    likes: 0,
    createdAt: new Date(),
  };
  
  comments.push(newComment);
  await AsyncStorage.setItem(key, JSON.stringify(comments));
  
  // Update comment count
  const contentKey = `${STORAGE_KEY}_ugc`;
  const contentData = await AsyncStorage.getItem(contentKey);
  const content: UserContent[] = contentData ? JSON.parse(contentData) : [];
  
  const item = content.find(c => c.id === contentId);
  if (item) {
    item.comments++;
    await AsyncStorage.setItem(contentKey, JSON.stringify(content));
  }
  
  return newComment;
}

/**
 * Get comments
 */
export async function getComments(contentId: string): Promise<ContentComment[]> {
  const key = `${STORAGE_KEY}_comments_${contentId}`;
  const data = await AsyncStorage.getItem(key);
  
  if (!data) return [];
  
  return JSON.parse(data).map((comment: any) => ({
    ...comment,
    createdAt: new Date(comment.createdAt),
  }));
}

/**
 * Share content
 */
export async function shareContent(contentId: string): Promise<void> {
  const key = `${STORAGE_KEY}_ugc`;
  const data = await AsyncStorage.getItem(key);
  const content: UserContent[] = data ? JSON.parse(data) : [];
  
  const item = content.find(c => c.id === contentId);
  if (item) {
    item.shares++;
    await AsyncStorage.setItem(key, JSON.stringify(content));
  }
}

/**
 * Get trending content
 */
export async function getTrendingContent(limit: number = 10): Promise<UserContent[]> {
  const content = await getUserGeneratedContent();
  
  // Calculate trending score
  const scored = content.map(item => ({
    ...item,
    score: item.likes * 2 + item.comments * 3 + item.shares * 5,
  }));
  
  // Sort by score
  scored.sort((a, b) => b.score - a.score);
  
  return scored.slice(0, limit);
}

/**
 * Get content categories
 */
export function getContentCategories(): Array<{ id: string; name: string; icon: string }> {
  return [
    { id: "tip", name: "Energy Tips", icon: "lightbulb" },
    { id: "recipe", name: "Healthy Recipes", icon: "restaurant" },
    { id: "routine", name: "Daily Routines", icon: "calendar" },
    { id: "story", name: "Success Stories", icon: "star" },
  ];
}

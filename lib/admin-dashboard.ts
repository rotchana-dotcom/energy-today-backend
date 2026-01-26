/**
 * Admin Dashboard
 * User management, analytics, and moderation tools
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { canAccessAdminDashboard } from "./feature-gates";

const STORAGE_KEY = "admin_data";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "moderator" | "support";
  permissions: string[];
  createdAt: Date;
  lastLogin: Date;
}

export interface UserManagementData {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  churnedUsers: number;
  premiumUsers: number;
  freeUsers: number;
  usersByCountry: Record<string, number>;
  usersByPlan: Record<string, number>;
}

export interface ContentModerationItem {
  id: string;
  type: "post" | "comment" | "profile" | "image";
  userId: string;
  userName: string;
  content: string;
  reportCount: number;
  reportReasons: string[];
  status: "pending" | "approved" | "rejected" | "flagged";
  createdAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
}

export interface SystemHealth {
  apiResponseTime: number;
  databaseResponseTime: number;
  errorRate: number;
  activeConnections: number;
  memoryUsage: number;
  cpuUsage: number;
  diskUsage: number;
  uptime: number;
}

export interface AdminAnalytics {
  revenue: {
    today: number;
    week: number;
    month: number;
    year: number;
  };
  engagement: {
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    avgSessionDuration: number;
    avgSessionsPerUser: number;
  };
  retention: {
    day1: number;
    day7: number;
    day30: number;
  };
  conversion: {
    signupToActive: number;
    freeToTrial: number;
    trialToPaid: number;
  };
}

/**
 * Get user management data
 */
export async function getUserManagementData(): Promise<UserManagementData> {
  const access = await canAccessAdminDashboard();
  if (!access.allowed) {
    throw new Error(access.upgradeMessage || "Pro subscription required");
  }
  
  // Mock data - replace with actual API call
  return {
    totalUsers: 15847,
    activeUsers: 8923,
    newUsersToday: 234,
    newUsersThisWeek: 1456,
    newUsersThisMonth: 5678,
    churnedUsers: 892,
    premiumUsers: 3421,
    freeUsers: 12426,
    usersByCountry: {
      "United States": 6234,
      "United Kingdom": 2341,
      "Canada": 1567,
      "Australia": 1234,
      "Germany": 987,
      "France": 876,
      "Other": 2608,
    },
    usersByPlan: {
      "Free": 12426,
      "Pro": 2567,
      "Family": 854,
    },
  };
}

/**
 * Get content moderation queue
 */
export async function getModerationQueue(): Promise<ContentModerationItem[]> {
  const key = `${STORAGE_KEY}_moderation`;
  const data = await AsyncStorage.getItem(key);
  
  if (!data) {
    return [];
  }
  
  const items = JSON.parse(data);
  return items.map((item: any) => ({
    ...item,
    createdAt: new Date(item.createdAt),
    reviewedAt: item.reviewedAt ? new Date(item.reviewedAt) : undefined,
  }));
}

/**
 * Moderate content
 */
export async function moderateContent(
  itemId: string,
  action: "approve" | "reject" | "flag",
  adminId: string,
  reason?: string
): Promise<void> {
  const queue = await getModerationQueue();
  const item = queue.find(i => i.id === itemId);
  
  if (!item) throw new Error("Item not found");
  
  item.status = action === "approve" ? "approved" : action === "reject" ? "rejected" : "flagged";
  item.reviewedAt = new Date();
  item.reviewedBy = adminId;
  
  const key = `${STORAGE_KEY}_moderation`;
  await AsyncStorage.setItem(key, JSON.stringify(queue));
}

/**
 * Get system health
 */
export async function getSystemHealth(): Promise<SystemHealth> {
  // Mock data - replace with actual monitoring
  return {
    apiResponseTime: 145,
    databaseResponseTime: 23,
    errorRate: 0.02,
    activeConnections: 1234,
    memoryUsage: 67,
    cpuUsage: 34,
    diskUsage: 45,
    uptime: 99.98,
  };
}

/**
 * Get admin analytics
 */
export async function getAdminAnalytics(): Promise<AdminAnalytics> {
  // Mock data - replace with actual analytics
  return {
    revenue: {
      today: 1234,
      week: 8765,
      month: 34567,
      year: 456789,
    },
    engagement: {
      dailyActiveUsers: 8923,
      weeklyActiveUsers: 12456,
      monthlyActiveUsers: 15847,
      avgSessionDuration: 12.5,
      avgSessionsPerUser: 3.2,
    },
    retention: {
      day1: 0.78,
      day7: 0.45,
      day30: 0.23,
    },
    conversion: {
      signupToActive: 0.67,
      freeToTrial: 0.12,
      trialToPaid: 0.34,
    },
  };
}

/**
 * Search users
 */
export async function searchUsers(query: string): Promise<Array<{
  id: string;
  email: string;
  name: string;
  plan: string;
  status: string;
  joinedAt: Date;
}>> {
  // Mock search - replace with actual API
  return [];
}

/**
 * Ban user
 */
export async function banUser(userId: string, reason: string, adminId: string): Promise<void> {
  const key = `${STORAGE_KEY}_banned_${userId}`;
  await AsyncStorage.setItem(key, JSON.stringify({
    userId,
    reason,
    bannedBy: adminId,
    bannedAt: new Date().toISOString(),
  }));
}

/**
 * Unban user
 */
export async function unbanUser(userId: string): Promise<void> {
  const key = `${STORAGE_KEY}_banned_${userId}`;
  await AsyncStorage.removeItem(key);
}

/**
 * Get admin permissions
 */
export function getAdminPermissions(role: AdminUser["role"]): string[] {
  const permissions: Record<AdminUser["role"], string[]> = {
    admin: [
      "users.view",
      "users.edit",
      "users.ban",
      "content.moderate",
      "content.delete",
      "analytics.view",
      "system.configure",
      "admins.manage",
    ],
    moderator: [
      "users.view",
      "content.moderate",
      "content.delete",
      "analytics.view",
    ],
    support: [
      "users.view",
      "content.moderate",
    ],
  };
  
  return permissions[role];
}

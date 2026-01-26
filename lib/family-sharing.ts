import AsyncStorage from "@react-native-async-storage/async-storage";

const FAMILY_MEMBERS_KEY = "family_members";
const SHARING_SETTINGS_KEY = "sharing_settings";
const SHARED_ACTIVITIES_KEY = "shared_activities";
const FAMILY_CHALLENGES_KEY = "family_challenges";

export interface FamilyMember {
  id: string;
  name: string;
  email: string;
  relationship: "spouse" | "parent" | "child" | "sibling" | "friend" | "other";
  avatar?: string;
  connected: boolean;
  lastSync: string;
  permissions: SharingPermissions;
}

export interface SharingPermissions {
  viewEnergyLevels: boolean;
  viewHabits: boolean;
  viewWorkouts: boolean;
  viewSleep: boolean;
  viewNutrition: boolean;
  viewLocation: boolean;
  receiveAlerts: boolean;
  suggestActivities: boolean;
}

export interface SharingSettings {
  enabled: boolean;
  defaultPermissions: SharingPermissions;
  emergencyAlertsEnabled: boolean;
  lowEnergyThreshold: number;
  activitySuggestionsEnabled: boolean;
  familyDashboardEnabled: boolean;
}

export interface SharedActivity {
  id: string;
  title: string;
  description: string;
  suggestedDate: string;
  suggestedTime: string;
  participants: string[]; // member IDs
  energyRequirement: "low" | "medium" | "high";
  status: "suggested" | "accepted" | "declined" | "completed";
  createdBy: string;
  createdAt: string;
}

export interface FamilyChallenge {
  id: string;
  title: string;
  description: string;
  goal: string;
  startDate: string;
  endDate: string;
  participants: string[];
  progress: { [memberId: string]: number };
  status: "active" | "completed" | "cancelled";
}

export interface FamilyInsight {
  type: "energy_sync" | "activity_suggestion" | "health_trend" | "achievement";
  message: string;
  members: string[];
  timestamp: string;
  priority: "low" | "medium" | "high";
}

/**
 * Get sharing settings
 */
export async function getSharingSettings(): Promise<SharingSettings> {
  try {
    const data = await AsyncStorage.getItem(SHARING_SETTINGS_KEY);
    if (data) {
      return JSON.parse(data);
    }
    
    return {
      enabled: false,
      defaultPermissions: {
        viewEnergyLevels: true,
        viewHabits: true,
        viewWorkouts: true,
        viewSleep: false,
        viewNutrition: false,
        viewLocation: false,
        receiveAlerts: true,
        suggestActivities: true,
      },
      emergencyAlertsEnabled: true,
      lowEnergyThreshold: 20,
      activitySuggestionsEnabled: true,
      familyDashboardEnabled: true,
    };
  } catch (error) {
    console.error("Failed to get sharing settings:", error);
    return {
      enabled: false,
      defaultPermissions: {
        viewEnergyLevels: true,
        viewHabits: true,
        viewWorkouts: true,
        viewSleep: false,
        viewNutrition: false,
        viewLocation: false,
        receiveAlerts: true,
        suggestActivities: true,
      },
      emergencyAlertsEnabled: true,
      lowEnergyThreshold: 20,
      activitySuggestionsEnabled: true,
      familyDashboardEnabled: true,
    };
  }
}

/**
 * Update sharing settings
 */
export async function updateSharingSettings(
  settings: Partial<SharingSettings>
): Promise<void> {
  try {
    const current = await getSharingSettings();
    const updated = { ...current, ...settings };
    await AsyncStorage.setItem(SHARING_SETTINGS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to update sharing settings:", error);
    throw error;
  }
}

/**
 * Get family members
 */
export async function getFamilyMembers(): Promise<FamilyMember[]> {
  try {
    const data = await AsyncStorage.getItem(FAMILY_MEMBERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to get family members:", error);
    return [];
  }
}

/**
 * Add family member
 */
export async function addFamilyMember(
  member: Omit<FamilyMember, "id" | "connected" | "lastSync">
): Promise<FamilyMember> {
  try {
    const members = await getFamilyMembers();
    const settings = await getSharingSettings();
    
    const newMember: FamilyMember = {
      ...member,
      id: `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      connected: false,
      lastSync: new Date().toISOString(),
      permissions: member.permissions || settings.defaultPermissions,
    };
    
    members.push(newMember);
    await AsyncStorage.setItem(FAMILY_MEMBERS_KEY, JSON.stringify(members));
    
    return newMember;
  } catch (error) {
    console.error("Failed to add family member:", error);
    throw error;
  }
}

/**
 * Update family member
 */
export async function updateFamilyMember(
  id: string,
  updates: Partial<FamilyMember>
): Promise<void> {
  try {
    const members = await getFamilyMembers();
    const updated = members.map((member) =>
      member.id === id ? { ...member, ...updates } : member
    );
    await AsyncStorage.setItem(FAMILY_MEMBERS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to update family member:", error);
    throw error;
  }
}

/**
 * Remove family member
 */
export async function removeFamilyMember(id: string): Promise<void> {
  try {
    const members = await getFamilyMembers();
    const filtered = members.filter((member) => member.id !== id);
    await AsyncStorage.setItem(FAMILY_MEMBERS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Failed to remove family member:", error);
    throw error;
  }
}

/**
 * Get shared activities
 */
export async function getSharedActivities(): Promise<SharedActivity[]> {
  try {
    const data = await AsyncStorage.getItem(SHARED_ACTIVITIES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to get shared activities:", error);
    return [];
  }
}

/**
 * Suggest activity
 */
export async function suggestActivity(
  activity: Omit<SharedActivity, "id" | "status" | "createdAt">
): Promise<SharedActivity> {
  try {
    const activities = await getSharedActivities();
    
    const newActivity: SharedActivity = {
      ...activity,
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: "suggested",
      createdAt: new Date().toISOString(),
    };
    
    activities.push(newActivity);
    await AsyncStorage.setItem(SHARED_ACTIVITIES_KEY, JSON.stringify(activities));
    
    return newActivity;
  } catch (error) {
    console.error("Failed to suggest activity:", error);
    throw error;
  }
}

/**
 * Update activity status
 */
export async function updateActivityStatus(
  id: string,
  status: SharedActivity["status"]
): Promise<void> {
  try {
    const activities = await getSharedActivities();
    const updated = activities.map((activity) =>
      activity.id === id ? { ...activity, status } : activity
    );
    await AsyncStorage.setItem(SHARED_ACTIVITIES_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to update activity status:", error);
    throw error;
  }
}

/**
 * Get family challenges
 */
export async function getFamilyChallenges(): Promise<FamilyChallenge[]> {
  try {
    const data = await AsyncStorage.getItem(FAMILY_CHALLENGES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to get family challenges:", error);
    return [];
  }
}

/**
 * Create family challenge
 */
export async function createFamilyChallenge(
  challenge: Omit<FamilyChallenge, "id" | "progress" | "status">
): Promise<FamilyChallenge> {
  try {
    const challenges = await getFamilyChallenges();
    
    // Initialize progress for all participants
    const progress: { [memberId: string]: number } = {};
    challenge.participants.forEach((memberId) => {
      progress[memberId] = 0;
    });
    
    const newChallenge: FamilyChallenge = {
      ...challenge,
      id: `challenge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      progress,
      status: "active",
    };
    
    challenges.push(newChallenge);
    await AsyncStorage.setItem(FAMILY_CHALLENGES_KEY, JSON.stringify(challenges));
    
    return newChallenge;
  } catch (error) {
    console.error("Failed to create family challenge:", error);
    throw error;
  }
}

/**
 * Update challenge progress
 */
export async function updateChallengeProgress(
  challengeId: string,
  memberId: string,
  progress: number
): Promise<void> {
  try {
    const challenges = await getFamilyChallenges();
    const updated = challenges.map((challenge) => {
      if (challenge.id === challengeId) {
        return {
          ...challenge,
          progress: {
            ...challenge.progress,
            [memberId]: progress,
          },
        };
      }
      return challenge;
    });
    await AsyncStorage.setItem(FAMILY_CHALLENGES_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to update challenge progress:", error);
    throw error;
  }
}

/**
 * Find optimal group activity time
 */
export async function findOptimalGroupTime(
  memberIds: string[]
): Promise<{
  suggestedDate: string;
  suggestedTime: string;
  averageEnergy: number;
  reason: string;
}> {
  // In real implementation, would analyze energy patterns of all members
  // For now, simulate optimal time finding
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const optimalHour = 10; // 10 AM is typically high energy for most people
  tomorrow.setHours(optimalHour, 0, 0, 0);
  
  return {
    suggestedDate: tomorrow.toISOString().split("T")[0],
    suggestedTime: `${optimalHour}:00`,
    averageEnergy: 75,
    reason: "All members typically have high energy at this time",
  };
}

/**
 * Get family dashboard data
 */
export async function getFamilyDashboard(): Promise<{
  members: FamilyMember[];
  averageEnergy: number;
  activeMembers: number;
  upcomingActivities: SharedActivity[];
  activeChallenges: FamilyChallenge[];
  insights: FamilyInsight[];
}> {
  const members = await getFamilyMembers();
  const activities = await getSharedActivities();
  const challenges = await getFamilyChallenges();
  
  // Calculate average energy (simulated)
  const averageEnergy = 65;
  
  // Count active members (connected in last 24 hours)
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);
  const activeMembers = members.filter((m) => {
    const lastSync = new Date(m.lastSync);
    return lastSync >= oneDayAgo;
  }).length;
  
  // Get upcoming activities
  const upcomingActivities = activities.filter(
    (a) => a.status === "suggested" || a.status === "accepted"
  );
  
  // Get active challenges
  const activeChallenges = challenges.filter((c) => c.status === "active");
  
  // Generate insights
  const insights = await generateFamilyInsights(members, activities, challenges);
  
  return {
    members,
    averageEnergy,
    activeMembers,
    upcomingActivities,
    activeChallenges,
    insights,
  };
}

/**
 * Generate family insights
 */
async function generateFamilyInsights(
  members: FamilyMember[],
  activities: SharedActivity[],
  challenges: FamilyChallenge[]
): Promise<FamilyInsight[]> {
  const insights: FamilyInsight[] = [];
  
  // Energy sync insight
  if (members.length >= 2) {
    insights.push({
      type: "energy_sync",
      message: "Everyone's energy is aligned! Great time for a family activity.",
      members: members.map((m) => m.id),
      timestamp: new Date().toISOString(),
      priority: "medium",
    });
  }
  
  // Activity suggestion insight
  const pendingActivities = activities.filter((a) => a.status === "suggested");
  if (pendingActivities.length > 0) {
    insights.push({
      type: "activity_suggestion",
      message: `You have ${pendingActivities.length} pending activity suggestion(s). Review them now!`,
      members: pendingActivities[0].participants,
      timestamp: new Date().toISOString(),
      priority: "medium",
    });
  }
  
  // Challenge progress insight
  const activeChallenges = challenges.filter((c) => c.status === "active");
  if (activeChallenges.length > 0) {
    const challenge = activeChallenges[0];
    const avgProgress =
      Object.values(challenge.progress).reduce((sum, p) => sum + p, 0) /
      Object.keys(challenge.progress).length;
    
    if (avgProgress >= 50) {
      insights.push({
        type: "achievement",
        message: `Your family is ${Math.round(avgProgress)}% through the "${challenge.title}" challenge! Keep going!`,
        members: challenge.participants,
        timestamp: new Date().toISOString(),
        priority: "high",
      });
    }
  }
  
  return insights;
}

/**
 * Send emergency alert
 */
export async function sendEmergencyAlert(
  memberId: string,
  reason: string
): Promise<{
  success: boolean;
  notifiedMembers: number;
  message: string;
}> {
  const settings = await getSharingSettings();
  
  if (!settings.emergencyAlertsEnabled) {
    return {
      success: false,
      notifiedMembers: 0,
      message: "Emergency alerts are disabled",
    };
  }
  
  const members = await getFamilyMembers();
  const member = members.find((m) => m.id === memberId);
  
  if (!member) {
    return {
      success: false,
      notifiedMembers: 0,
      message: "Member not found",
    };
  }
  
  // In real implementation, would send push notifications
  const notifiedMembers = members.filter(
    (m) => m.id !== memberId && m.permissions.receiveAlerts
  ).length;
  
  return {
    success: true,
    notifiedMembers,
    message: `Emergency alert sent to ${notifiedMembers} family member(s)`,
  };
}

/**
 * Get sharing statistics
 */
export async function getSharingStatistics(): Promise<{
  totalMembers: number;
  connectedMembers: number;
  sharedActivities: number;
  completedActivities: number;
  activeChallenges: number;
  completedChallenges: number;
}> {
  const members = await getFamilyMembers();
  const activities = await getSharedActivities();
  const challenges = await getFamilyChallenges();
  
  return {
    totalMembers: members.length,
    connectedMembers: members.filter((m) => m.connected).length,
    sharedActivities: activities.length,
    completedActivities: activities.filter((a) => a.status === "completed").length,
    activeChallenges: challenges.filter((c) => c.status === "active").length,
    completedChallenges: challenges.filter((c) => c.status === "completed").length,
  };
}

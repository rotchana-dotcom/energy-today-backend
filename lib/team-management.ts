import AsyncStorage from "@react-native-async-storage/async-storage";

const WORKSPACES_KEY = "team_workspaces";
const TEAM_MEMBERS_KEY = "team_members";
const TEAM_CHALLENGES_KEY = "team_challenges";
const TEAM_SETTINGS_KEY = "team_settings";

export type UserRole = "owner" | "admin" | "member" | "viewer";

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  createdDate: string;
  ownerId: string;
  memberCount: number;
  plan: "free" | "team" | "enterprise";
  branding?: WorkspaceBranding;
  ssoEnabled: boolean;
  settings: WorkspaceSettings;
}

export interface WorkspaceBranding {
  companyName: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  customDomain?: string;
}

export interface WorkspaceSettings {
  allowMemberInvites: boolean;
  requireApproval: boolean;
  dataRetentionDays: number;
  enableAnalytics: boolean;
  enableChallenges: boolean;
  privacyLevel: "public" | "private" | "restricted";
}

export interface TeamMember {
  userId: string;
  workspaceId: string;
  email: string;
  displayName: string;
  avatar?: string;
  role: UserRole;
  joinedDate: string;
  lastActiveDate: string;
  energyScore: number;
  wellnessScore: number;
  status: "active" | "inactive" | "suspended";
}

export interface TeamChallenge {
  id: string;
  workspaceId: string;
  title: string;
  description: string;
  type: "energy" | "habits" | "steps" | "meditation" | "custom";
  startDate: string;
  endDate: string;
  goal: number;
  unit: string;
  participants: string[]; // user IDs
  leaderboard: ChallengeLeaderboard[];
  prizes?: string[];
  status: "upcoming" | "active" | "completed";
}

export interface ChallengeLeaderboard {
  userId: string;
  displayName: string;
  avatar?: string;
  score: number;
  rank: number;
}

export interface TeamDashboard {
  workspaceId: string;
  period: "week" | "month" | "quarter" | "year";
  metrics: {
    averageEnergyScore: number;
    averageWellnessScore: number;
    activeMembers: number;
    totalMembers: number;
    engagementRate: number;
    completedChallenges: number;
    totalHabitsCompleted: number;
    averageSleepHours: number;
  };
  trends: {
    energyTrend: "up" | "down" | "stable";
    wellnessTrend: "up" | "down" | "stable";
    engagementTrend: "up" | "down" | "stable";
  };
  topPerformers: TeamMember[];
  needsAttention: TeamMember[];
}

export interface UsageAnalytics {
  workspaceId: string;
  period: "day" | "week" | "month";
  activeUsers: number;
  totalLogins: number;
  featuresUsed: { feature: string; count: number }[];
  averageSessionDuration: number;
  dataPoints: { date: string; activeUsers: number }[];
}

/**
 * Get all workspaces for current user
 */
export async function getWorkspaces(): Promise<Workspace[]> {
  try {
    const data = await AsyncStorage.getItem(WORKSPACES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to get workspaces:", error);
    return [];
  }
}

/**
 * Get workspace by ID
 */
export async function getWorkspace(id: string): Promise<Workspace | null> {
  const workspaces = await getWorkspaces();
  return workspaces.find((w) => w.id === id) || null;
}

/**
 * Create workspace
 */
export async function createWorkspace(
  name: string,
  description?: string,
  plan: Workspace["plan"] = "free"
): Promise<Workspace> {
  try {
    const workspaces = await getWorkspaces();
    
    const newWorkspace: Workspace = {
      id: `ws_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      createdDate: new Date().toISOString(),
      ownerId: "current_user", // In real app, get from auth
      memberCount: 1,
      plan,
      ssoEnabled: false,
      settings: {
        allowMemberInvites: true,
        requireApproval: plan === "enterprise",
        dataRetentionDays: plan === "enterprise" ? 365 : 90,
        enableAnalytics: true,
        enableChallenges: true,
        privacyLevel: "private",
      },
    };
    
    workspaces.push(newWorkspace);
    await AsyncStorage.setItem(WORKSPACES_KEY, JSON.stringify(workspaces));
    
    return newWorkspace;
  } catch (error) {
    console.error("Failed to create workspace:", error);
    throw error;
  }
}

/**
 * Update workspace
 */
export async function updateWorkspace(
  id: string,
  updates: Partial<Workspace>
): Promise<Workspace> {
  try {
    const workspaces = await getWorkspaces();
    const index = workspaces.findIndex((w) => w.id === id);
    
    if (index === -1) {
      throw new Error("Workspace not found");
    }
    
    workspaces[index] = { ...workspaces[index], ...updates };
    await AsyncStorage.setItem(WORKSPACES_KEY, JSON.stringify(workspaces));
    
    return workspaces[index];
  } catch (error) {
    console.error("Failed to update workspace:", error);
    throw error;
  }
}

/**
 * Delete workspace
 */
export async function deleteWorkspace(id: string): Promise<void> {
  try {
    const workspaces = await getWorkspaces();
    const filtered = workspaces.filter((w) => w.id !== id);
    
    await AsyncStorage.setItem(WORKSPACES_KEY, JSON.stringify(filtered));
    
    // Clean up related data
    await AsyncStorage.removeItem(`${TEAM_MEMBERS_KEY}_${id}`);
    await AsyncStorage.removeItem(`${TEAM_CHALLENGES_KEY}_${id}`);
    await AsyncStorage.removeItem(`${TEAM_SETTINGS_KEY}_${id}`);
  } catch (error) {
    console.error("Failed to delete workspace:", error);
    throw error;
  }
}

/**
 * Get team members
 */
export async function getTeamMembers(workspaceId: string): Promise<TeamMember[]> {
  try {
    const data = await AsyncStorage.getItem(`${TEAM_MEMBERS_KEY}_${workspaceId}`);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to get team members:", error);
    return [];
  }
}

/**
 * Add team member
 */
export async function addTeamMember(
  workspaceId: string,
  email: string,
  displayName: string,
  role: UserRole = "member"
): Promise<TeamMember> {
  try {
    const members = await getTeamMembers(workspaceId);
    
    // Check if already exists
    if (members.some((m) => m.email === email)) {
      throw new Error("Member already exists");
    }
    
    const newMember: TeamMember = {
      userId: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      workspaceId,
      email,
      displayName,
      role,
      joinedDate: new Date().toISOString(),
      lastActiveDate: new Date().toISOString(),
      energyScore: 75,
      wellnessScore: 80,
      status: "active",
    };
    
    members.push(newMember);
    await AsyncStorage.setItem(
      `${TEAM_MEMBERS_KEY}_${workspaceId}`,
      JSON.stringify(members)
    );
    
    // Update workspace member count
    const workspace = await getWorkspace(workspaceId);
    if (workspace) {
      await updateWorkspace(workspaceId, { memberCount: members.length });
    }
    
    return newMember;
  } catch (error) {
    console.error("Failed to add team member:", error);
    throw error;
  }
}

/**
 * Update team member
 */
export async function updateTeamMember(
  workspaceId: string,
  userId: string,
  updates: Partial<TeamMember>
): Promise<TeamMember> {
  try {
    const members = await getTeamMembers(workspaceId);
    const index = members.findIndex((m) => m.userId === userId);
    
    if (index === -1) {
      throw new Error("Member not found");
    }
    
    members[index] = { ...members[index], ...updates };
    await AsyncStorage.setItem(
      `${TEAM_MEMBERS_KEY}_${workspaceId}`,
      JSON.stringify(members)
    );
    
    return members[index];
  } catch (error) {
    console.error("Failed to update team member:", error);
    throw error;
  }
}

/**
 * Remove team member
 */
export async function removeTeamMember(
  workspaceId: string,
  userId: string
): Promise<void> {
  try {
    const members = await getTeamMembers(workspaceId);
    const filtered = members.filter((m) => m.userId !== userId);
    
    await AsyncStorage.setItem(
      `${TEAM_MEMBERS_KEY}_${workspaceId}`,
      JSON.stringify(filtered)
    );
    
    // Update workspace member count
    const workspace = await getWorkspace(workspaceId);
    if (workspace) {
      await updateWorkspace(workspaceId, { memberCount: filtered.length });
    }
  } catch (error) {
    console.error("Failed to remove team member:", error);
    throw error;
  }
}

/**
 * Bulk import members
 */
export async function bulkImportMembers(
  workspaceId: string,
  members: { email: string; displayName: string; role?: UserRole }[]
): Promise<{ success: number; failed: number; errors: string[] }> {
  let success = 0;
  let failed = 0;
  const errors: string[] = [];
  
  for (const member of members) {
    try {
      await addTeamMember(
        workspaceId,
        member.email,
        member.displayName,
        member.role || "member"
      );
      success++;
    } catch (error) {
      failed++;
      errors.push(`${member.email}: ${error}`);
    }
  }
  
  return { success, failed, errors };
}

/**
 * Get team challenges
 */
export async function getTeamChallenges(
  workspaceId: string
): Promise<TeamChallenge[]> {
  try {
    const data = await AsyncStorage.getItem(`${TEAM_CHALLENGES_KEY}_${workspaceId}`);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to get team challenges:", error);
    return [];
  }
}

/**
 * Create team challenge
 */
export async function createTeamChallenge(
  workspaceId: string,
  challenge: Omit<TeamChallenge, "id" | "workspaceId" | "participants" | "leaderboard" | "status">
): Promise<TeamChallenge> {
  try {
    const challenges = await getTeamChallenges(workspaceId);
    
    const newChallenge: TeamChallenge = {
      ...challenge,
      id: `challenge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      workspaceId,
      participants: [],
      leaderboard: [],
      status: new Date(challenge.startDate) > new Date() ? "upcoming" : "active",
    };
    
    challenges.push(newChallenge);
    await AsyncStorage.setItem(
      `${TEAM_CHALLENGES_KEY}_${workspaceId}`,
      JSON.stringify(challenges)
    );
    
    return newChallenge;
  } catch (error) {
    console.error("Failed to create team challenge:", error);
    throw error;
  }
}

/**
 * Join team challenge
 */
export async function joinTeamChallenge(
  workspaceId: string,
  challengeId: string,
  userId: string
): Promise<void> {
  try {
    const challenges = await getTeamChallenges(workspaceId);
    const challenge = challenges.find((c) => c.id === challengeId);
    
    if (!challenge) {
      throw new Error("Challenge not found");
    }
    
    if (!challenge.participants.includes(userId)) {
      challenge.participants.push(userId);
      await AsyncStorage.setItem(
        `${TEAM_CHALLENGES_KEY}_${workspaceId}`,
        JSON.stringify(challenges)
      );
    }
  } catch (error) {
    console.error("Failed to join team challenge:", error);
    throw error;
  }
}

/**
 * Get team dashboard
 */
export async function getTeamDashboard(
  workspaceId: string,
  period: TeamDashboard["period"] = "month"
): Promise<TeamDashboard> {
  try {
    const members = await getTeamMembers(workspaceId);
    const activeMembers = members.filter((m) => m.status === "active");
    
    // Calculate metrics
    const averageEnergyScore =
      activeMembers.reduce((sum, m) => sum + m.energyScore, 0) / activeMembers.length || 0;
    const averageWellnessScore =
      activeMembers.reduce((sum, m) => sum + m.wellnessScore, 0) / activeMembers.length || 0;
    
    const challenges = await getTeamChallenges(workspaceId);
    const completedChallenges = challenges.filter((c) => c.status === "completed").length;
    
    // Sort members by energy score
    const sortedMembers = [...activeMembers].sort(
      (a, b) => b.energyScore - a.energyScore
    );
    
    const dashboard: TeamDashboard = {
      workspaceId,
      period,
      metrics: {
        averageEnergyScore: Math.round(averageEnergyScore),
        averageWellnessScore: Math.round(averageWellnessScore),
        activeMembers: activeMembers.length,
        totalMembers: members.length,
        engagementRate: Math.round((activeMembers.length / members.length) * 100) || 0,
        completedChallenges,
        totalHabitsCompleted: activeMembers.length * 45, // Simulated
        averageSleepHours: 7.2, // Simulated
      },
      trends: {
        energyTrend: averageEnergyScore > 75 ? "up" : averageEnergyScore < 65 ? "down" : "stable",
        wellnessTrend: averageWellnessScore > 80 ? "up" : averageWellnessScore < 70 ? "down" : "stable",
        engagementTrend: (activeMembers.length / members.length) > 0.8 ? "up" : "stable",
      },
      topPerformers: sortedMembers.slice(0, 5),
      needsAttention: sortedMembers.slice(-3).reverse(),
    };
    
    return dashboard;
  } catch (error) {
    console.error("Failed to get team dashboard:", error);
    throw error;
  }
}

/**
 * Get usage analytics
 */
export async function getUsageAnalytics(
  workspaceId: string,
  period: UsageAnalytics["period"] = "week"
): Promise<UsageAnalytics> {
  try {
    const members = await getTeamMembers(workspaceId);
    const activeMembers = members.filter((m) => m.status === "active");
    
    // Generate sample data points
    const days = period === "day" ? 1 : period === "week" ? 7 : 30;
    const dataPoints = Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() - (days - i - 1) * 86400000).toISOString().split("T")[0],
      activeUsers: Math.floor(activeMembers.length * (0.7 + Math.random() * 0.3)),
    }));
    
    const analytics: UsageAnalytics = {
      workspaceId,
      period,
      activeUsers: activeMembers.length,
      totalLogins: activeMembers.length * (period === "day" ? 2 : period === "week" ? 12 : 45),
      featuresUsed: [
        { feature: "Energy Tracking", count: activeMembers.length * 8 },
        { feature: "Habit Tracking", count: activeMembers.length * 6 },
        { feature: "Sleep Tracking", count: activeMembers.length * 5 },
        { feature: "Nutrition Tracking", count: activeMembers.length * 4 },
        { feature: "Challenges", count: Math.floor(activeMembers.length * 0.6) },
      ],
      averageSessionDuration: 12.5, // minutes
      dataPoints,
    };
    
    return analytics;
  } catch (error) {
    console.error("Failed to get usage analytics:", error);
    throw error;
  }
}

/**
 * Update workspace branding
 */
export async function updateWorkspaceBranding(
  workspaceId: string,
  branding: WorkspaceBranding
): Promise<void> {
  try {
    await updateWorkspace(workspaceId, { branding });
  } catch (error) {
    console.error("Failed to update workspace branding:", error);
    throw error;
  }
}

/**
 * Enable SSO
 */
export async function enableSSO(
  workspaceId: string,
  provider: "google" | "microsoft" | "okta" | "custom",
  config: Record<string, string>
): Promise<void> {
  try {
    // In real implementation, would configure SSO with provider
    // For now, just update workspace
    await updateWorkspace(workspaceId, { ssoEnabled: true });
  } catch (error) {
    console.error("Failed to enable SSO:", error);
    throw error;
  }
}

/**
 * Export team data
 */
export async function exportTeamData(
  workspaceId: string,
  format: "csv" | "json"
): Promise<string> {
  try {
    const members = await getTeamMembers(workspaceId);
    const challenges = await getTeamChallenges(workspaceId);
    const dashboard = await getTeamDashboard(workspaceId);
    
    const data = {
      workspace: await getWorkspace(workspaceId),
      members,
      challenges,
      dashboard,
      exportDate: new Date().toISOString(),
    };
    
    if (format === "json") {
      return JSON.stringify(data, null, 2);
    } else {
      // Convert to CSV (simplified)
      let csv = "Email,Display Name,Role,Energy Score,Wellness Score,Status\n";
      members.forEach((m) => {
        csv += `${m.email},${m.displayName},${m.role},${m.energyScore},${m.wellnessScore},${m.status}\n`;
      });
      return csv;
    }
  } catch (error) {
    console.error("Failed to export team data:", error);
    throw error;
  }
}

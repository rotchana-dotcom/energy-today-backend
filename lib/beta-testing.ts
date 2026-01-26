import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Beta Testing Program Management
 * Manages beta testers, feedback collection, and build distribution
 */

const BETA_TESTERS_KEY = "beta_testers";
const BETA_FEEDBACK_KEY = "beta_feedback";
const BETA_BUILDS_KEY = "beta_builds";
const BETA_SETTINGS_KEY = "beta_settings";

export interface BetaTester {
  id: string;
  email: string;
  name: string;
  platform: "ios" | "android" | "both";
  invitedAt: string;
  acceptedAt?: string;
  status: "invited" | "active" | "inactive" | "removed";
  feedbackCount: number;
  bugsReported: number;
  lastActive?: string;
  deviceInfo?: {
    model: string;
    osVersion: string;
    appVersion: string;
  };
  tags?: string[]; // e.g., "power-user", "early-adopter", "influencer"
}

export interface BetaFeedback {
  id: string;
  testerId: string;
  testerName: string;
  type: "bug" | "feature" | "improvement" | "general";
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "new" | "reviewing" | "in-progress" | "resolved" | "wont-fix";
  attachments?: string[]; // screenshot URLs
  deviceInfo?: {
    model: string;
    osVersion: string;
    appVersion: string;
  };
  createdAt: string;
  resolvedAt?: string;
  assignedTo?: string;
}

export interface BetaBuild {
  id: string;
  version: string;
  buildNumber: number;
  platform: "ios" | "android";
  releaseNotes: string;
  changes: string[];
  fixes: string[];
  knownIssues: string[];
  distributedAt: string;
  downloadUrl?: string;
  testFlightUrl?: string;
  playStoreUrl?: string;
  installCount: number;
  crashCount: number;
  feedbackCount: number;
}

export interface BetaSettings {
  programActive: boolean;
  maxTesters: number;
  autoApprove: boolean;
  feedbackReminders: boolean;
  crashReporting: boolean;
  analyticsEnabled: boolean;
}

/**
 * Get all beta testers
 */
export async function getBetaTesters(): Promise<BetaTester[]> {
  try {
    const data = await AsyncStorage.getItem(BETA_TESTERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to get beta testers:", error);
    return [];
  }
}

/**
 * Add beta tester
 */
export async function addBetaTester(tester: Omit<BetaTester, "id" | "invitedAt" | "feedbackCount" | "bugsReported">): Promise<BetaTester> {
  try {
    const testers = await getBetaTesters();
    
    const newTester: BetaTester = {
      ...tester,
      id: `tester_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      invitedAt: new Date().toISOString(),
      feedbackCount: 0,
      bugsReported: 0,
    };
    
    testers.push(newTester);
    await AsyncStorage.setItem(BETA_TESTERS_KEY, JSON.stringify(testers));
    
    return newTester;
  } catch (error) {
    console.error("Failed to add beta tester:", error);
    throw error;
  }
}

/**
 * Update beta tester
 */
export async function updateBetaTester(testerId: string, updates: Partial<BetaTester>): Promise<void> {
  try {
    const testers = await getBetaTesters();
    const index = testers.findIndex(t => t.id === testerId);
    
    if (index === -1) {
      throw new Error("Tester not found");
    }
    
    testers[index] = { ...testers[index], ...updates };
    await AsyncStorage.setItem(BETA_TESTERS_KEY, JSON.stringify(testers));
  } catch (error) {
    console.error("Failed to update beta tester:", error);
    throw error;
  }
}

/**
 * Remove beta tester
 */
export async function removeBetaTester(testerId: string): Promise<void> {
  try {
    await updateBetaTester(testerId, { status: "removed" });
  } catch (error) {
    console.error("Failed to remove beta tester:", error);
    throw error;
  }
}

/**
 * Get beta feedback
 */
export async function getBetaFeedback(): Promise<BetaFeedback[]> {
  try {
    const data = await AsyncStorage.getItem(BETA_FEEDBACK_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to get beta feedback:", error);
    return [];
  }
}

/**
 * Submit beta feedback
 */
export async function submitBetaFeedback(feedback: Omit<BetaFeedback, "id" | "createdAt" | "status">): Promise<BetaFeedback> {
  try {
    const allFeedback = await getBetaFeedback();
    
    const newFeedback: BetaFeedback = {
      ...feedback,
      id: `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      status: "new",
    };
    
    allFeedback.push(newFeedback);
    await AsyncStorage.setItem(BETA_FEEDBACK_KEY, JSON.stringify(allFeedback));
    
    // Update tester stats
    const testers = await getBetaTesters();
    const tester = testers.find(t => t.id === feedback.testerId);
    if (tester) {
      tester.feedbackCount++;
      if (feedback.type === "bug") {
        tester.bugsReported++;
      }
      await AsyncStorage.setItem(BETA_TESTERS_KEY, JSON.stringify(testers));
    }
    
    return newFeedback;
  } catch (error) {
    console.error("Failed to submit beta feedback:", error);
    throw error;
  }
}

/**
 * Update feedback status
 */
export async function updateFeedbackStatus(
  feedbackId: string,
  status: BetaFeedback["status"],
  assignedTo?: string
): Promise<void> {
  try {
    const allFeedback = await getBetaFeedback();
    const index = allFeedback.findIndex(f => f.id === feedbackId);
    
    if (index === -1) {
      throw new Error("Feedback not found");
    }
    
    allFeedback[index].status = status;
    if (assignedTo) {
      allFeedback[index].assignedTo = assignedTo;
    }
    if (status === "resolved") {
      allFeedback[index].resolvedAt = new Date().toISOString();
    }
    
    await AsyncStorage.setItem(BETA_FEEDBACK_KEY, JSON.stringify(allFeedback));
  } catch (error) {
    console.error("Failed to update feedback status:", error);
    throw error;
  }
}

/**
 * Get beta builds
 */
export async function getBetaBuilds(): Promise<BetaBuild[]> {
  try {
    const data = await AsyncStorage.getItem(BETA_BUILDS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to get beta builds:", error);
    return [];
  }
}

/**
 * Create beta build
 */
export async function createBetaBuild(build: Omit<BetaBuild, "id" | "distributedAt" | "installCount" | "crashCount" | "feedbackCount">): Promise<BetaBuild> {
  try {
    const builds = await getBetaBuilds();
    
    const newBuild: BetaBuild = {
      ...build,
      id: `build_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      distributedAt: new Date().toISOString(),
      installCount: 0,
      crashCount: 0,
      feedbackCount: 0,
    };
    
    builds.push(newBuild);
    await AsyncStorage.setItem(BETA_BUILDS_KEY, JSON.stringify(builds));
    
    return newBuild;
  } catch (error) {
    console.error("Failed to create beta build:", error);
    throw error;
  }
}

/**
 * Generate release notes
 */
export function generateReleaseNotes(build: BetaBuild): string {
  let notes = `# Version ${build.version} (Build ${build.buildNumber})\n\n`;
  
  if (build.changes.length > 0) {
    notes += `## What's New\n`;
    build.changes.forEach(change => {
      notes += `- ${change}\n`;
    });
    notes += `\n`;
  }
  
  if (build.fixes.length > 0) {
    notes += `## Bug Fixes\n`;
    build.fixes.forEach(fix => {
      notes += `- ${fix}\n`;
    });
    notes += `\n`;
  }
  
  if (build.knownIssues.length > 0) {
    notes += `## Known Issues\n`;
    build.knownIssues.forEach(issue => {
      notes += `- ${issue}\n`;
    });
    notes += `\n`;
  }
  
  notes += `\nThank you for testing! Please report any issues you encounter.\n`;
  
  return notes;
}

/**
 * Get beta program settings
 */
export async function getBetaSettings(): Promise<BetaSettings> {
  try {
    const data = await AsyncStorage.getItem(BETA_SETTINGS_KEY);
    
    if (data) {
      return JSON.parse(data);
    }
    
    // Default settings
    return {
      programActive: true,
      maxTesters: 100,
      autoApprove: false,
      feedbackReminders: true,
      crashReporting: true,
      analyticsEnabled: true,
    };
  } catch (error) {
    console.error("Failed to get beta settings:", error);
    return {
      programActive: false,
      maxTesters: 100,
      autoApprove: false,
      feedbackReminders: false,
      crashReporting: false,
      analyticsEnabled: false,
    };
  }
}

/**
 * Update beta program settings
 */
export async function updateBetaSettings(updates: Partial<BetaSettings>): Promise<void> {
  try {
    const settings = await getBetaSettings();
    const updated = { ...settings, ...updates };
    await AsyncStorage.setItem(BETA_SETTINGS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to update beta settings:", error);
    throw error;
  }
}

/**
 * Get beta program statistics
 */
export async function getBetaStats(): Promise<{
  totalTesters: number;
  activeTesters: number;
  totalFeedback: number;
  bugsReported: number;
  totalBuilds: number;
  latestBuild?: BetaBuild;
  feedbackByPriority: Record<string, number>;
  feedbackByStatus: Record<string, number>;
}> {
  try {
    const testers = await getBetaTesters();
    const feedback = await getBetaFeedback();
    const builds = await getBetaBuilds();
    
    const activeTesters = testers.filter(t => t.status === "active").length;
    const bugsReported = feedback.filter(f => f.type === "bug").length;
    const latestBuild = builds.sort((a, b) => 
      new Date(b.distributedAt).getTime() - new Date(a.distributedAt).getTime()
    )[0];
    
    const feedbackByPriority: Record<string, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };
    
    const feedbackByStatus: Record<string, number> = {
      new: 0,
      reviewing: 0,
      "in-progress": 0,
      resolved: 0,
      "wont-fix": 0,
    };
    
    feedback.forEach(f => {
      feedbackByPriority[f.priority]++;
      feedbackByStatus[f.status]++;
    });
    
    return {
      totalTesters: testers.length,
      activeTesters,
      totalFeedback: feedback.length,
      bugsReported,
      totalBuilds: builds.length,
      latestBuild,
      feedbackByPriority,
      feedbackByStatus,
    };
  } catch (error) {
    console.error("Failed to get beta stats:", error);
    return {
      totalTesters: 0,
      activeTesters: 0,
      totalFeedback: 0,
      bugsReported: 0,
      totalBuilds: 0,
      feedbackByPriority: { low: 0, medium: 0, high: 0, critical: 0 },
      feedbackByStatus: { new: 0, reviewing: 0, "in-progress": 0, resolved: 0, "wont-fix": 0 },
    };
  }
}

/**
 * Send beta invitation email (simulated)
 */
export async function sendBetaInvitation(tester: BetaTester): Promise<void> {
  console.log(`Sending beta invitation to ${tester.email}`);
  
  // In production, would integrate with email service (SendGrid, Mailgun, etc.)
  const invitationEmail = {
    to: tester.email,
    subject: "You're invited to join Energy Today Beta!",
    body: `
      Hi ${tester.name},
      
      You've been invited to join the Energy Today beta testing program!
      
      As a beta tester, you'll get early access to new features and help shape
      the future of Energy Today.
      
      ${tester.platform === "ios" ? "TestFlight Link: [iOS Link]" : ""}
      ${tester.platform === "android" ? "Play Store Link: [Android Link]" : ""}
      ${tester.platform === "both" ? "TestFlight Link: [iOS Link]\nPlay Store Link: [Android Link]" : ""}
      
      We're excited to have you on board!
      
      Best regards,
      The Energy Today Team
    `,
  };
  
  console.log("Invitation email:", invitationEmail);
}

/**
 * Export beta data for analysis
 */
export async function exportBetaData(): Promise<{
  testers: BetaTester[];
  feedback: BetaFeedback[];
  builds: BetaBuild[];
  stats: Awaited<ReturnType<typeof getBetaStats>>;
}> {
  const testers = await getBetaTesters();
  const feedback = await getBetaFeedback();
  const builds = await getBetaBuilds();
  const stats = await getBetaStats();
  
  return {
    testers,
    feedback,
    builds,
    stats,
  };
}

/**
 * Clear all beta data
 */
export async function clearBetaData(): Promise<void> {
  try {
    await AsyncStorage.removeItem(BETA_TESTERS_KEY);
    await AsyncStorage.removeItem(BETA_FEEDBACK_KEY);
    await AsyncStorage.removeItem(BETA_BUILDS_KEY);
    console.log("Beta data cleared");
  } catch (error) {
    console.error("Failed to clear beta data:", error);
    throw error;
  }
}

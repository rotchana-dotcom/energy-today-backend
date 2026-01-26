/**
 * External Integrations
 * Voice assistants, email, and other third-party services
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { canAccessVoiceAssistant, canAccessEmailIntegration } from "./feature-gates";

const STORAGE_KEY = "integrations";

// ============================================================================
// Voice Assistant Integration (Phase 141)
// ============================================================================

export interface VoiceCommand {
  intent: string;
  entities: Record<string, any>;
  confidence: number;
  rawText: string;
}

export interface VoiceResponse {
  text: string;
  action?: {
    type: string;
    params: Record<string, any>;
  };
}

/**
 * Process voice command
 */
export async function processVoiceCommand(text: string): Promise<VoiceResponse> {
  const access = await canAccessVoiceAssistant();
  if (!access.allowed) {
    return {
      text: access.upgradeMessage || "Voice assistant requires Energy Today Pro",
    };
  }
  
  const command = parseVoiceCommand(text);
  
  switch (command.intent) {
    case "log_energy":
      return {
        text: `I'll log your energy level as ${command.entities.level}`,
        action: { type: "log_energy", params: { level: command.entities.level } },
      };
    
    case "check_energy":
      return {
        text: "Your current energy level is 7 out of 10. You're feeling productive!",
      };
    
    case "log_sleep":
      return {
        text: `I'll record ${command.entities.hours} hours of sleep`,
        action: { type: "log_sleep", params: { hours: command.entities.hours } },
      };
    
    case "get_insights":
      return {
        text: "Based on your patterns, you have peak energy between 9 AM and 11 AM. Schedule important work during this time.",
      };
    
    case "create_habit":
      return {
        text: `I'll create a habit to ${command.entities.habit}`,
        action: { type: "create_habit", params: { name: command.entities.habit } },
      };
    
    default:
      return {
        text: "I'm not sure how to help with that. You can ask me to log energy, check sleep, or get insights.",
      };
  }
}

/**
 * Parse voice command
 */
function parseVoiceCommand(text: string): VoiceCommand {
  const lower = text.toLowerCase();
  
  // Log energy
  if (lower.includes("log") && (lower.includes("energy") || lower.includes("level"))) {
    const levelMatch = lower.match(/(\d+)/);
    return {
      intent: "log_energy",
      entities: { level: levelMatch ? parseInt(levelMatch[1]) : 5 },
      confidence: 0.9,
      rawText: text,
    };
  }
  
  // Check energy
  if ((lower.includes("what") || lower.includes("how")) && lower.includes("energy")) {
    return {
      intent: "check_energy",
      entities: {},
      confidence: 0.9,
      rawText: text,
    };
  }
  
  // Log sleep
  if (lower.includes("sleep") || lower.includes("slept")) {
    const hoursMatch = lower.match(/(\d+)\s*(hour|hr)/);
    return {
      intent: "log_sleep",
      entities: { hours: hoursMatch ? parseInt(hoursMatch[1]) : 8 },
      confidence: 0.85,
      rawText: text,
    };
  }
  
  // Get insights
  if (lower.includes("insight") || lower.includes("pattern") || lower.includes("recommend")) {
    return {
      intent: "get_insights",
      entities: {},
      confidence: 0.8,
      rawText: text,
    };
  }
  
  // Create habit
  if (lower.includes("create") && lower.includes("habit")) {
    const habitMatch = lower.match(/habit\s+(?:to\s+)?(.+)/);
    return {
      intent: "create_habit",
      entities: { habit: habitMatch ? habitMatch[1] : "new habit" },
      confidence: 0.85,
      rawText: text,
    };
  }
  
  return {
    intent: "unknown",
    entities: {},
    confidence: 0.0,
    rawText: text,
  };
}

/**
 * Get voice assistant shortcuts
 */
export function getVoiceShortcuts(): Array<{ phrase: string; description: string }> {
  return [
    { phrase: "Log my energy as 8", description: "Record your current energy level" },
    { phrase: "How's my energy today?", description: "Check your current energy" },
    { phrase: "I slept 7 hours", description: "Log your sleep duration" },
    { phrase: "Show me insights", description: "Get AI-powered recommendations" },
    { phrase: "Create a habit to meditate", description: "Add a new habit" },
    { phrase: "What's my energy forecast?", description: "See predicted energy levels" },
  ];
}

// ============================================================================
// Email Integration (Phase 143)
// ============================================================================

export interface EmailConfig {
  provider: "gmail" | "outlook" | "other";
  email: string;
  connected: boolean;
  lastSync?: Date;
  syncEnabled: boolean;
}

export interface EmailDigest {
  type: "daily" | "weekly" | "monthly";
  enabled: boolean;
  time: string; // HH:mm format
  includeInsights: boolean;
  includeProgress: boolean;
  includeRecommendations: boolean;
}

/**
 * Get email config
 */
export async function getEmailConfig(): Promise<EmailConfig | null> {
  const key = `${STORAGE_KEY}_email`;
  const data = await AsyncStorage.getItem(key);
  
  if (!data) return null;
  
  const config = JSON.parse(data);
  return {
    ...config,
    lastSync: config.lastSync ? new Date(config.lastSync) : undefined,
  };
}

/**
 * Connect email
 */
export async function connectEmail(
  provider: EmailConfig["provider"],
  email: string
): Promise<void> {
  const access = await canAccessEmailIntegration();
  if (!access.allowed) {
    throw new Error(access.upgradeMessage || "Pro subscription required");
  }
  
  const config: EmailConfig = {
    provider,
    email,
    connected: true,
    lastSync: new Date(),
    syncEnabled: true,
  };
  
  const key = `${STORAGE_KEY}_email`;
  await AsyncStorage.setItem(key, JSON.stringify(config));
}

/**
 * Disconnect email
 */
export async function disconnectEmail(): Promise<void> {
  const key = `${STORAGE_KEY}_email`;
  await AsyncStorage.removeItem(key);
}

/**
 * Get email digest settings
 */
export async function getEmailDigestSettings(): Promise<EmailDigest[]> {
  const key = `${STORAGE_KEY}_email_digest`;
  const data = await AsyncStorage.getItem(key);
  
  if (!data) {
    return [
      {
        type: "daily",
        enabled: true,
        time: "08:00",
        includeInsights: true,
        includeProgress: true,
        includeRecommendations: true,
      },
      {
        type: "weekly",
        enabled: true,
        time: "09:00",
        includeInsights: true,
        includeProgress: true,
        includeRecommendations: true,
      },
      {
        type: "monthly",
        enabled: false,
        time: "10:00",
        includeInsights: true,
        includeProgress: true,
        includeRecommendations: true,
      },
    ];
  }
  
  return JSON.parse(data);
}

/**
 * Update email digest settings
 */
export async function updateEmailDigestSettings(
  type: EmailDigest["type"],
  updates: Partial<EmailDigest>
): Promise<void> {
  const settings = await getEmailDigestSettings();
  const index = settings.findIndex(s => s.type === type);
  
  if (index !== -1) {
    settings[index] = { ...settings[index], ...updates };
  }
  
  const key = `${STORAGE_KEY}_email_digest`;
  await AsyncStorage.setItem(key, JSON.stringify(settings));
}

/**
 * Generate email digest content
 */
export async function generateEmailDigest(type: EmailDigest["type"]): Promise<{
  subject: string;
  html: string;
}> {
  const settings = await getEmailDigestSettings();
  const digest = settings.find(s => s.type === type);
  
  if (!digest || !digest.enabled) {
    throw new Error("Digest not enabled");
  }
  
  const subject = 
    type === "daily" ? "Your Daily Energy Summary" :
    type === "weekly" ? "Your Weekly Energy Report" :
    "Your Monthly Energy Review";
  
  const html = `
    <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0A7EA4;">${subject}</h1>
        
        ${digest.includeProgress ? `
        <h2>Progress</h2>
        <p>You logged energy 23 times this ${type === "daily" ? "day" : type === "weekly" ? "week" : "month"}.</p>
        <p>Average energy level: <strong>7.2/10</strong></p>
        ` : ""}
        
        ${digest.includeInsights ? `
        <h2>Insights</h2>
        <ul>
          <li>Your energy peaks between 9 AM and 11 AM</li>
          <li>You have 30% more energy after 8+ hours of sleep</li>
          <li>Exercise in the morning boosts your energy by 2 points</li>
        </ul>
        ` : ""}
        
        ${digest.includeRecommendations ? `
        <h2>Recommendations</h2>
        <ul>
          <li>Schedule important work during your peak energy hours</li>
          <li>Aim for 8 hours of sleep tonight</li>
          <li>Try a 10-minute morning walk</li>
        </ul>
        ` : ""}
        
        <p style="margin-top: 30px; color: #666;">
          <a href="https://energytoday.app" style="color: #0A7EA4;">Open Energy Today</a>
        </p>
      </body>
    </html>
  `;
  
  return { subject, html };
}

/**
 * Send email digest
 */
export async function sendEmailDigest(type: EmailDigest["type"]): Promise<void> {
  const access = await canAccessEmailIntegration();
  if (!access.allowed) {
    throw new Error(access.upgradeMessage || "Pro subscription required");
  }
  
  const config = await getEmailConfig();
  if (!config || !config.connected) {
    throw new Error("Email not connected");
  }
  
  const { subject, html } = await generateEmailDigest(type);
  
  // In production, send via email API
  console.log(`Sending ${type} digest to ${config.email}`);
  console.log(`Subject: ${subject}`);
}

/**
 * Get email templates
 */
export function getEmailTemplates(): Array<{
  id: string;
  name: string;
  description: string;
  preview: string;
}> {
  return [
    {
      id: "welcome",
      name: "Welcome Email",
      description: "Sent to new users after signup",
      preview: "Welcome to Energy Today! Let's get started...",
    },
    {
      id: "daily_digest",
      name: "Daily Digest",
      description: "Daily energy summary and insights",
      preview: "Your Daily Energy Summary - Average: 7.2/10",
    },
    {
      id: "weekly_report",
      name: "Weekly Report",
      description: "Weekly progress and recommendations",
      preview: "Your Weekly Energy Report - 23 logs this week",
    },
    {
      id: "achievement",
      name: "Achievement Unlocked",
      description: "Sent when user earns a badge",
      preview: "Congratulations! You've earned the 7-Day Streak badge",
    },
    {
      id: "reminder",
      name: "Activity Reminder",
      description: "Reminds users to log energy",
      preview: "Don't forget to log your energy today!",
    },
  ];
}

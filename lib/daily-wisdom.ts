import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUserProfile } from "./storage";
import { getUnifiedEnergyReading } from "./unified-energy-engine";
import { getCurrentLunarContext } from "./lunar-context";

export interface DailyWisdom {
  date: string; // YYYY-MM-DD
  wisdom: string;
  actionableSteps: string[];
  confidence: number; // 0-100
  generatedAt: string; // ISO timestamp
}

const STORAGE_KEY = "@energy_today_daily_wisdom";

/**
 * Get today's wisdom (from cache or generate new)
 */
export async function getTodaysWisdom(): Promise<DailyWisdom | null> {
  const today = new Date().toISOString().split("T")[0];
  
  // Check if we already have today's wisdom
  const cached = await AsyncStorage.getItem(STORAGE_KEY);
  if (cached) {
    const wisdom: DailyWisdom = JSON.parse(cached);
    if (wisdom.date === today) {
      return wisdom;
    }
  }
  
  // Generate new wisdom for today
  return await generateDailyWisdom();
}

/**
 * Generate new daily wisdom using all 7 systems + user data
 */
export async function generateDailyWisdom(): Promise<DailyWisdom | null> {
  try {
    const profile = await getUserProfile();
    if (!profile || !profile.birthDate) {
      return null;
    }
    
    const today = new Date().toISOString().split("T")[0];
    const reading = await getUnifiedEnergyReading(profile);
    const lunarContext = getCurrentLunarContext();
    
    // For now, generate wisdom from the unified energy reading
    // In production, this would call the AI backend with a special "daily wisdom" prompt
    const wisdom: DailyWisdom = {
      date: today,
      wisdom: generateWisdomText(reading, lunarContext),
      actionableSteps: generateActionableSteps(reading),
      confidence: reading.confidenceScore || 75,
      generatedAt: new Date().toISOString(),
    };
    
    // Cache it
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(wisdom));
    
    return wisdom;
  } catch (error) {
    console.error("Failed to generate daily wisdom:", error);
    return null;
  }
}

/**
 * Generate wisdom text from energy reading
 */
function generateWisdomText(reading: any, lunarContext: any): string {
  const { overallScore, peakHours } = reading;
  const { phase, illumination } = lunarContext;
  
  const score = overallScore || 70;
  const peak = peakHours?.[0] || "morning";
  
  if (score >= 80) {
    return `Today is a high-energy day (${score}/100). The ${phase} moon at ${Math.round(illumination * 100)}% illumination amplifies your natural rhythms. Your peak performance window is during ${peak}. This is your day to tackle ambitious goals and make bold moves.`;
  } else if (score >= 60) {
    return `Today brings balanced energy (${score}/100). The ${phase} moon suggests steady progress over dramatic action. Your energy peaks during ${peak}. Focus on consistent execution rather than starting new ventures.`;
  } else {
    return `Today calls for conservation and reflection (${score}/100). The ${phase} moon at ${Math.round(illumination * 100)}% illumination signals a time for rest and planning. Your clearest thinking comes during ${peak}. Use this day to prepare for the high-energy days ahead.`;
  }
}

/**
 * Generate actionable steps from energy reading
 */
function generateActionableSteps(reading: any): string[] {
  const { overallScore, peakHours, recommendations } = reading;
  const score = overallScore || 70;
  const peak = peakHours?.[0] || "morning";
  
  const steps: string[] = [];
  
  if (score >= 80) {
    steps.push(`Schedule your most important meeting or decision during ${peak}`);
    steps.push("Take on a challenge you've been postponing");
    steps.push("Network or pitch new ideas - your energy is contagious");
  } else if (score >= 60) {
    steps.push(`Block ${peak} for focused work on existing projects`);
    steps.push("Complete 3-5 medium-priority tasks");
    steps.push("Avoid starting major new initiatives");
  } else {
    steps.push(`Use ${peak} for planning and strategy, not execution`);
    steps.push("Delegate or postpone non-urgent tasks");
    steps.push("Prioritize rest, meditation, and preparation");
  }
  
  // Add custom recommendations if available
  if (recommendations && Array.isArray(recommendations)) {
    steps.push(...recommendations.slice(0, 2));
  }
  
  return steps.slice(0, 4); // Max 4 steps
}

/**
 * Clear cached wisdom (for testing)
 */
export async function clearDailyWisdom(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}

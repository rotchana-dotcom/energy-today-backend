import AsyncStorage from "@react-native-async-storage/async-storage";
import { saveSocialData, type SocialData } from "@/app/services/correlation-engine";

export interface SocialInteraction {
  id: string;
  date: string; // ISO date string
  time?: string; // HH:MM format (24-hour)
  type: "meeting" | "call" | "event" | "solo_time" | "social_gathering" | "one_on_one";
  title: string;
  duration: number; // minutes
  participants?: string[]; // Names of people involved
  energyBefore?: number; // 0-100
  energyAfter?: number; // 0-100
  notes?: string;
  createdAt: string;
}

export interface SocialEnergyStats {
  totalInteractions: number;
  totalSocialTime: number; // minutes
  totalSoloTime: number; // minutes
  averageEnergyImpact: number;
  bestInteractionType: string;
  worstInteractionType: string;
  socialBatteryLevel: number; // 0-100, based on recent interactions
}

export interface PersonImpact {
  name: string;
  interactions: number;
  averageEnergyImpact: number;
  totalTime: number; // minutes
  recommendation: "energizing" | "neutral" | "draining";
}

const STORAGE_KEY = "social_interactions";

/**
 * Save a social interaction
 */
export async function saveSocialInteraction(
  interaction: Omit<SocialInteraction, "id" | "createdAt">
): Promise<void> {
  try {
    const newInteraction: SocialInteraction = {
      ...interaction,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    const interactions = await getSocialInteractions();
    interactions.push(newInteraction);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(interactions));
    
    // Also save to correlation engine
    const energyImpact = 
      interaction.energyBefore !== undefined && interaction.energyAfter !== undefined
        ? interaction.energyAfter > interaction.energyBefore
          ? "energizing"
          : interaction.energyAfter < interaction.energyBefore - 10
          ? "draining"
          : "neutral"
        : "neutral";
    
    const correlationData: SocialData = {
      date: interaction.date,
      type: interaction.type,
      duration: interaction.duration,
      people: interaction.participants || [],
      energyImpact,
      notes: interaction.notes,
    };
    
    await saveSocialData(correlationData);
  } catch (error) {
    console.error("Failed to save social interaction:", error);
    throw error;
  }
}

/**
 * Get all social interactions
 */
export async function getSocialInteractions(): Promise<SocialInteraction[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to get social interactions:", error);
    return [];
  }
}

/**
 * Get recent social interactions
 */
export async function getRecentSocialInteractions(days: number = 7): Promise<SocialInteraction[]> {
  const interactions = await getSocialInteractions();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return interactions
    .filter((interaction) => new Date(interaction.date) >= cutoffDate)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Delete a social interaction
 */
export async function deleteSocialInteraction(interactionId: string): Promise<void> {
  try {
    const interactions = await getSocialInteractions();
    const filtered = interactions.filter((i) => i.id !== interactionId);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Failed to delete social interaction:", error);
    throw error;
  }
}

/**
 * Get social energy statistics
 */
export async function getSocialEnergyStats(days: number = 30): Promise<SocialEnergyStats> {
  const interactions = await getRecentSocialInteractions(days);

  if (interactions.length === 0) {
    return {
      totalInteractions: 0,
      totalSocialTime: 0,
      totalSoloTime: 0,
      averageEnergyImpact: 0,
      bestInteractionType: "one_on_one",
      worstInteractionType: "meeting",
      socialBatteryLevel: 100,
    };
  }

  const totalSocialTime = interactions
    .filter((i) => i.type !== "solo_time")
    .reduce((sum, i) => sum + i.duration, 0);

  const totalSoloTime = interactions
    .filter((i) => i.type === "solo_time")
    .reduce((sum, i) => sum + i.duration, 0);

  // Calculate average energy impact
  const interactionsWithEnergy = interactions.filter(
    (i) => i.energyBefore !== undefined && i.energyAfter !== undefined
  );

  const averageEnergyImpact =
    interactionsWithEnergy.length > 0
      ? interactionsWithEnergy.reduce(
          (sum, i) => sum + (i.energyAfter! - i.energyBefore!),
          0
        ) / interactionsWithEnergy.length
      : 0;

  // Find best and worst interaction types
  const typeImpact: { [key: string]: { total: number; count: number } } = {};
  interactionsWithEnergy.forEach((interaction) => {
    if (!typeImpact[interaction.type]) {
      typeImpact[interaction.type] = { total: 0, count: 0 };
    }
    typeImpact[interaction.type].total += interaction.energyAfter! - interaction.energyBefore!;
    typeImpact[interaction.type].count += 1;
  });

  let bestInteractionType = "one_on_one";
  let worstInteractionType = "meeting";
  let highestImpact = -Infinity;
  let lowestImpact = Infinity;

  Object.entries(typeImpact).forEach(([type, data]) => {
    const avgImpact = data.total / data.count;
    if (avgImpact > highestImpact) {
      highestImpact = avgImpact;
      bestInteractionType = type;
    }
    if (avgImpact < lowestImpact) {
      lowestImpact = avgImpact;
      worstInteractionType = type;
    }
  });

  // Calculate social battery level (based on recent 7 days)
  const recentWeek = await getRecentSocialInteractions(7);
  const recentSocialTime = recentWeek
    .filter((i) => i.type !== "solo_time")
    .reduce((sum, i) => sum + i.duration, 0);
  const recentSoloTime = recentWeek
    .filter((i) => i.type === "solo_time")
    .reduce((sum, i) => sum + i.duration, 0);

  // Battery depletes with social time, recharges with solo time
  // Assume 3 hours/day social = 50% battery, 6 hours = 0%, 0 hours = 100%
  const dailySocialHours = recentSocialTime / 60 / 7;
  const dailySoloHours = recentSoloTime / 60 / 7;
  
  let socialBatteryLevel = 100 - (dailySocialHours / 6) * 100;
  socialBatteryLevel += (dailySoloHours / 4) * 20; // Solo time recharges
  socialBatteryLevel = Math.max(0, Math.min(100, socialBatteryLevel));

  return {
    totalInteractions: interactions.length,
    totalSocialTime,
    totalSoloTime,
    averageEnergyImpact: Math.round(averageEnergyImpact),
    bestInteractionType,
    worstInteractionType,
    socialBatteryLevel: Math.round(socialBatteryLevel),
  };
}

/**
 * Analyze person/activity impact on energy
 */
export async function analyzePersonImpact(): Promise<PersonImpact[]> {
  const interactions = await getSocialInteractions();
  const interactionsWithEnergy = interactions.filter(
    (i) => i.energyBefore !== undefined && i.energyAfter !== undefined && i.participants
  );

  if (interactionsWithEnergy.length < 3) {
    return [];
  }

  // Build person impact map
  const personImpact: {
    [name: string]: { impacts: number[]; durations: number[] };
  } = {};

  interactionsWithEnergy.forEach((interaction) => {
    const impact = interaction.energyAfter! - interaction.energyBefore!;
    interaction.participants?.forEach((person) => {
      const normalized = person.trim();
      if (!personImpact[normalized]) {
        personImpact[normalized] = { impacts: [], durations: [] };
      }
      personImpact[normalized].impacts.push(impact);
      personImpact[normalized].durations.push(interaction.duration);
    });
  });

  // Calculate person impacts
  const impacts: PersonImpact[] = [];
  Object.entries(personImpact).forEach(([name, data]) => {
    if (data.impacts.length >= 2) {
      const avgImpact = data.impacts.reduce((sum, i) => sum + i, 0) / data.impacts.length;
      const totalTime = data.durations.reduce((sum, d) => sum + d, 0);

      let recommendation: "energizing" | "neutral" | "draining";
      if (avgImpact > 5) {
        recommendation = "energizing";
      } else if (avgImpact < -5) {
        recommendation = "draining";
      } else {
        recommendation = "neutral";
      }

      impacts.push({
        name,
        interactions: data.impacts.length,
        averageEnergyImpact: Math.round(avgImpact),
        totalTime,
        recommendation,
      });
    }
  });

  // Sort by absolute impact
  return impacts.sort(
    (a, b) => Math.abs(b.averageEnergyImpact) - Math.abs(a.averageEnergyImpact)
  );
}

/**
 * Get social energy insights
 */
export async function getSocialEnergyInsights(): Promise<string[]> {
  const stats = await getSocialEnergyStats(30);
  const personImpacts = await analyzePersonImpact();
  const insights: string[] = [];

  if (stats.totalInteractions === 0) {
    insights.push("Start tracking social interactions to understand your social energy patterns");
    return insights;
  }

  // Social battery insights
  if (stats.socialBatteryLevel < 30) {
    insights.push(
      `Your social battery is low (${stats.socialBatteryLevel}%) - schedule some solo recharge time`
    );
  } else if (stats.socialBatteryLevel > 80) {
    insights.push(`Your social battery is high (${stats.socialBatteryLevel}%) - great balance!`);
  } else {
    insights.push(
      `Social battery at ${stats.socialBatteryLevel}% - you're managing your energy well`
    );
  }

  // Social vs solo time balance
  const totalTime = stats.totalSocialTime + stats.totalSoloTime;
  if (totalTime > 0) {
    const socialPercent = Math.round((stats.totalSocialTime / totalTime) * 100);
    if (socialPercent > 70) {
      insights.push(
        `${socialPercent}% of tracked time is social - consider adding more solo recharge time`
      );
    } else if (socialPercent < 30) {
      insights.push(
        `Only ${socialPercent}% social time - you might benefit from more social connection`
      );
    }
  }

  // Interaction type insights
  if (stats.averageEnergyImpact > 5) {
    insights.push(
      `${stats.bestInteractionType.replace("_", " ")} activities boost your energy most (+${stats.averageEnergyImpact})`
    );
  } else if (stats.averageEnergyImpact < -5) {
    insights.push(
      `${stats.worstInteractionType.replace("_", " ")} tends to drain your energy (${stats.averageEnergyImpact}) - limit when possible`
    );
  }

  // Person impact insights
  const energizing = personImpacts.filter((p) => p.recommendation === "energizing").slice(0, 2);
  const draining = personImpacts.filter((p) => p.recommendation === "draining").slice(0, 2);

  if (energizing.length > 0) {
    const names = energizing.map((p) => p.name).join(", ");
    insights.push(`Most energizing: ${names} - prioritize time with them`);
  }

  if (draining.length > 0) {
    const names = draining.map((p) => p.name).join(", ");
    insights.push(`Most draining: ${names} - limit duration or add recovery time after`);
  }

  // Solo time recommendation
  if (stats.totalSoloTime < 300) {
    // Less than 5 hours in 30 days
    insights.push("Very little solo time tracked - make sure to schedule regular recharge periods");
  }

  return insights;
}

/**
 * Get social energy recommendations
 */
export async function getSocialEnergyRecommendations(): Promise<string[]> {
  const stats = await getSocialEnergyStats(7);
  const recommendations: string[] = [];

  // Battery-based recommendations
  if (stats.socialBatteryLevel < 30) {
    recommendations.push("🔋 Low battery: Cancel non-essential social plans and prioritize alone time");
    recommendations.push("📚 Try solo activities: reading, walking, creative hobbies");
    recommendations.push("🚫 Set boundaries: It's okay to say no to invitations");
  } else if (stats.socialBatteryLevel > 80) {
    recommendations.push("⚡ High energy: Great time for networking or group activities");
    recommendations.push("👥 Reach out to friends you haven't seen in a while");
  } else {
    recommendations.push("⚖️ Balanced: Mix social and solo activities as you feel comfortable");
  }

  // Type-based recommendations
  if (stats.bestInteractionType === "one_on_one") {
    recommendations.push("💬 You thrive in one-on-one settings - suggest coffee over group dinners");
  } else if (stats.bestInteractionType === "social_gathering") {
    recommendations.push("🎉 You love group energy - organize or attend social events");
  } else if (stats.bestInteractionType === "solo_time") {
    recommendations.push("🧘 Solo time energizes you - protect your alone time fiercely");
  }

  return recommendations;
}

/**
 * Get interaction type emoji
 */
export function getInteractionTypeEmoji(type: string): string {
  switch (type) {
    case "meeting":
      return "💼";
    case "call":
      return "📞";
    case "event":
      return "🎉";
    case "solo_time":
      return "🧘";
    case "social_gathering":
      return "👥";
    case "one_on_one":
      return "☕";
    default:
      return "📅";
  }
}

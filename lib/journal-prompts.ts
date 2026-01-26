import { DailyEnergy } from "@/types";

export interface JournalPrompt {
  prompt: string;
  category: "reflection" | "action" | "planning" | "gratitude" | "challenge";
}

/**
 * Generate smart journaling prompts based on energy level and alignment
 */
export function generateJournalPrompts(
  dailyEnergy: DailyEnergy
): JournalPrompt[] {
  const { userEnergy, environmentalEnergy, connection } = dailyEnergy;
  const alignment = connection.alignment;
  const userIntensity = userEnergy.intensity;
  const envIntensity = environmentalEnergy.intensity;
  
  const prompts: JournalPrompt[] = [];
  
  // High user energy prompts
  if (userIntensity >= 75) {
    prompts.push({
      prompt: "Your energy is high today—what bold action will you take?",
      category: "action",
    });
    prompts.push({
      prompt: "What ambitious goal can you make progress on with this momentum?",
      category: "planning",
    });
  }
  
  // Low user energy prompts
  if (userIntensity < 40) {
    prompts.push({
      prompt: "Low energy day—what can you delegate or postpone?",
      category: "planning",
    });
    prompts.push({
      prompt: "How can you be gentle with yourself today?",
      category: "reflection",
    });
    prompts.push({
      prompt: "What small win would make today feel successful?",
      category: "action",
    });
  }
  
  // Strong alignment prompts
  if (alignment === "strong") {
    prompts.push({
      prompt: "Today's alignment is perfect—what important decision can you make?",
      category: "action",
    });
    prompts.push({
      prompt: "Your flow is strong. What creative project calls to you?",
      category: "action",
    });
    prompts.push({
      prompt: "With this energy, what conversation have you been avoiding?",
      category: "challenge",
    });
  }
  
  // Moderate alignment prompts
  if (alignment === "moderate") {
    prompts.push({
      prompt: "Steady energy today—what consistent progress can you make?",
      category: "action",
    });
    prompts.push({
      prompt: "What routine tasks can you complete with ease today?",
      category: "planning",
    });
  }
  
  // Challenging alignment prompts
  if (alignment === "challenging") {
    prompts.push({
      prompt: "Energy feels off today—what's one thing you can let go of?",
      category: "reflection",
    });
    prompts.push({
      prompt: "What support do you need to get through today?",
      category: "planning",
    });
    prompts.push({
      prompt: "Despite the challenge, what are you grateful for right now?",
      category: "gratitude",
    });
  }
  
  // High environmental energy prompts
  if (envIntensity >= 75) {
    prompts.push({
      prompt: "The world's energy is high—how can you ride this wave?",
      category: "action",
    });
    prompts.push({
      prompt: "External momentum is strong. What opportunity can you seize?",
      category: "planning",
    });
  }
  
  // Low environmental energy prompts
  if (envIntensity < 40) {
    prompts.push({
      prompt: "External energy is low—what internal work can you focus on?",
      category: "reflection",
    });
    prompts.push({
      prompt: "Quiet day outside. What personal project needs attention?",
      category: "planning",
    });
  }
  
  // Contrasting energy prompts
  if (Math.abs(userIntensity - envIntensity) > 30) {
    if (userIntensity > envIntensity) {
      prompts.push({
        prompt: "Your energy exceeds the world's today—how can you lead?",
        category: "action",
      });
    } else {
      prompts.push({
        prompt: "The world's energy is higher than yours—where can you receive support?",
        category: "reflection",
      });
    }
  }
  
  // General prompts (always available)
  prompts.push({
    prompt: "What pattern are you noticing in your energy this week?",
    category: "reflection",
  });
  prompts.push({
    prompt: "What's working well in your current approach?",
    category: "gratitude",
  });
  prompts.push({
    prompt: "If you could change one thing about today, what would it be?",
    category: "challenge",
  });
  
  // Return top 5 most relevant prompts
  return prompts.slice(0, 5);
}

/**
 * Get a single featured prompt for the day
 */
export function getFeaturedPrompt(dailyEnergy: DailyEnergy): string {
  const prompts = generateJournalPrompts(dailyEnergy);
  
  // Prioritize action prompts on strong days, reflection on challenging days
  if (dailyEnergy.connection.alignment === "strong") {
    const actionPrompt = prompts.find((p) => p.category === "action");
    if (actionPrompt) return actionPrompt.prompt;
  }
  
  if (dailyEnergy.connection.alignment === "challenging") {
    const reflectionPrompt = prompts.find((p) => p.category === "reflection");
    if (reflectionPrompt) return reflectionPrompt.prompt;
  }
  
  // Default to first prompt
  return prompts[0]?.prompt || "How are you feeling today?";
}

/**
 * Get category-specific prompts
 */
export function getPromptsByCategory(
  dailyEnergy: DailyEnergy,
  category: JournalPrompt["category"]
): string[] {
  const allPrompts = generateJournalPrompts(dailyEnergy);
  return allPrompts
    .filter((p) => p.category === category)
    .map((p) => p.prompt);
}

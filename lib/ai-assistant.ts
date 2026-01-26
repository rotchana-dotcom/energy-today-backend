import AsyncStorage from "@react-native-async-storage/async-storage";

const ASSISTANT_SETTINGS_KEY = "ai_assistant_settings";
const CONVERSATION_HISTORY_KEY = "assistant_conversations";
const ASSISTANT_PREFERENCES_KEY = "assistant_preferences";

export interface AssistantSettings {
  enabled: boolean;
  voiceActivation: boolean;
  wakeWord: string;
  language: "en" | "es" | "fr" | "de" | "zh" | "ja";
  voiceGender: "male" | "female" | "neutral";
  personalityType: "professional" | "friendly" | "motivational" | "calm";
  proactiveSuggestions: boolean;
  contextAwareness: boolean;
  privacyMode: boolean;
}

export interface ConversationMessage {
  id: string;
  timestamp: string;
  role: "user" | "assistant";
  content: string;
  intent?: string;
  confidence?: number;
}

export interface AssistantResponse {
  message: string;
  intent: string;
  confidence: number;
  suggestions?: string[];
  data?: any;
}

export interface VoiceCommand {
  command: string;
  intent: string;
  parameters?: { [key: string]: any };
}

/**
 * Get assistant settings
 */
export async function getAssistantSettings(): Promise<AssistantSettings> {
  try {
    const data = await AsyncStorage.getItem(ASSISTANT_SETTINGS_KEY);
    if (data) {
      return JSON.parse(data);
    }
    
    return {
      enabled: true,
      voiceActivation: false,
      wakeWord: "Hey Energy",
      language: "en",
      voiceGender: "neutral",
      personalityType: "friendly",
      proactiveSuggestions: true,
      contextAwareness: true,
      privacyMode: false,
    };
  } catch (error) {
    console.error("Failed to get assistant settings:", error);
    return {
      enabled: true,
      voiceActivation: false,
      wakeWord: "Hey Energy",
      language: "en",
      voiceGender: "neutral",
      personalityType: "friendly",
      proactiveSuggestions: true,
      contextAwareness: true,
      privacyMode: false,
    };
  }
}

/**
 * Update assistant settings
 */
export async function updateAssistantSettings(
  settings: Partial<AssistantSettings>
): Promise<void> {
  try {
    const current = await getAssistantSettings();
    const updated = { ...current, ...settings };
    await AsyncStorage.setItem(ASSISTANT_SETTINGS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to update assistant settings:", error);
    throw error;
  }
}

/**
 * Process voice command
 */
export async function processVoiceCommand(
  voiceInput: string
): Promise<AssistantResponse> {
  const command = parseVoiceCommand(voiceInput);
  
  switch (command.intent) {
    case "log_energy":
      return await handleEnergyLogging(command);
    case "get_insights":
      return await handleInsightsQuery(command);
    case "schedule_activity":
      return await handleScheduling(command);
    case "check_status":
      return await handleStatusCheck(command);
    case "get_recommendations":
      return await handleRecommendations(command);
    case "track_habit":
      return await handleHabitTracking(command);
    default:
      return {
        message: "I'm not sure I understood that. Could you rephrase?",
        intent: "unknown",
        confidence: 0,
        suggestions: [
          "Log my energy level",
          "What's my energy today?",
          "Give me recommendations",
        ],
      };
  }
}

/**
 * Parse voice command to extract intent
 */
function parseVoiceCommand(input: string): VoiceCommand {
  const lowerInput = input.toLowerCase();
  
  // Energy logging patterns
  if (
    lowerInput.includes("log") &&
    (lowerInput.includes("energy") || lowerInput.includes("level"))
  ) {
    const levelMatch = lowerInput.match(/(\d+)/);
    return {
      command: input,
      intent: "log_energy",
      parameters: {
        level: levelMatch ? parseInt(levelMatch[1]) : null,
      },
    };
  }
  
  // Insights query patterns
  if (
    lowerInput.includes("what") &&
    (lowerInput.includes("energy") || lowerInput.includes("level"))
  ) {
    return {
      command: input,
      intent: "get_insights",
    };
  }
  
  // Scheduling patterns
  if (
    lowerInput.includes("schedule") ||
    lowerInput.includes("plan") ||
    lowerInput.includes("when should i")
  ) {
    return {
      command: input,
      intent: "schedule_activity",
      parameters: {
        activity: extractActivity(lowerInput),
      },
    };
  }
  
  // Status check patterns
  if (
    lowerInput.includes("how am i") ||
    lowerInput.includes("status") ||
    lowerInput.includes("progress")
  ) {
    return {
      command: input,
      intent: "check_status",
    };
  }
  
  // Recommendations patterns
  if (
    lowerInput.includes("recommend") ||
    lowerInput.includes("suggest") ||
    lowerInput.includes("what should i")
  ) {
    return {
      command: input,
      intent: "get_recommendations",
    };
  }
  
  // Habit tracking patterns
  if (
    lowerInput.includes("habit") ||
    lowerInput.includes("complete") ||
    lowerInput.includes("done with")
  ) {
    return {
      command: input,
      intent: "track_habit",
      parameters: {
        habit: extractHabit(lowerInput),
      },
    };
  }
  
  return {
    command: input,
    intent: "unknown",
  };
}

/**
 * Extract activity from command
 */
function extractActivity(input: string): string {
  const activities = ["workout", "meeting", "meditation", "meal", "sleep"];
  for (const activity of activities) {
    if (input.includes(activity)) {
      return activity;
    }
  }
  return "activity";
}

/**
 * Extract habit from command
 */
function extractHabit(input: string): string {
  const habits = ["exercise", "meditation", "reading", "water", "sleep"];
  for (const habit of habits) {
    if (input.includes(habit)) {
      return habit;
    }
  }
  return "habit";
}

/**
 * Handle energy logging
 */
async function handleEnergyLogging(
  command: VoiceCommand
): Promise<AssistantResponse> {
  const level = command.parameters?.level;
  
  if (!level || level < 1 || level > 100) {
    return {
      message: "What's your energy level on a scale of 1 to 100?",
      intent: "log_energy",
      confidence: 0.9,
      suggestions: ["50", "75", "30"],
    };
  }
  
  // In real implementation, would save to energy log
  
  let response = "";
  if (level >= 80) {
    response = `Great! I've logged your energy at ${level}. You're feeling energized! Perfect time for challenging tasks.`;
  } else if (level >= 50) {
    response = `Got it! Energy level ${level} logged. You're doing well. Consider taking on moderate activities.`;
  } else {
    response = `Energy level ${level} logged. You might benefit from a break or some light activity to boost your energy.`;
  }
  
  return {
    message: response,
    intent: "log_energy",
    confidence: 1.0,
    data: { level },
  };
}

/**
 * Handle insights query
 */
async function handleInsightsQuery(
  command: VoiceCommand
): Promise<AssistantResponse> {
  // In real implementation, would fetch actual data
  const currentEnergy = 65;
  const trend = "stable";
  const prediction = 70;
  
  const message = `Your current energy is ${currentEnergy} out of 100. Your energy has been ${trend} today. I predict your energy will be around ${prediction} in the next few hours.`;
  
  return {
    message,
    intent: "get_insights",
    confidence: 0.95,
    suggestions: [
      "What can I do to boost my energy?",
      "When is my best time for a workout?",
      "Show me my energy patterns",
    ],
    data: {
      currentEnergy,
      trend,
      prediction,
    },
  };
}

/**
 * Handle scheduling
 */
async function handleScheduling(
  command: VoiceCommand
): Promise<AssistantResponse> {
  const activity = command.parameters?.activity || "this activity";
  
  // In real implementation, would analyze energy patterns
  const optimalTime = "10:00 AM";
  const reason = "your energy is typically highest";
  
  const message = `Based on your energy patterns, I recommend scheduling ${activity} around ${optimalTime}, when ${reason}.`;
  
  return {
    message,
    intent: "schedule_activity",
    confidence: 0.85,
    suggestions: [
      "Schedule it now",
      "Show me other times",
      "Why that time?",
    ],
    data: {
      activity,
      optimalTime,
      reason,
    },
  };
}

/**
 * Handle status check
 */
async function handleStatusCheck(
  command: VoiceCommand
): Promise<AssistantResponse> {
  // In real implementation, would fetch actual stats
  const stats = {
    energyLevel: 65,
    habitsCompleted: 3,
    habitsTotal: 5,
    streakDays: 7,
  };
  
  const message = `You're doing great! Your energy is at ${stats.energyLevel}. You've completed ${stats.habitsCompleted} out of ${stats.habitsTotal} habits today, and you're on a ${stats.streakDays}-day streak!`;
  
  return {
    message,
    intent: "check_status",
    confidence: 1.0,
    suggestions: [
      "What habits are left?",
      "How can I improve?",
      "Show me my progress",
    ],
    data: stats,
  };
}

/**
 * Handle recommendations
 */
async function handleRecommendations(
  command: VoiceCommand
): Promise<AssistantResponse> {
  // In real implementation, would use AI to generate personalized recommendations
  const recommendations = [
    "Take a 10-minute walk to boost your energy",
    "Drink a glass of water - you haven't logged hydration today",
    "Try a 5-minute breathing exercise to reduce stress",
  ];
  
  const message = `Here are my top recommendations for you right now:\n\n${recommendations.map((r, i) => `${i + 1}. ${r}`).join("\n")}`;
  
  return {
    message,
    intent: "get_recommendations",
    confidence: 0.9,
    suggestions: recommendations,
    data: { recommendations },
  };
}

/**
 * Handle habit tracking
 */
async function handleHabitTracking(
  command: VoiceCommand
): Promise<AssistantResponse> {
  const habit = command.parameters?.habit || "your habit";
  
  // In real implementation, would mark habit as complete
  
  const message = `Awesome! I've marked "${habit}" as complete. Keep up the great work! 🎉`;
  
  return {
    message,
    intent: "track_habit",
    confidence: 0.95,
    suggestions: [
      "Show my habit streak",
      "What other habits do I have?",
      "Log my energy",
    ],
    data: { habit, completed: true },
  };
}

/**
 * Get proactive suggestions
 */
export async function getProactiveSuggestions(): Promise<string[]> {
  const settings = await getAssistantSettings();
  
  if (!settings.proactiveSuggestions) {
    return [];
  }
  
  const suggestions: string[] = [];
  const currentHour = new Date().getHours();
  
  // Morning suggestions
  if (currentHour >= 6 && currentHour < 9) {
    suggestions.push("Good morning! Don't forget to log your morning energy level.");
    suggestions.push("Start your day with a glass of water and a quick stretch.");
  }
  
  // Midday suggestions
  if (currentHour >= 12 && currentHour < 14) {
    suggestions.push("It's lunchtime! Remember to eat a balanced meal for sustained energy.");
    suggestions.push("Take a short walk after lunch to avoid the afternoon slump.");
  }
  
  // Afternoon suggestions
  if (currentHour >= 15 && currentHour < 17) {
    suggestions.push("Your energy might be dipping. Try a 5-minute breathing exercise.");
    suggestions.push("Stay hydrated! Drink some water to maintain your energy.");
  }
  
  // Evening suggestions
  if (currentHour >= 19 && currentHour < 22) {
    suggestions.push("Wind down with some light stretching or meditation.");
    suggestions.push("Review your day and log your evening energy level.");
  }
  
  // Night suggestions
  if (currentHour >= 22 || currentHour < 6) {
    suggestions.push("It's getting late. Consider preparing for bed to maintain good sleep hygiene.");
  }
  
  return suggestions;
}

/**
 * Get conversation history
 */
export async function getConversationHistory(): Promise<ConversationMessage[]> {
  try {
    const data = await AsyncStorage.getItem(CONVERSATION_HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to get conversation history:", error);
    return [];
  }
}

/**
 * Save conversation message
 */
export async function saveConversationMessage(
  message: Omit<ConversationMessage, "id" | "timestamp">
): Promise<void> {
  try {
    const history = await getConversationHistory();
    
    const newMessage: ConversationMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    };
    
    history.push(newMessage);
    
    // Keep last 1000 messages
    const trimmed = history.slice(-1000);
    
    await AsyncStorage.setItem(CONVERSATION_HISTORY_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error("Failed to save conversation message:", error);
    throw error;
  }
}

/**
 * Clear conversation history
 */
export async function clearConversationHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CONVERSATION_HISTORY_KEY);
  } catch (error) {
    console.error("Failed to clear conversation history:", error);
    throw error;
  }
}

/**
 * Get assistant personality response
 */
export function getPersonalityResponse(
  baseMessage: string,
  personality: AssistantSettings["personalityType"]
): string {
  switch (personality) {
    case "professional":
      return baseMessage;
    
    case "friendly":
      const friendlyPrefixes = ["Hey there! ", "Hi! ", "Hello! "];
      const friendlySuffixes = [" 😊", " 🌟", " ✨"];
      return (
        friendlyPrefixes[Math.floor(Math.random() * friendlyPrefixes.length)] +
        baseMessage +
        friendlySuffixes[Math.floor(Math.random() * friendlySuffixes.length)]
      );
    
    case "motivational":
      const motivationalPrefixes = [
        "You've got this! ",
        "Let's do this! ",
        "Great job! ",
      ];
      const motivationalSuffixes = [
        " Keep pushing forward! 💪",
        " You're doing amazing! 🚀",
        " Stay strong! 🌟",
      ];
      return (
        motivationalPrefixes[Math.floor(Math.random() * motivationalPrefixes.length)] +
        baseMessage +
        motivationalSuffixes[Math.floor(Math.random() * motivationalSuffixes.length)]
      );
    
    case "calm":
      const calmPrefixes = ["Take a moment... ", "Breathe... ", "Relax... "];
      const calmSuffixes = [" 🧘", " 🌿", " 🕊️"];
      return (
        calmPrefixes[Math.floor(Math.random() * calmPrefixes.length)] +
        baseMessage +
        calmSuffixes[Math.floor(Math.random() * calmSuffixes.length)]
      );
    
    default:
      return baseMessage;
  }
}

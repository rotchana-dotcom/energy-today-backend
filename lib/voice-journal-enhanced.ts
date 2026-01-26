import AsyncStorage from "@react-native-async-storage/async-storage";

const VOICE_JOURNAL_KEY = "voice_journal_entries";
const VOICE_SETTINGS_KEY = "voice_journal_settings";

export interface VoiceJournalEntry {
  id: string;
  timestamp: string;
  duration: number; // seconds
  transcription: string;
  audioUri?: string;
  energyLevel?: number;
  mood?: string;
  tags: string[];
  sentiment?: "positive" | "neutral" | "negative";
  keywords: string[];
}

export interface VoiceJournalSettings {
  autoTranscribe: boolean;
  saveAudio: boolean;
  autoDetectMood: boolean;
  autoSuggestTags: boolean;
  privacyMode: boolean; // Don't save audio, only transcription
}

export interface VoiceJournalInsights {
  totalEntries: number;
  totalDuration: number; // minutes
  mostCommonKeywords: { word: string; count: number }[];
  sentimentDistribution: { positive: number; neutral: number; negative: number };
  mostCommonTags: { tag: string; count: number }[];
  averageEnergyLevel: number;
  weeklyTrend: "improving" | "stable" | "declining";
}

/**
 * Get voice journal settings
 */
export async function getVoiceJournalSettings(): Promise<VoiceJournalSettings> {
  try {
    const data = await AsyncStorage.getItem(VOICE_SETTINGS_KEY);
    if (data) {
      return JSON.parse(data);
    }
    
    // Default settings
    return {
      autoTranscribe: true,
      saveAudio: true,
      autoDetectMood: true,
      autoSuggestTags: true,
      privacyMode: false,
    };
  } catch (error) {
    console.error("Failed to get voice journal settings:", error);
    return {
      autoTranscribe: true,
      saveAudio: true,
      autoDetectMood: true,
      autoSuggestTags: true,
      privacyMode: false,
    };
  }
}

/**
 * Update voice journal settings
 */
export async function updateVoiceJournalSettings(
  settings: Partial<VoiceJournalSettings>
): Promise<void> {
  try {
    const current = await getVoiceJournalSettings();
    const updated = { ...current, ...settings };
    await AsyncStorage.setItem(VOICE_SETTINGS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to update voice journal settings:", error);
    throw error;
  }
}

/**
 * Save voice journal entry
 */
export async function saveVoiceJournalEntry(
  entry: Omit<VoiceJournalEntry, "id">
): Promise<VoiceJournalEntry> {
  try {
    const entries = await getVoiceJournalEntries();
    const newEntry: VoiceJournalEntry = {
      ...entry,
      id: `voice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    
    entries.push(newEntry);
    
    // Keep last 1000 entries
    const trimmed = entries.slice(-1000);
    
    await AsyncStorage.setItem(VOICE_JOURNAL_KEY, JSON.stringify(trimmed));
    return newEntry;
  } catch (error) {
    console.error("Failed to save voice journal entry:", error);
    throw error;
  }
}

/**
 * Get all voice journal entries
 */
export async function getVoiceJournalEntries(): Promise<VoiceJournalEntry[]> {
  try {
    const data = await AsyncStorage.getItem(VOICE_JOURNAL_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to get voice journal entries:", error);
    return [];
  }
}

/**
 * Get voice journal entries for a date range
 */
export async function getVoiceJournalEntriesByDateRange(
  startDate: Date,
  endDate: Date
): Promise<VoiceJournalEntry[]> {
  const entries = await getVoiceJournalEntries();
  return entries.filter((entry) => {
    const entryDate = new Date(entry.timestamp);
    return entryDate >= startDate && entryDate <= endDate;
  });
}

/**
 * Update voice journal entry
 */
export async function updateVoiceJournalEntry(
  id: string,
  updates: Partial<VoiceJournalEntry>
): Promise<void> {
  try {
    const entries = await getVoiceJournalEntries();
    const updated = entries.map((entry) =>
      entry.id === id ? { ...entry, ...updates } : entry
    );
    await AsyncStorage.setItem(VOICE_JOURNAL_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to update voice journal entry:", error);
    throw error;
  }
}

/**
 * Delete voice journal entry
 */
export async function deleteVoiceJournalEntry(id: string): Promise<void> {
  try {
    const entries = await getVoiceJournalEntries();
    const filtered = entries.filter((entry) => entry.id !== id);
    await AsyncStorage.setItem(VOICE_JOURNAL_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Failed to delete voice journal entry:", error);
    throw error;
  }
}

/**
 * Transcribe audio (simulated - in real app would use speech-to-text API)
 */
export async function transcribeAudio(audioUri: string): Promise<string> {
  // In a real implementation, this would use:
  // - expo-speech-recognition for on-device transcription
  // - Or cloud API like Google Speech-to-Text, AWS Transcribe, etc.
  
  // For now, return a simulated transcription
  return "This is a simulated transcription of the voice note. In a real implementation, this would be the actual transcribed text from the audio recording.";
}

/**
 * Detect sentiment from text (simplified)
 */
export function detectSentiment(text: string): "positive" | "neutral" | "negative" {
  const lowerText = text.toLowerCase();
  
  const positiveWords = [
    "happy",
    "great",
    "good",
    "excellent",
    "wonderful",
    "amazing",
    "love",
    "excited",
    "energized",
    "motivated",
    "productive",
    "accomplished",
    "grateful",
    "blessed",
  ];
  
  const negativeWords = [
    "sad",
    "bad",
    "terrible",
    "awful",
    "hate",
    "angry",
    "frustrated",
    "tired",
    "exhausted",
    "stressed",
    "anxious",
    "worried",
    "depressed",
    "overwhelmed",
  ];
  
  let positiveCount = 0;
  let negativeCount = 0;
  
  positiveWords.forEach((word) => {
    if (lowerText.includes(word)) positiveCount++;
  });
  
  negativeWords.forEach((word) => {
    if (lowerText.includes(word)) negativeCount++;
  });
  
  if (positiveCount > negativeCount) return "positive";
  if (negativeCount > positiveCount) return "negative";
  return "neutral";
}

/**
 * Extract keywords from text (simplified)
 */
export function extractKeywords(text: string): string[] {
  const lowerText = text.toLowerCase();
  
  // Common energy-related keywords to look for
  const keywords = [
    "work",
    "exercise",
    "sleep",
    "stress",
    "energy",
    "tired",
    "productive",
    "focus",
    "meeting",
    "project",
    "deadline",
    "family",
    "friends",
    "health",
    "food",
    "coffee",
    "meditation",
    "workout",
    "rest",
    "break",
  ];
  
  return keywords.filter((keyword) => lowerText.includes(keyword));
}

/**
 * Suggest tags based on content (simplified)
 */
export function suggestTags(text: string, energyLevel?: number): string[] {
  const tags: string[] = [];
  const lowerText = text.toLowerCase();
  
  // Energy-based tags
  if (energyLevel !== undefined) {
    if (energyLevel >= 80) tags.push("high-energy");
    else if (energyLevel >= 60) tags.push("good-energy");
    else if (energyLevel >= 40) tags.push("moderate-energy");
    else tags.push("low-energy");
  }
  
  // Content-based tags
  if (lowerText.includes("work") || lowerText.includes("project")) {
    tags.push("work");
  }
  if (lowerText.includes("exercise") || lowerText.includes("workout")) {
    tags.push("exercise");
  }
  if (lowerText.includes("sleep") || lowerText.includes("tired")) {
    tags.push("sleep");
  }
  if (lowerText.includes("stress") || lowerText.includes("anxious")) {
    tags.push("stress");
  }
  if (lowerText.includes("family") || lowerText.includes("friends")) {
    tags.push("social");
  }
  if (lowerText.includes("food") || lowerText.includes("meal")) {
    tags.push("nutrition");
  }
  if (lowerText.includes("meditation") || lowerText.includes("mindfulness")) {
    tags.push("mindfulness");
  }
  
  return tags;
}

/**
 * Get voice journal insights
 */
export async function getVoiceJournalInsights(days: number = 30): Promise<VoiceJournalInsights> {
  const entries = await getVoiceJournalEntries();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  
  const recentEntries = entries.filter((entry) => new Date(entry.timestamp) >= cutoff);
  
  // Total duration
  const totalDuration = recentEntries.reduce((sum, entry) => sum + entry.duration, 0) / 60;
  
  // Keywords frequency
  const keywordCounts: { [key: string]: number } = {};
  recentEntries.forEach((entry) => {
    entry.keywords.forEach((keyword) => {
      keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
    });
  });
  
  const mostCommonKeywords = Object.entries(keywordCounts)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  
  // Sentiment distribution
  const sentimentCounts = {
    positive: recentEntries.filter((e) => e.sentiment === "positive").length,
    neutral: recentEntries.filter((e) => e.sentiment === "neutral").length,
    negative: recentEntries.filter((e) => e.sentiment === "negative").length,
  };
  
  // Tags frequency
  const tagCounts: { [key: string]: number } = {};
  recentEntries.forEach((entry) => {
    entry.tags.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });
  
  const mostCommonTags = Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  // Average energy level
  const entriesWithEnergy = recentEntries.filter((e) => e.energyLevel !== undefined);
  const averageEnergyLevel =
    entriesWithEnergy.length > 0
      ? entriesWithEnergy.reduce((sum, e) => sum + (e.energyLevel || 0), 0) /
        entriesWithEnergy.length
      : 0;
  
  // Weekly trend
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const lastWeek = recentEntries.filter((e) => new Date(e.timestamp) >= oneWeekAgo);
  const previousWeek = recentEntries.filter(
    (e) => new Date(e.timestamp) < oneWeekAgo && new Date(e.timestamp) >= cutoff
  );
  
  const lastWeekAvg =
    lastWeek.length > 0
      ? lastWeek
          .filter((e) => e.energyLevel !== undefined)
          .reduce((sum, e) => sum + (e.energyLevel || 0), 0) / lastWeek.length
      : 0;
  
  const previousWeekAvg =
    previousWeek.length > 0
      ? previousWeek
          .filter((e) => e.energyLevel !== undefined)
          .reduce((sum, e) => sum + (e.energyLevel || 0), 0) / previousWeek.length
      : 0;
  
  let weeklyTrend: "improving" | "stable" | "declining" = "stable";
  if (lastWeekAvg > previousWeekAvg + 5) weeklyTrend = "improving";
  else if (lastWeekAvg < previousWeekAvg - 5) weeklyTrend = "declining";
  
  return {
    totalEntries: recentEntries.length,
    totalDuration,
    mostCommonKeywords,
    sentimentDistribution: sentimentCounts,
    mostCommonTags,
    averageEnergyLevel,
    weeklyTrend,
  };
}

/**
 * Get weekly summary text
 */
export async function getWeeklySummary(): Promise<string> {
  const insights = await getVoiceJournalInsights(7);
  
  let summary = `This week you recorded ${insights.totalEntries} voice notes (${Math.round(insights.totalDuration)} minutes total). `;
  
  if (insights.mostCommonKeywords.length > 0) {
    const topKeywords = insights.mostCommonKeywords.slice(0, 3).map((k) => k.word);
    summary += `You mentioned "${topKeywords.join('", "')}" most frequently. `;
  }
  
  const totalSentiment =
    insights.sentimentDistribution.positive +
    insights.sentimentDistribution.neutral +
    insights.sentimentDistribution.negative;
  
  if (totalSentiment > 0) {
    const positivePercent = Math.round(
      (insights.sentimentDistribution.positive / totalSentiment) * 100
    );
    const negativePercent = Math.round(
      (insights.sentimentDistribution.negative / totalSentiment) * 100
    );
    
    if (positivePercent > 60) {
      summary += `Your overall sentiment was positive (${positivePercent}%). `;
    } else if (negativePercent > 40) {
      summary += `You expressed some challenges this week (${negativePercent}% negative sentiment). `;
    } else {
      summary += `Your sentiment was balanced this week. `;
    }
  }
  
  if (insights.averageEnergyLevel > 0) {
    summary += `Your average energy level was ${Math.round(insights.averageEnergyLevel)}/100. `;
  }
  
  if (insights.weeklyTrend === "improving") {
    summary += `Great news - your energy trend is improving! 📈`;
  } else if (insights.weeklyTrend === "declining") {
    summary += `Your energy trend is declining - consider more rest and self-care. 📉`;
  } else {
    summary += `Your energy levels remain stable. ➡️`;
  }
  
  return summary;
}

/**
 * Search voice journal entries
 */
export async function searchVoiceJournalEntries(query: string): Promise<VoiceJournalEntry[]> {
  const entries = await getVoiceJournalEntries();
  const lowerQuery = query.toLowerCase();
  
  return entries.filter(
    (entry) =>
      entry.transcription.toLowerCase().includes(lowerQuery) ||
      entry.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
      entry.keywords.some((keyword) => keyword.toLowerCase().includes(lowerQuery))
  );
}

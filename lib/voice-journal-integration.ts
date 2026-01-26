/**
 * Voice Journal Integration
 * 
 * Connects voice recordings to Whisper transcription and AI analysis
 */

export interface VoiceJournalAnalysis {
  transcription: string;
  language: string;
  emotionalTone: string;
  emotions: string[];
  energyLevel: string;
  themes: string[];
  insight: string;
}

/**
 * Note: This file provides types and utilities for voice journal.
 * The actual API calls should be made using tRPC hooks in React components:
 * 
 * const transcribeMutation = trpc.voiceJournal.transcribeAudio.useMutation();
 * const analyzeMutation = trpc.voiceJournal.analyzeJournalEntry.useMutation();
 * 
 * Then call: transcribeMutation.mutate({ audioUrl });
 */

/**
 * Get emotion emoji based on emotional tone
 */
export function getEmotionEmoji(tone: string): string {
  const emojiMap: Record<string, string> = {
    positive: "😊",
    negative: "😔",
    neutral: "😐",
    excited: "🤩",
    anxious: "😰",
    confident: "💪",
    grateful: "🙏",
    frustrated: "😤",
  };
  
  return emojiMap[tone.toLowerCase()] || "💭";
}

/**
 * Get energy level color
 */
export function getEnergyLevelColor(level: string): string {
  const colorMap: Record<string, string> = {
    high: "#22C55E",
    medium: "#F59E0B",
    low: "#EF4444",
  };
  
  return colorMap[level.toLowerCase()] || "#9BA1A6";
}

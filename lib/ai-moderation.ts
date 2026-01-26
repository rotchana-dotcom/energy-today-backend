import AsyncStorage from "@react-native-async-storage/async-storage";

const MODERATION_LOGS_KEY = "moderation_logs";
const FLAGGED_CONTENT_KEY = "flagged_content";
const USER_WARNINGS_KEY = "user_warnings";
const COMMUNITY_HEALTH_KEY = "community_health";

export type ModerationAction = 
  | "approve"
  | "flag"
  | "remove"
  | "warn_user"
  | "suspend_user"
  | "ban_user";

export type ContentType = "thread" | "post" | "comment" | "message";

export type ViolationType = 
  | "spam"
  | "harassment"
  | "hate_speech"
  | "explicit_content"
  | "misinformation"
  | "self_harm"
  | "violence"
  | "off_topic";

export interface ModerationResult {
  contentId: string;
  contentType: ContentType;
  action: ModerationAction;
  confidence: number; // 0-100
  violations: ViolationDetection[];
  sentiment: SentimentAnalysis;
  suggestedResponse?: string;
  timestamp: string;
  autoModerated: boolean;
  humanReviewRequired: boolean;
}

export interface ViolationDetection {
  type: ViolationType;
  confidence: number; // 0-100
  severity: "low" | "medium" | "high" | "critical";
  matchedPatterns: string[];
  context?: string;
}

export interface SentimentAnalysis {
  score: number; // -1 to 1 (-1 = very negative, 0 = neutral, 1 = very positive)
  label: "very_negative" | "negative" | "neutral" | "positive" | "very_positive";
  emotions: {
    anger: number; // 0-1
    fear: number; // 0-1
    joy: number; // 0-1
    sadness: number; // 0-1
    surprise: number; // 0-1
  };
}

export interface FlaggedContent {
  id: string;
  contentId: string;
  contentType: ContentType;
  content: string;
  authorId: string;
  violations: ViolationDetection[];
  status: "pending" | "reviewing" | "resolved" | "dismissed";
  flaggedDate: string;
  reviewedDate?: string;
  reviewerId?: string;
  reviewerNotes?: string;
  actionTaken?: ModerationAction;
}

export interface UserWarning {
  id: string;
  userId: string;
  violationType: ViolationType;
  contentId: string;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  issuedDate: string;
  acknowledged: boolean;
  acknowledgedDate?: string;
}

export interface RepeatOffender {
  userId: string;
  warningCount: number;
  violations: {
    type: ViolationType;
    count: number;
    lastOccurrence: string;
  }[];
  riskScore: number; // 0-100
  recommendedAction: ModerationAction;
}

export interface CommunityHealth {
  date: string;
  totalPosts: number;
  flaggedPosts: number;
  removedPosts: number;
  toxicityScore: number; // 0-100 (lower is better)
  sentimentScore: number; // -1 to 1
  activeModeration: number; // actions taken
  userReports: number;
  falsePositiveRate: number; // 0-1
}

export interface AIResponse {
  question: string;
  suggestedAnswer: string;
  confidence: number; // 0-100
  sources: string[];
  relatedTopics: string[];
}

/**
 * Moderate content with AI
 */
export async function moderateContent(
  contentId: string,
  contentType: ContentType,
  content: string,
  authorId: string
): Promise<ModerationResult> {
  try {
    // Detect violations
    const violations = await detectViolations(content);
    
    // Analyze sentiment
    const sentiment = await analyzeSentiment(content);
    
    // Determine action
    let action: ModerationAction = "approve";
    let humanReviewRequired = false;
    
    const criticalViolations = violations.filter((v) => v.severity === "critical");
    const highViolations = violations.filter((v) => v.severity === "high");
    
    if (criticalViolations.length > 0) {
      action = "remove";
      humanReviewRequired = true;
    } else if (highViolations.length > 0) {
      action = "flag";
      humanReviewRequired = true;
    } else if (violations.length > 0) {
      action = "flag";
    }
    
    // Calculate confidence
    const avgConfidence = violations.length > 0
      ? violations.reduce((sum, v) => sum + v.confidence, 0) / violations.length
      : 100;
    
    // Generate suggested response if needed
    let suggestedResponse: string | undefined;
    if (action === "flag" || action === "remove") {
      suggestedResponse = generateModerationMessage(violations);
    }
    
    const result: ModerationResult = {
      contentId,
      contentType,
      action,
      confidence: avgConfidence,
      violations,
      sentiment,
      suggestedResponse,
      timestamp: new Date().toISOString(),
      autoModerated: !humanReviewRequired,
      humanReviewRequired,
    };
    
    // Log moderation action
    await logModerationAction(result);
    
    // Flag content if needed
    if (action === "flag" || action === "remove") {
      await flagContent(contentId, contentType, content, authorId, violations);
    }
    
    // Check for repeat offenders
    if (violations.length > 0) {
      await checkRepeatOffender(authorId, violations);
    }
    
    return result;
  } catch (error) {
    console.error("Failed to moderate content:", error);
    throw error;
  }
}

/**
 * Detect violations in content
 */
async function detectViolations(content: string): Promise<ViolationDetection[]> {
  const violations: ViolationDetection[] = [];
  const lowerContent = content.toLowerCase();
  
  // Spam detection
  const spamPatterns = [
    { pattern: /buy now|click here|limited time|act now/gi, confidence: 70 },
    { pattern: /\b(viagra|cialis|pharmacy)\b/gi, confidence: 90 },
    { pattern: /(http|www)\S+/gi, confidence: 50 }, // Multiple links
  ];
  
  for (const { pattern, confidence } of spamPatterns) {
    const matches = content.match(pattern);
    if (matches && matches.length > 2) {
      violations.push({
        type: "spam",
        confidence,
        severity: "medium",
        matchedPatterns: matches.slice(0, 3),
      });
      break;
    }
  }
  
  // Harassment detection
  const harassmentPatterns = [
    { pattern: /\b(stupid|idiot|moron|dumb|loser)\b/gi, confidence: 60, severity: "medium" as const },
    { pattern: /\b(kill yourself|kys|die|harm yourself)\b/gi, confidence: 95, severity: "critical" as const },
    { pattern: /\b(shut up|stfu|get lost)\b/gi, confidence: 50, severity: "low" as const },
  ];
  
  for (const { pattern, confidence, severity } of harassmentPatterns) {
    const matches = content.match(pattern);
    if (matches) {
      violations.push({
        type: "harassment",
        confidence,
        severity,
        matchedPatterns: matches.slice(0, 3),
      });
      break;
    }
  }
  
  // Hate speech detection
  const hateSpeechPatterns = [
    { pattern: /\b(racist|sexist|homophobic|transphobic)\b/gi, confidence: 70, severity: "high" as const },
    // Note: In production, use more sophisticated ML models
  ];
  
  for (const { pattern, confidence, severity } of hateSpeechPatterns) {
    const matches = content.match(pattern);
    if (matches) {
      violations.push({
        type: "hate_speech",
        confidence,
        severity,
        matchedPatterns: matches.slice(0, 3),
      });
      break;
    }
  }
  
  // Self-harm detection
  const selfHarmPatterns = [
    { pattern: /\b(suicide|suicidal|end my life|want to die)\b/gi, confidence: 85, severity: "critical" as const },
    { pattern: /\b(self harm|cutting|hurting myself)\b/gi, confidence: 80, severity: "critical" as const },
  ];
  
  for (const { pattern, confidence, severity } of selfHarmPatterns) {
    const matches = content.match(pattern);
    if (matches) {
      violations.push({
        type: "self_harm",
        confidence,
        severity,
        matchedPatterns: matches.slice(0, 3),
        context: "Crisis resources available",
      });
      break;
    }
  }
  
  // Excessive caps (spam indicator)
  const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length;
  if (capsRatio > 0.5 && content.length > 20) {
    violations.push({
      type: "spam",
      confidence: 60,
      severity: "low",
      matchedPatterns: ["EXCESSIVE CAPS"],
    });
  }
  
  return violations;
}

/**
 * Analyze sentiment of content
 */
async function analyzeSentiment(content: string): Promise<SentimentAnalysis> {
  // Simplified sentiment analysis
  // In production, use ML models like VADER, TextBlob, or transformer models
  
  const lowerContent = content.toLowerCase();
  
  // Positive words
  const positiveWords = [
    "great", "awesome", "excellent", "amazing", "wonderful", "fantastic",
    "love", "happy", "joy", "excited", "grateful", "thankful", "helpful",
  ];
  
  // Negative words
  const negativeWords = [
    "bad", "terrible", "awful", "horrible", "hate", "angry", "sad",
    "disappointed", "frustrated", "annoyed", "upset", "worried", "anxious",
  ];
  
  let positiveCount = 0;
  let negativeCount = 0;
  
  for (const word of positiveWords) {
    if (lowerContent.includes(word)) positiveCount++;
  }
  
  for (const word of negativeWords) {
    if (lowerContent.includes(word)) negativeCount++;
  }
  
  // Calculate score (-1 to 1)
  const totalWords = content.split(/\s+/).length;
  const score = (positiveCount - negativeCount) / Math.max(totalWords, 10);
  const clampedScore = Math.max(-1, Math.min(1, score));
  
  // Determine label
  let label: SentimentAnalysis["label"];
  if (clampedScore < -0.5) label = "very_negative";
  else if (clampedScore < -0.1) label = "negative";
  else if (clampedScore > 0.5) label = "very_positive";
  else if (clampedScore > 0.1) label = "positive";
  else label = "neutral";
  
  // Simplified emotion detection
  const emotions = {
    anger: lowerContent.match(/\b(angry|furious|rage|mad)\b/gi)?.length || 0,
    fear: lowerContent.match(/\b(scared|afraid|fear|worried|anxious)\b/gi)?.length || 0,
    joy: lowerContent.match(/\b(happy|joy|excited|thrilled|delighted)\b/gi)?.length || 0,
    sadness: lowerContent.match(/\b(sad|depressed|unhappy|miserable)\b/gi)?.length || 0,
    surprise: lowerContent.match(/\b(surprised|shocked|amazed|astonished)\b/gi)?.length || 0,
  };
  
  // Normalize emotions to 0-1
  const maxEmotion = Math.max(...Object.values(emotions), 1);
  const normalizedEmotions = {
    anger: emotions.anger / maxEmotion,
    fear: emotions.fear / maxEmotion,
    joy: emotions.joy / maxEmotion,
    sadness: emotions.sadness / maxEmotion,
    surprise: emotions.surprise / maxEmotion,
  };
  
  return {
    score: clampedScore,
    label,
    emotions: normalizedEmotions,
  };
}

/**
 * Generate moderation message
 */
function generateModerationMessage(violations: ViolationDetection[]): string {
  const primaryViolation = violations[0];
  
  const messages: Record<ViolationType, string> = {
    spam: "This content appears to be spam. Please avoid promotional content and excessive links.",
    harassment: "This content may be harassing or disrespectful. Please be kind and respectful to others.",
    hate_speech: "This content contains hate speech. Our community does not tolerate discrimination or hateful language.",
    explicit_content: "This content may contain explicit material. Please keep content appropriate for all audiences.",
    misinformation: "This content may contain misinformation. Please verify facts before sharing.",
    self_harm: "We're concerned about your wellbeing. Please reach out to crisis resources: National Suicide Prevention Lifeline 988.",
    violence: "This content promotes violence. Please keep discussions peaceful and constructive.",
    off_topic: "This content appears off-topic. Please stay relevant to the discussion.",
  };
  
  return messages[primaryViolation.type] || "This content has been flagged for review.";
}

/**
 * Flag content for review
 */
async function flagContent(
  contentId: string,
  contentType: ContentType,
  content: string,
  authorId: string,
  violations: ViolationDetection[]
): Promise<void> {
  try {
    const data = await AsyncStorage.getItem(FLAGGED_CONTENT_KEY);
    const flaggedItems: FlaggedContent[] = data ? JSON.parse(data) : [];
    
    const flagged: FlaggedContent = {
      id: `flag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      contentId,
      contentType,
      content,
      authorId,
      violations,
      status: "pending",
      flaggedDate: new Date().toISOString(),
    };
    
    flaggedItems.push(flagged);
    await AsyncStorage.setItem(FLAGGED_CONTENT_KEY, JSON.stringify(flaggedItems));
  } catch (error) {
    console.error("Failed to flag content:", error);
    throw error;
  }
}

/**
 * Log moderation action
 */
async function logModerationAction(result: ModerationResult): Promise<void> {
  try {
    const data = await AsyncStorage.getItem(MODERATION_LOGS_KEY);
    const logs: ModerationResult[] = data ? JSON.parse(data) : [];
    
    logs.push(result);
    
    // Keep only last 1000 logs
    if (logs.length > 1000) {
      logs.splice(0, logs.length - 1000);
    }
    
    await AsyncStorage.setItem(MODERATION_LOGS_KEY, JSON.stringify(logs));
  } catch (error) {
    console.error("Failed to log moderation action:", error);
  }
}

/**
 * Check for repeat offenders
 */
async function checkRepeatOffender(
  userId: string,
  violations: ViolationDetection[]
): Promise<void> {
  try {
    const data = await AsyncStorage.getItem(USER_WARNINGS_KEY);
    const warnings: UserWarning[] = data ? JSON.parse(data) : [];
    
    const userWarnings = warnings.filter((w) => w.userId === userId);
    
    // Issue warning if high severity violation
    const highSeverityViolations = violations.filter(
      (v) => v.severity === "high" || v.severity === "critical"
    );
    
    if (highSeverityViolations.length > 0) {
      const warning: UserWarning = {
        id: `warn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        violationType: highSeverityViolations[0].type,
        contentId: `content_${Date.now()}`,
        severity: highSeverityViolations[0].severity,
        message: generateModerationMessage(highSeverityViolations),
        issuedDate: new Date().toISOString(),
        acknowledged: false,
      };
      
      warnings.push(warning);
      await AsyncStorage.setItem(USER_WARNINGS_KEY, JSON.stringify(warnings));
    }
    
    // Check if user should be escalated
    if (userWarnings.length >= 3) {
      console.log(`User ${userId} has ${userWarnings.length} warnings - consider escalation`);
    }
  } catch (error) {
    console.error("Failed to check repeat offender:", error);
  }
}

/**
 * Get flagged content
 */
export async function getFlaggedContent(status?: FlaggedContent["status"]): Promise<FlaggedContent[]> {
  try {
    const data = await AsyncStorage.getItem(FLAGGED_CONTENT_KEY);
    let flagged: FlaggedContent[] = data ? JSON.parse(data) : [];
    
    if (status) {
      flagged = flagged.filter((f) => f.status === status);
    }
    
    // Sort by flagged date
    flagged.sort((a, b) => new Date(b.flaggedDate).getTime() - new Date(a.flaggedDate).getTime());
    
    return flagged;
  } catch (error) {
    console.error("Failed to get flagged content:", error);
    return [];
  }
}

/**
 * Get repeat offenders
 */
export async function getRepeatOffenders(): Promise<RepeatOffender[]> {
  try {
    const data = await AsyncStorage.getItem(USER_WARNINGS_KEY);
    const warnings: UserWarning[] = data ? JSON.parse(data) : [];
    
    // Group by user
    const userMap = new Map<string, UserWarning[]>();
    for (const warning of warnings) {
      const existing = userMap.get(warning.userId) || [];
      existing.push(warning);
      userMap.set(warning.userId, existing);
    }
    
    // Build repeat offender list
    const offenders: RepeatOffender[] = [];
    for (const [userId, userWarnings] of userMap.entries()) {
      if (userWarnings.length >= 2) {
        // Count violations by type
        const violationCounts = new Map<ViolationType, number>();
        for (const warning of userWarnings) {
          violationCounts.set(
            warning.violationType,
            (violationCounts.get(warning.violationType) || 0) + 1
          );
        }
        
        const violations = Array.from(violationCounts.entries()).map(([type, count]) => ({
          type,
          count,
          lastOccurrence: userWarnings
            .filter((w) => w.violationType === type)
            .sort((a, b) => new Date(b.issuedDate).getTime() - new Date(a.issuedDate).getTime())[0]
            .issuedDate,
        }));
        
        // Calculate risk score
        const riskScore = Math.min(100, userWarnings.length * 15);
        
        // Recommend action
        let recommendedAction: ModerationAction = "warn_user";
        if (userWarnings.length >= 5) recommendedAction = "ban_user";
        else if (userWarnings.length >= 3) recommendedAction = "suspend_user";
        
        offenders.push({
          userId,
          warningCount: userWarnings.length,
          violations,
          riskScore,
          recommendedAction,
        });
      }
    }
    
    // Sort by risk score
    offenders.sort((a, b) => b.riskScore - a.riskScore);
    
    return offenders;
  } catch (error) {
    console.error("Failed to get repeat offenders:", error);
    return [];
  }
}

/**
 * Get community health metrics
 */
export async function getCommunityHealth(): Promise<CommunityHealth> {
  try {
    const data = await AsyncStorage.getItem(MODERATION_LOGS_KEY);
    const logs: ModerationResult[] = data ? JSON.parse(data) : [];
    
    // Get logs from last 24 hours
    const oneDayAgo = Date.now() - 86400000;
    const recentLogs = logs.filter(
      (log) => new Date(log.timestamp).getTime() > oneDayAgo
    );
    
    const totalPosts = recentLogs.length;
    const flaggedPosts = recentLogs.filter((log) => log.action === "flag" || log.action === "remove").length;
    const removedPosts = recentLogs.filter((log) => log.action === "remove").length;
    
    // Calculate toxicity score (0-100, lower is better)
    const toxicityScore = totalPosts > 0 ? Math.round((flaggedPosts / totalPosts) * 100) : 0;
    
    // Calculate average sentiment
    const avgSentiment = totalPosts > 0
      ? recentLogs.reduce((sum, log) => sum + log.sentiment.score, 0) / totalPosts
      : 0;
    
    // Count active moderation actions
    const activeModeration = recentLogs.filter((log) => log.action !== "approve").length;
    
    // Estimate false positive rate (simplified)
    const falsePositiveRate = 0.05; // 5% estimated
    
    return {
      date: new Date().toISOString(),
      totalPosts,
      flaggedPosts,
      removedPosts,
      toxicityScore,
      sentimentScore: avgSentiment,
      activeModeration,
      userReports: 0, // Would come from user reports
      falsePositiveRate,
    };
  } catch (error) {
    console.error("Failed to get community health:", error);
    return {
      date: new Date().toISOString(),
      totalPosts: 0,
      flaggedPosts: 0,
      removedPosts: 0,
      toxicityScore: 0,
      sentimentScore: 0,
      activeModeration: 0,
      userReports: 0,
      falsePositiveRate: 0,
    };
  }
}

/**
 * Generate AI response to common question
 */
export async function generateAIResponse(question: string): Promise<AIResponse> {
  // Simplified AI response generation
  // In production, use GPT-4, Claude, or similar LLM
  
  const lowerQuestion = question.toLowerCase();
  
  // Common energy-related questions
  if (lowerQuestion.includes("energy") && lowerQuestion.includes("boost")) {
    return {
      question,
      suggestedAnswer: "To boost your energy levels, try these evidence-based strategies: 1) Get 7-8 hours of quality sleep, 2) Exercise regularly (even 20 minutes helps), 3) Stay hydrated, 4) Eat balanced meals with protein and complex carbs, 5) Take short breaks throughout the day. Track your energy patterns in the app to find what works best for you!",
      confidence: 85,
      sources: ["Sleep Foundation", "Mayo Clinic", "Harvard Health"],
      relatedTopics: ["Sleep Optimization", "Exercise Timing", "Nutrition"],
    };
  }
  
  if (lowerQuestion.includes("sleep") && (lowerQuestion.includes("better") || lowerQuestion.includes("improve"))) {
    return {
      question,
      suggestedAnswer: "To improve sleep quality: 1) Maintain a consistent sleep schedule, 2) Create a dark, cool bedroom (65-68°F), 3) Avoid screens 1 hour before bed, 4) Limit caffeine after 2 PM, 5) Try relaxation techniques like meditation. The app's sleep tracker can help identify patterns affecting your sleep.",
      confidence: 90,
      sources: ["National Sleep Foundation", "CDC Sleep Guidelines"],
      relatedTopics: ["Sleep Hygiene", "Circadian Rhythm", "Meditation"],
    };
  }
  
  // Default response
  return {
    question,
    suggestedAnswer: "That's a great question! While I don't have a specific answer, I recommend checking our Learning Center or asking in the community forums where experts and experienced users can help.",
    confidence: 50,
    sources: [],
    relatedTopics: ["Community Forums", "Learning Center"],
  };
}

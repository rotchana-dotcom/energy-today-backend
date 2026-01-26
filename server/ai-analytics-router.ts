/**
 * AI Analytics Router
 * 
 * Combines user data (sleep, meditation, diet, tasks) with 7 esoteric systems
 * and uses AI to generate personalized "best time" recommendations and pattern discovery.
 * 
 * PRO FEATURE: This endpoint is only available to Pro users.
 */

import { publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { z } from "zod";
import { getCurrentLunarContext } from "../lib/lunar-context";

/**
 * System prompt for AI analytics advisor
 */
const ANALYTICS_ADVISOR_PROMPT = `You are an elite performance coach and data scientist specializing in personal optimization. You combine deep pattern analysis with educational wisdom to help people understand themselves and perform better.

Your role:
- Analyze complex patterns across multiple data sources (sleep, meditation, diet, tasks, energy logs)
- Combine with personal constitution patterns (work style, energy cycles, thinking patterns) translated into business terms
- Generate specific, actionable "best time" recommendations
- EDUCATE users on WHY they feel/perform certain ways
- Provide practical knowledge they can apply immediately
- Calculate accuracy scores based on pattern consistency

Your style:
- Speak in data-driven, practical language (never spiritual/mystical terms)
- Be specific with times and recommendations ("2:30-4:00 PM" not "afternoon")
- EXPLAIN the WHY using their personal patterns (constitution type, thinking style, energy cycles)
- Provide confidence scores (0-100%) for all major insights
- Give practical HOW-TO guidance for each recommendation
- Sound like a wise coach who teaches, not just tells

App-Specific Response Guidelines:

DIET/NUTRITION:
- Explain WHY certain foods affect them (constitution type + energy patterns)
- Example: "You felt drained after pasta because your constitution processes carbs slowly in afternoon. Your energy dips 30% after heavy carbs between 1-3 PM. Try protein + vegetables for lunch instead."
- Give specific food swaps and timing recommendations
- Explain the mechanism, not just the rule

FITNESS/WORKOUT:
- Explain best workout times based on their constitution and energy patterns
- Example: "Your constitution peaks physically 6-10 AM (methodical, strong). Afternoon workouts (2-6 PM) work for cardio (fast mind) but not strength (scattered focus). Schedule lifting 7-9 AM, running 3-5 PM."
- Recommend workout types matched to their energy pattern
- Explain recovery needs based on their constitution

SLEEP:
- Explain sleep needs based on constitution + age + activity level
- Example: "You need 7.5 hours minimum (your constitution + age 35 + high activity). You averaged 6.2 hours = 9 hours sleep debt this week. That's why you're irritable and craving sugar. Fix: Bed by 10:30 PM for 7 days straight."
- Give specific bedtime/wake time recommendations
- Explain sleep quality factors (caffeine timing, screen time, meal timing)

MEDITATION:
- Explain best meditation times and types based on mind patterns
- Example: "Your mind type is analytical/structured (Life Path 8 pattern). You need grounding meditation, not creative visualization. Best time: 6-7 AM before mind gets busy, or 8-9 PM to wind down. Try body scan or breath counting."
- Recommend specific techniques matched to their thinking style
- Explain why certain techniques work better for them

TASKS/PRODUCTIVITY:
- Explain peak performance windows based on thinking patterns + energy cycles
- Example: "You're a black-and-white thinker (Life Path 1). You excel at decisive action, struggle with 'maybe' decisions. Your peak clarity: 9-11 AM. Schedule YES/NO decisions then. Avoid ambiguous planning 2-4 PM when your energy dips."
- Give specific task-time matching (analytical work, creative work, meetings, decisions)
- Explain why they procrastinate on certain tasks (energy mismatch)

JOURNAL/MOOD:
- Explain emotional patterns based on cycles and timing
- Example: "You feel restless today because you're in a 5-cycle (change energy) + current lunar phase amplifies emotions. This is temporary (3-5 days). Channel restlessness into brainstorming new ideas, not making major decisions."
- Normalize their feelings by explaining the pattern
- Give coping strategies matched to the current cycle

CHI/ENERGY:
- Explain energy fluctuations using all pattern indicators
- Example: "Your energy is 6/10 today. Why? 1) Sleep debt (6.2 hrs avg), 2) You're in a low-energy cycle phase (day 23 of 28), 3) You skipped meditation 3 days (usually boosts you 15%). Fix: 10-min meditation now + 8 hours sleep tonight = back to 8/10 tomorrow."
- Give specific, immediate actions to boost energy
- Explain which factors are temporary vs. chronic

Tone Adaptation:
- DIRECT style (action-oriented): Use short sentences. Lead with the answer. Be commanding. Example: "Bottom line: You're wasting peak hours on email. Stop. Block 9-11 AM for hard work. Move email to 3 PM. This boosts output 30%."
- SUPPORTIVE style (exploratory): Use softer language. Explain context first. Be encouraging. Example: "I noticed you might be spending your most energized hours on tasks that don't require full attention. Consider protecting 9-11 AM for important work - you'll feel more accomplished. Perhaps try moving routine tasks to later?"
- Default to DIRECT if no preference specified

Rules:
- NEVER mention: astrology, numerology, I-Ching, chakras, doshas, hexagrams, lunar phases, elements
- ALWAYS use: constitution type, work style, thinking pattern, energy cycle, performance window, mind type
- EXPLAIN the mechanism: "You feel X because [pattern] → do Y to fix it"
- TEACH them to understand their own patterns
- Give SPECIFIC, ACTIONABLE steps (not vague advice)
- If data is insufficient (<10 data points), recommend collecting more data but still provide general guidance based on their constitution
- Highlight correlations with percentages (e.g., "meditation at 6 AM correlates with 23% higher afternoon energy")
- ADAPT tone based on user's communication style preference (direct or supportive)`;

/**
 * AI Analytics Router
 */
export const aiAnalyticsRouter = router({
  /**
   * Generate personalized analytics and best time recommendations
   */
  generatePersonalizedAnalytics: publicProcedure
    .input(
      z.object({
        // User's historical data
        userData: z.object({
          // User Profile
          birthday: z.string().optional(),
          birthTime: z.string().optional(),
          birthLocation: z.string().optional(),
          energyLogs: z.array(z.object({
            date: z.string(),
            time: z.string().optional(),
            score: z.number(), // 0-100
            notes: z.string().optional()
          })),
          meditationSessions: z.array(z.object({
            date: z.string(),
            time: z.string().optional(),
            duration: z.number(), // minutes
            type: z.string(),
            energyBefore: z.number().optional(),
            energyAfter: z.number().optional()
          })),
          dietLogs: z.array(z.object({
            date: z.string(),
            time: z.string().optional(),
            meal: z.string(),
            energyImpact: z.string().optional(), // "energizing" | "neutral" | "draining"
          })),
          sleepData: z.array(z.object({
            date: z.string(),
            bedtime: z.string().optional(),
            wakeTime: z.string().optional(),
            duration: z.number().optional(), // hours
            quality: z.number().optional(), // 0-100
          })),
          chiLogs: z.array(z.object({
            date: z.string(),
            time: z.string().optional(),
            energyLevel: z.number(), // 1-10
            balanceLevel: z.number(), // 1-10
            notes: z.string().optional()
          })),
          workoutLogs: z.array(z.object({
            date: z.string(),
            time: z.string().optional(),
            type: z.string(),
            duration: z.number(), // minutes
            intensity: z.string() // "low" | "moderate" | "high"
          })),
          journalEntries: z.array(z.object({
            date: z.string(),
            time: z.string().optional(),
            mood: z.string().optional(),
            content: z.string().optional()
          })),
          taskCompletions: z.array(z.object({
            date: z.string(),
            time: z.string().optional(),
            title: z.string(),
            category: z.string(),
            completed: z.boolean(),
            energyRequired: z.string().optional() // "low" | "moderate" | "high"
          }))
        }),
        
        // Esoteric analysis (translated to business terms)
        esotericAnalysis: z.object({
          personalCycle: z.object({
            number: z.number(),
            phase: z.string(),
            energy: z.string()
          }),
          dailyPattern: z.object({
            timing: z.enum(["act", "wait", "prepare", "reflect"]),
            energy: z.enum(["high", "moderate", "low"]),
            guidance: z.string()
          }),
          workStyle: z.object({
            type: z.string(),
            peakHours: z.string(),
            energyPattern: z.string()
          }),
          universalInfluence: z.object({
            score: z.number(), // 0-100
            description: z.string()
          })
        }),
        
        // Optional: specific question or focus area
        focusArea: z.enum(["meetings", "creative_work", "decisions", "learning", "networking", "all"]).optional(),
        
        // Optional: communication style preference
        communicationStyle: z.enum(["direct", "supportive"]).optional()
      })
    )
    .mutation(async ({ input }) => {
      const { userData, esotericAnalysis, focusArea = "all", communicationStyle = "direct" } = input;
      
      // Calculate data statistics
      const totalDataPoints = 
        userData.energyLogs.length +
        userData.meditationSessions.length +
        userData.dietLogs.length +
        userData.sleepData.length +
        userData.taskCompletions.length;
      
      // Build comprehensive data summary
      const dataSummary = `
DATA AVAILABLE:
- Energy logs: ${userData.energyLogs.length} entries
- Meditation sessions: ${userData.meditationSessions.length} entries
- Diet logs: ${userData.dietLogs.length} entries
- Sleep data: ${userData.sleepData.length} entries
- Task completions: ${userData.taskCompletions.length} entries
- Total data points: ${totalDataPoints}

ENERGY PATTERNS:
${userData.energyLogs.length > 0 ? `
- Average energy score: ${Math.round(userData.energyLogs.reduce((sum, log) => sum + log.score, 0) / userData.energyLogs.length)}
- Highest energy: ${Math.max(...userData.energyLogs.map(l => l.score))}
- Lowest energy: ${Math.min(...userData.energyLogs.map(l => l.score))}
- Recent trend: ${userData.energyLogs.slice(-7).map(l => l.score).join(", ")}
` : "- No energy data yet"}

MEDITATION PATTERNS:
${userData.meditationSessions.length > 0 ? `
- Total sessions: ${userData.meditationSessions.length}
- Average duration: ${Math.round(userData.meditationSessions.reduce((sum, s) => sum + s.duration, 0) / userData.meditationSessions.length)} minutes
- Energy impact: ${userData.meditationSessions.filter(s => s.energyAfter && s.energyBefore && s.energyAfter > s.energyBefore).length} sessions increased energy
- Most common type: ${userData.meditationSessions[0]?.type || "N/A"}
` : "- No meditation data yet"}

SLEEP PATTERNS:
${userData.sleepData.length > 0 ? `
- Average duration: ${Math.round((userData.sleepData.reduce((sum, s) => sum + (s.duration || 0), 0) / userData.sleepData.filter(s => s.duration).length) * 10) / 10} hours
- Average quality: ${Math.round(userData.sleepData.reduce((sum, s) => sum + (s.quality || 0), 0) / userData.sleepData.filter(s => s.quality).length)}/100
` : "- No sleep data yet"}

TASK COMPLETION PATTERNS:
${userData.taskCompletions.length > 0 ? `
- Total tasks: ${userData.taskCompletions.length}
- Completion rate: ${Math.round((userData.taskCompletions.filter(t => t.completed).length / userData.taskCompletions.length) * 100)}%
- High energy tasks completed: ${userData.taskCompletions.filter(t => t.completed && t.energyRequired === "high").length}
` : "- No task data yet"}

PERSONAL TIMING INDICATORS:
- Personal cycle: Phase ${esotericAnalysis.personalCycle.number} (${esotericAnalysis.personalCycle.phase})
- Cycle energy: ${esotericAnalysis.personalCycle.energy}
- Daily pattern: ${esotericAnalysis.dailyPattern.timing} mode, ${esotericAnalysis.dailyPattern.energy} energy
- Pattern guidance: ${esotericAnalysis.dailyPattern.guidance}
- Work style: ${esotericAnalysis.workStyle.type}
- Peak hours: ${esotericAnalysis.workStyle.peakHours}
- Energy pattern: ${esotericAnalysis.workStyle.energyPattern}
- Universal influence: ${esotericAnalysis.universalInfluence.score}/100 - ${esotericAnalysis.universalInfluence.description}

CURRENT ENVIRONMENTAL FACTORS:
${(() => {
  const lunar = getCurrentLunarContext();
  return `- Lunar cycle: ${lunar.phaseName} ${lunar.emoji}
- Lunar effects: ${lunar.effects.join("; ")}
- Note: Mention lunar effects naturally in recommendations (e.g., "Current lunar phase may affect sleep quality")`;
})()}

FOCUS AREA: ${focusArea === "all" ? "General optimization" : focusArea.replace("_", " ")}

COMMUNICATION STYLE: ${communicationStyle.toUpperCase()} - ${communicationStyle === "direct" ? "Be commanding, concise, action-oriented" : "Be encouraging, explanatory, supportive"}
`;

      const userPrompt = `Based on this comprehensive data analysis, provide:

1. BEST TIME RECOMMENDATIONS:
   - For ${focusArea === "all" ? "meetings, creative work, decisions, and learning" : focusArea.replace("_", " ")}
   - Give specific time windows (e.g., "9:30-11:00 AM, 2:30-4:00 PM")
   - Explain WHY based on data patterns (e.g., "Energy peaks at 10 AM based on 15-day average")
   - Provide confidence score (0-100%) for each recommendation

2. PATTERNS DISCOVERED:
   - List 3-5 significant correlations found in the data
   - Format: "X correlates with Y" with percentage impact
   - Example: "Meditation before 7 AM correlates with 23% higher afternoon energy"

3. ACCURACY ASSESSMENT:
   - Based on data consistency and sample size
   - Calculate overall accuracy score (0-100%)
   - Explain what would improve accuracy (e.g., "Need 10 more meditation sessions")

4. ACTIONABLE INSIGHTS:
   - 3 specific recommendations to optimize performance
   - Based on discovered patterns + timing indicators
   - Be specific and actionable

5. AVOID TIMES:
   - Time windows to avoid for important work
   - Based on low energy patterns or unfavorable indicators

Remember:
- Use data-driven language
- Be specific with times
- Provide confidence scores
- If data is insufficient (<10 points), recommend collecting more data
- Explain patterns in terms of performance and productivity
- Use ${communicationStyle.toUpperCase()} communication style as specified in the system prompt`;

      try {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: ANALYTICS_ADVISOR_PROMPT },
            { role: "user", content: dataSummary + "\n\n" + userPrompt }
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "personalized_analytics",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  bestTimes: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        activity: { type: "string" },
                        timeWindow: { type: "string" },
                        reason: { type: "string" },
                        confidence: { type: "number" }
                      },
                      required: ["activity", "timeWindow", "reason", "confidence"],
                      additionalProperties: false
                    }
                  },
                  patternsDiscovered: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        pattern: { type: "string" },
                        impact: { type: "string" },
                        dataPoints: { type: "number" }
                      },
                      required: ["pattern", "impact", "dataPoints"],
                      additionalProperties: false
                    }
                  },
                  accuracyAssessment: {
                    type: "object",
                    properties: {
                      overallScore: { type: "number" },
                      dataQuality: { type: "string" },
                      improvementTips: { type: "array", items: { type: "string" } }
                    },
                    required: ["overallScore", "dataQuality", "improvementTips"],
                    additionalProperties: false
                  },
                  actionableInsights: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        insight: { type: "string" },
                        action: { type: "string" },
                        expectedImpact: { type: "string" }
                      },
                      required: ["insight", "action", "expectedImpact"],
                      additionalProperties: false
                    }
                  },
                  avoidTimes: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        timeWindow: { type: "string" },
                        reason: { type: "string" }
                      },
                      required: ["timeWindow", "reason"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["bestTimes", "patternsDiscovered", "accuracyAssessment", "actionableInsights", "avoidTimes"],
                additionalProperties: false
              }
            }
          }
        });

        return {
          success: true,
          analytics: response,
          dataPointsAnalyzed: totalDataPoints
        };
      } catch (error) {
        console.error("AI Analytics generation failed:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to generate analytics",
          dataPointsAnalyzed: totalDataPoints
        };
      }
    })
});

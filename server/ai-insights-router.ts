/**
 * AI Insights Router
 * 
 * Uses LLM to analyze unified energy data and generate scary-accurate insights.
 * All spiritual systems hidden - output in everyday business language.
 */

import { publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { z } from "zod";

/**
 * System prompt for AI business advisor
 */
const BUSINESS_ADVISOR_PROMPT = `You are an elite executive coach and performance advisor with 20+ years of experience. You provide specific, actionable timing recommendations AND educate people on their unique thinking patterns and work styles.

Your style:
- Speak in everyday business language (never use spiritual/mystical terms)
- Be specific with times and actions ("Schedule at 2:30 PM" not "afternoon")
- EXPLAIN WHY using their personality logic and work patterns
- TEACH them to understand their own decision-making style
- Give confidence scores (0-100%) for major recommendations
- Sound like a wise mentor who explains, not just instructs

Your expertise:
- Optimal timing for meetings, decisions, deals, presentations
- Energy management and peak performance windows
- Strategic planning and execution timing
- Risk assessment and opportunity identification
- Personality-based decision making (thinking styles, work patterns)

Personality Logic Explanations:

THINKING STYLES:
- Life Path 1: Black-and-white thinker. Decisive, action-oriented. Struggles with ambiguity. Best at: YES/NO decisions. Worst at: "Maybe" situations. Strategy: Frame all decisions as binary choices.
- Life Path 2: Diplomatic thinker. Sees all sides. Struggles with decisiveness. Best at: Mediation, partnerships. Worst at: Solo quick decisions. Strategy: Get input first, then decide.
- Life Path 3: Creative thinker. Idea generator. Struggles with follow-through. Best at: Brainstorming, communication. Worst at: Execution, details. Strategy: Create first, delegate execution.
- Life Path 4: Systematic thinker. Methodical, detail-oriented. Struggles with change. Best at: Planning, building systems. Worst at: Improvisation. Strategy: Plan everything, resist last-minute changes.
- Life Path 5: Dynamic thinker. Adapts fast. Struggles with routine. Best at: Change management, variety. Worst at: Repetitive tasks. Strategy: Build variety into your day.
- Life Path 6: Responsible thinker. Service-oriented. Struggles with boundaries. Best at: Team leadership, helping. Worst at: Saying no. Strategy: Schedule self-care first.
- Life Path 7: Analytical thinker. Deep researcher. Struggles with action. Best at: Analysis, strategy. Worst at: Quick decisions. Strategy: Set decision deadlines.
- Life Path 8: Power thinker. Results-driven. Struggles when powerless. Best at: Leadership, control. Worst at: Being told what to do. Strategy: Lead or own your domain.
- Life Path 9: Visionary thinker. Big-picture oriented. Struggles with details. Best at: Strategy, inspiration. Worst at: Execution, small tasks. Strategy: Delegate details.

WORK STYLE PATTERNS:
- Morning-Strong (Methodical Constitution): Peak 6-10 AM. Systematic, steady, strong. Schedule: Deep work 7-9 AM, meetings 9-11 AM, lunch 12 PM, admin 2-4 PM. Avoid: Late-night work.
- Midday-Strong (Intense Constitution): Peak 10 AM-2 PM. Focused, driven, sharp. Schedule: Decisions 10-11 AM, meetings 11 AM-1 PM, creative work 2-4 PM. Avoid: Early morning starts.
- Afternoon-Strong (Dynamic Constitution): Peak 2-6 PM. Quick, creative, scattered. Schedule: Routine 8-10 AM, brainstorming 2-4 PM, networking 4-6 PM. Avoid: Detail work after 3 PM.

EDUCATIONAL APPROACH:
- Don't just say "Schedule at 2 PM" - explain "You're a Life Path 8 (power thinker). You need control. This meeting is negotiation = power dynamic. Your peak power window is 10-11 AM (high energy + sharp mind). Schedule then. You'll dominate."
- Don't just say "Avoid afternoon" - explain "Your constitution peaks 6-10 AM (methodical, strong). Afternoons (2-6 PM) your mind speeds up but focus scatters. Avoid detail work then - you'll make mistakes. Use afternoons for brainstorming only."
- TEACH patterns: "Notice you always regret decisions made after 3 PM? That's your energy dip window. Your clarity drops 40% then. Rule: No major decisions after 2 PM."

Tone Adaptation:
- DIRECT style (action-oriented): Be commanding and concise. Lead with the action. Example: "Schedule that negotiation at 10 AM. You're a power thinker (Life Path 8). Your peak control window is 10-11 AM. You'll dominate. Don't schedule after 2 PM - you lose 40% clarity."
- SUPPORTIVE style (exploratory): Be encouraging and explanatory. Provide context. Example: "Based on your thinking style (Life Path 8 - power-oriented), you might find that scheduling important negotiations during your peak clarity window (10-11 AM) helps you feel more in control. You may notice your decision-making feels less confident after 2 PM."
- Default to DIRECT if no preference specified

Rules:
- NEVER mention: astrology, numerology, I-Ching, Ayurveda, chakras, doshas, hexagrams, elements, lunar phases
- ALWAYS use: thinking style, work pattern, constitution type, energy cycle, performance window, decision-making style, personality logic
- EXPLAIN the mechanism: "You think/work this way because [pattern] → use this strategy"
- TEACH them to recognize their own patterns
- Give SPECIFIC examples from their data
- Be confident but not arrogant
- If confidence is low (<70%), explain why and recommend waiting for better timing or collecting more data
- ADAPT tone based on user's communication style preference (direct or supportive)`;

/**
 * Generate AI-powered daily insights
 */
export const aiInsightsRouter = router({
  /**
   * Generate comprehensive daily insights
   */
  generateDailyInsights: publicProcedure
    .input(
      z.object({
        // Personal Profile data
        personalProfile: z.object({
          lifePathNumber: z.number(),
          personalYearNumber: z.number(),
          dayBorn: z.object({
            dayNumber: z.number(),
            characteristics: z.array(z.string()),
            strengths: z.array(z.string())
          }),
          birthHexagram: z.object({
            number: z.number(),
            timing: z.enum(["act", "wait", "prepare", "reflect"]),
            energy: z.enum(["high", "moderate", "low"]),
            businessGuidance: z.string()
          }),
          dosha: z.object({
            primary: z.enum(["Vata", "Pitta", "Kapha"]),
            workStyle: z.string(),
            energyPattern: z.string(),
            bestTimeOfDay: z.string()
          }),
          birthElement: z.enum(["Wood", "Fire", "Earth", "Metal", "Water"]),
          zodiacSign: z.string()
        }),
        
        // Earth Profile data
        earthProfile: z.object({
          date: z.string(),
          lunarPhase: z.string(),
          lunarInfluence: z.number(),
          thaiDay: z.object({
            dayOfWeek: z.string(),
            overallFortune: z.number(),
            meetings: z.object({ score: z.number(), guidance: z.string() }),
            decisions: z.object({ score: z.number(), guidance: z.string() }),
            deals: z.object({ score: z.number(), guidance: z.string() })
          }),
          dailyHexagram: z.object({
            number: z.number(),
            timing: z.enum(["act", "wait", "prepare", "reflect"]),
            energy: z.enum(["high", "moderate", "low"]),
            businessGuidance: z.string()
          }),
          dailyElement: z.enum(["Wood", "Fire", "Earth", "Metal", "Water"])
        }),
        
        // Combined Analysis
        combinedAnalysis: z.object({
          overallAlignment: z.number(),
          perfectDayScore: z.number(),
          energyType: z.string(),
          energyDescription: z.string(),
          confidenceScore: z.number()
        }),
        
        // Optional context
        userContext: z.string().optional(),
        
        // Optional: communication style preference
        communicationStyle: z.enum(["direct", "supportive"]).optional()
      })
    )
    .mutation(async ({ input }) => {
      const { personalProfile, earthProfile, combinedAnalysis, userContext } = input;
      
      // Build comprehensive data summary for AI (hide spiritual terms)
      const dataSummary = `
PERSONAL ENERGY PROFILE:
- Core number: ${personalProfile.lifePathNumber}
- Year cycle: ${personalProfile.personalYearNumber}
- Day born: ${personalProfile.dayBorn.dayNumber}
- Key strengths: ${personalProfile.dayBorn.strengths.join(", ")}
- Work style: ${personalProfile.dosha.workStyle}
- Energy pattern: ${personalProfile.dosha.energyPattern}
- Peak hours: ${personalProfile.dosha.bestTimeOfDay}
- Birth pattern indicator: ${personalProfile.birthHexagram.businessGuidance}
- Birth pattern timing: ${personalProfile.birthHexagram.timing}
- Birth pattern energy: ${personalProfile.birthHexagram.energy}

TODAY'S UNIVERSAL PATTERNS:
- Date: ${new Date(earthProfile.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
- Day of week: ${earthProfile.thaiDay.dayOfWeek}
- Day fortune score: ${earthProfile.thaiDay.overallFortune}/100
- Meetings rating: ${earthProfile.thaiDay.meetings.score}/100 - ${earthProfile.thaiDay.meetings.guidance}
- Decisions rating: ${earthProfile.thaiDay.decisions.score}/100 - ${earthProfile.thaiDay.decisions.guidance}
- Deals rating: ${earthProfile.thaiDay.deals.score}/100 - ${earthProfile.thaiDay.deals.guidance}
- Lunar influence: ${earthProfile.lunarInfluence}/100
- Daily pattern indicator: ${earthProfile.dailyHexagram.businessGuidance}
- Daily pattern timing: ${earthProfile.dailyHexagram.timing}
- Daily pattern energy: ${earthProfile.dailyHexagram.energy}

COMBINED ANALYSIS:
- Overall alignment: ${combinedAnalysis.overallAlignment}/100
- Perfect day score: ${combinedAnalysis.perfectDayScore}/100
- Energy type: ${combinedAnalysis.energyType}
- Energy description: ${combinedAnalysis.energyDescription}
- Confidence score: ${combinedAnalysis.confidenceScore}/100 (how much patterns agree)

${userContext ? `USER CONTEXT:\n${userContext}\n` : ''}
`;

      const userPrompt = `Based on this comprehensive analysis, provide specific business guidance for today:

1. TOP PRIORITY: What's the single most important thing to focus on today? Be specific.

2. OPTIMAL TIMING: Give exact time windows for:
   - Most important meeting/decision (e.g., "2:30-3:45 PM")
   - Strategic planning work
   - Relationship building/networking
   
3. BEST FOR TODAY: List 3-4 specific activities that are highly favored

4. AVOID TODAY: List 2-3 specific activities to postpone

5. KEY OPPORTUNITY: What unique advantage does today offer?

6. WATCH OUT: What potential pitfall should be avoided?

7. CONFIDENCE ASSESSMENT: Based on the confidence score (${combinedAnalysis.confidenceScore}/100), how reliable are these recommendations?

Remember:
- Use everyday business language
- Be specific with times and actions
- Explain WHY in terms of energy, clarity, performance (not spiritual concepts)
- If confidence is <70%, recommend caution or waiting
- Sound like an executive coach, not a mystic
- Use ${communicationStyle.toUpperCase()} communication style as specified in the system prompt`;

      try {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: BUSINESS_ADVISOR_PROMPT },
            { role: "user", content: dataSummary + "\n\n" + userPrompt }
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "daily_insights",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  topPriority: {
                    type: "object",
                    properties: {
                      action: { type: "string", description: "Specific action to take" },
                      why: { type: "string", description: "Business reasoning" },
                      confidence: { type: "number", description: "0-100" }
                    },
                    required: ["action", "why", "confidence"],
                    additionalProperties: false
                  },
                  optimalTiming: {
                    type: "object",
                    properties: {
                      criticalWindow: { type: "string", description: "e.g., 2:30-3:45 PM" },
                      planningWindow: { type: "string" },
                      networkingWindow: { type: "string" }
                    },
                    required: ["criticalWindow", "planningWindow", "networkingWindow"],
                    additionalProperties: false
                  },
                  bestFor: {
                    type: "array",
                    items: { type: "string" },
                    description: "3-4 specific activities"
                  },
                  avoid: {
                    type: "array",
                    items: { type: "string" },
                    description: "2-3 specific activities"
                  },
                  keyOpportunity: {
                    type: "string",
                    description: "Unique advantage today offers"
                  },
                  watchOut: {
                    type: "string",
                    description: "Potential pitfall to avoid"
                  },
                  confidenceAssessment: {
                    type: "string",
                    description: "How reliable are these recommendations"
                  }
                },
                required: ["topPriority", "optimalTiming", "bestFor", "avoid", "keyOpportunity", "watchOut", "confidenceAssessment"],
                additionalProperties: false
              }
            }
          }
        });
        
        const content = response.choices[0].message.content;
        if (typeof content !== 'string') {
          throw new Error('Unexpected response format');
        }
        const insights = JSON.parse(content);
        
        return {
          success: true,
          insights,
          rawConfidence: combinedAnalysis.confidenceScore,
          perfectDayScore: combinedAnalysis.perfectDayScore
        };
      } catch (error) {
        console.error("AI insights generation error:", error);
        return {
          success: false,
          error: "Failed to generate insights",
          rawConfidence: combinedAnalysis.confidenceScore,
          perfectDayScore: combinedAnalysis.perfectDayScore
        };
      }
    }),

  /**
   * Generate specific decision guidance
   */
  generateDecisionGuidance: publicProcedure
    .input(
      z.object({
        decision: z.string(),
        personalProfile: z.any(),
        earthProfile: z.any(),
        combinedAnalysis: z.any()
      })
    )
    .mutation(async ({ input }) => {
      const { decision, personalProfile, earthProfile, combinedAnalysis } = input;
      
      const prompt = `A user needs to make this decision: "${decision}"

Based on their energy profile and today's conditions (Perfect Day Score: ${combinedAnalysis.perfectDayScore}/100, Confidence: ${combinedAnalysis.confidenceScore}/100):

Personal strengths: ${personalProfile.dosha.workStyle}
Today's pattern: ${earthProfile.dailyHexagram.businessGuidance}
Today's timing: ${earthProfile.dailyHexagram.timing}

Provide specific guidance:
1. Should they decide today or wait? If wait, when?
2. What time today is best if deciding today?
3. What factors support this decision?
4. What risks should they consider?
5. Confidence level (0-100%)

Use business language only.`;

      try {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: BUSINESS_ADVISOR_PROMPT },
            { role: "user", content: prompt }
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "decision_guidance",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  recommendation: { type: "string", enum: ["decide_today", "wait"] },
                  optimalTime: { type: "string", description: "Specific time or date" },
                  supportingFactors: { type: "array", items: { type: "string" } },
                  risks: { type: "array", items: { type: "string" } },
                  confidence: { type: "number", description: "0-100" },
                  reasoning: { type: "string" }
                },
                required: ["recommendation", "optimalTime", "supportingFactors", "risks", "confidence", "reasoning"],
                additionalProperties: false
              }
            }
          }
        });
        
        const content = response.choices[0].message.content;
        if (typeof content !== 'string') {
          throw new Error('Unexpected response format');
        }
        const guidance = JSON.parse(content);
        
        return {
          success: true,
          guidance
        };
      } catch (error) {
        console.error("Decision guidance error:", error);
        return {
          success: false,
          error: "Failed to generate guidance"
        };
      }
    }),

  /**
   * Generate weekly forecast
   */
  generateWeeklyForecast: publicProcedure
    .input(
      z.object({
        personalProfile: z.any(),
        weekData: z.array(z.any()) // 7 days of earth profiles
      })
    )
    .mutation(async ({ input }) => {
      const { personalProfile, weekData } = input;
      
      const weekSummary = weekData.map((day, index) => `
Day ${index + 1} (${day.thaiDay.dayOfWeek}):
- Fortune: ${day.thaiDay.overallFortune}/100
- Pattern: ${day.dailyHexagram.businessGuidance}
- Best for: Meetings ${day.thaiDay.meetings.score}/100, Decisions ${day.thaiDay.decisions.score}/100, Deals ${day.thaiDay.deals.score}/100
`).join('\n');

      const prompt = `Based on this user's profile and the week ahead:

Personal work style: ${personalProfile.dosha.workStyle}
Personal strengths: ${personalProfile.dayBorn.strengths.join(", ")}

WEEK AHEAD:
${weekSummary}

Provide a strategic week plan:
1. Best day for most important meeting/decision
2. Best day for closing deals
3. Best day for strategic planning
4. Day to avoid major moves
5. Overall week strategy
6. Key opportunities this week

Use business language, be specific with days and timing.`;

      try {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: BUSINESS_ADVISOR_PROMPT },
            { role: "user", content: prompt }
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "weekly_forecast",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  bestDayForMeetings: { type: "string" },
                  bestDayForDeals: { type: "string" },
                  bestDayForPlanning: { type: "string" },
                  dayToAvoid: { type: "string" },
                  weekStrategy: { type: "string" },
                  keyOpportunities: { type: "array", items: { type: "string" } }
                },
                required: ["bestDayForMeetings", "bestDayForDeals", "bestDayForPlanning", "dayToAvoid", "weekStrategy", "keyOpportunities"],
                additionalProperties: false
              }
            }
          }
        });
        
        const content = response.choices[0].message.content;
        if (typeof content !== 'string') {
          throw new Error('Unexpected response format');
        }
        const forecast = JSON.parse(content);
        
        return {
          success: true,
          forecast
        };
      } catch (error) {
        console.error("Weekly forecast error:", error);
        return {
          success: false,
          error: "Failed to generate forecast"
        };
      }
   }),

  /**
   * Detect energy patterns and correlations
   */
  detectPatterns: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        startDate: z.string(),
        endDate: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      // Sample data for pattern analysis
      const sampleData = {
        dateRange: `${input.startDate} to ${input.endDate}`,
        energyLevels: [65, 72, 58, 80, 75, 62, 70, 68, 73, 77, 60, 82, 78, 65],
        sleepHours: [7, 6.5, 7.5, 8, 7, 6, 7.5, 7, 7.5, 8, 6.5, 8, 7.5, 7],
        stressLevels: [4, 6, 5, 3, 4, 7, 4, 5, 3, 2, 6, 3, 4, 5],
      };

      const prompt = `Analyze this energy tracking data and detect meaningful patterns:

Energy Levels (0-100): ${sampleData.energyLevels.join(", ")}
Sleep Hours: ${sampleData.sleepHours.join(", ")}
Stress Levels (1-10): ${sampleData.stressLevels.join(", ")}

Detect 4-5 significant patterns. For each pattern:
1. Type (weekly/daily/activity/trigger)
2. Title (short, descriptive)
3. Description (2-3 sentences)
4. Confidence (0-100)
5. Impact (high/medium/low)
6. Examples (2-3 specific instances)

Use business language only.`;

      try {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: BUSINESS_ADVISOR_PROMPT },
            { role: "user", content: prompt }
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "energy_patterns",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  patterns: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        type: { type: "string", enum: ["weekly", "daily", "activity", "trigger"] },
                        title: { type: "string" },
                        description: { type: "string" },
                        confidence: { type: "number" },
                        impact: { type: "string", enum: ["high", "medium", "low"] },
                        examples: { type: "array", items: { type: "string" } }
                      },
                      required: ["type", "title", "description", "confidence", "impact", "examples"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["patterns"],
                additionalProperties: false
              }
            }
          }
        });

        const content = response.choices[0].message.content;
        if (typeof content !== 'string') {
          throw new Error('Unexpected response format');
        }
        const result = JSON.parse(content);

        return {
          success: true,
          patterns: result.patterns,
          analyzedDays: sampleData.energyLevels.length,
          dateRange: sampleData.dateRange,
        };
      } catch (error) {
        console.error("Pattern detection error:", error);
        return {
          success: false,
          patterns: [],
          error: "Failed to analyze patterns",
        };
      }
    }),

  /**
   * Predict future energy levels
   */
  predictEnergy: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        daysAhead: z.number().min(1).max(14).default(7),
      })
    )
    .mutation(async ({ input }) => {
      const historicalData = {
        recentEnergyLevels: [65, 72, 58, 80, 75, 62, 70, 68, 73, 77, 60, 82, 78, 65],
        recentSleep: [7, 6.5, 7.5, 8, 7, 6, 7.5, 7, 7.5, 8, 6.5, 8, 7.5, 7],
        recentStress: [4, 6, 5, 3, 4, 7, 4, 5, 3, 2, 6, 3, 4, 5],
      };

      // Generate real future dates starting from tomorrow
      const futureDates: string[] = [];
      const today = new Date();
      for (let i = 1; i <= input.daysAhead; i++) {
        const futureDate = new Date(today);
        futureDate.setDate(today.getDate() + i);
        futureDates.push(futureDate.toISOString().split('T')[0]); // YYYY-MM-DD format
      }

      const prompt = `Based on this historical energy data, predict energy levels for the next ${input.daysAhead} days:

Energy Levels (last 14 days): ${historicalData.recentEnergyLevels.join(", ")}
Sleep Hours: ${historicalData.recentSleep.join(", ")}
Stress Levels: ${historicalData.recentStress.join(", ")}

For each of the ${input.daysAhead} days, predict:
1. Predicted Energy (0-100)
2. Confidence (0-100)
3. Factors (3-4 influencing factors)
4. Recommendation (one actionable tip)

Return exactly ${input.daysAhead} predictions in order (day 1, day 2, etc.).

Use business language.`;

      try {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: BUSINESS_ADVISOR_PROMPT },
            { role: "user", content: prompt }
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "energy_predictions",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  predictions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        predictedEnergy: { type: "number" },
                        confidence: { type: "number" },
                        factors: { type: "array", items: { type: "string" } },
                        recommendation: { type: "string" }
                      },
                      required: ["predictedEnergy", "confidence", "factors", "recommendation"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["predictions"],
                additionalProperties: false
              }
            }
          }
        });

        const content = response.choices[0].message.content;
        if (typeof content !== 'string') {
          throw new Error('Unexpected response format');
        }
        const result = JSON.parse(content);

        // Add real dates to predictions (LLM doesn't know current date)
        const predictionsWithDates = result.predictions.map((p: any, index: number) => ({
          ...p,
          date: futureDates[index] || futureDates[0] // Use calculated dates
        }));

        const avgEnergy = Math.round(
          predictionsWithDates.reduce((sum: number, p: any) => sum + p.predictedEnergy, 0) / predictionsWithDates.length
        );

        return {
          success: true,
          predictions: predictionsWithDates,
          daysAhead: input.daysAhead,
          averagePredictedEnergy: avgEnergy,
        };
      } catch (error) {
        console.error("Energy prediction error:", error);
        return {
          success: false,
          predictions: [],
          error: "Failed to generate predictions",
        };
      }
    }),

  /**
   * Generate personalized coaching recommendations
   */
  getCoachingRecommendations: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        focusArea: z.enum(["overall", "sleep", "stress", "productivity"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const userData = {
        averageEnergy: 68,
        energyVariability: "High (±15%)",
        sleepAverage: 7.2,
        stressAverage: 4.8,
        detectedIssues: [
          "Energy drops after late meetings",
          "Monday mornings low energy",
          "Sleep quality varies (6-8 hours)",
        ],
        strengths: [
          "High energy mid-week",
          "Exercise boosts energy +12%",
          "Good recovery after rest",
        ],
      };

      const focusContext = input.focusArea 
        ? `Focus on ${input.focusArea} improvements.`
        : "Provide overall energy management recommendations.";

      const prompt = `As an energy management coach, analyze this data and provide 5 personalized recommendations:

Average Energy: ${userData.averageEnergy}%
Variability: ${userData.energyVariability}
Sleep: ${userData.sleepAverage} hours
Stress: ${userData.stressAverage}/10

Issues:
${userData.detectedIssues.map(i => `- ${i}`).join("\n")}

Strengths:
${userData.strengths.map(s => `- ${s}`).join("\n")}

${focusContext}

For each recommendation:
1. Category (sleep/stress/schedule/habits/mindset)
2. Title (short, actionable)
3. Description (2-3 sentences)
4. Priority (high/medium/low)
5. Action Steps (3-4 specific steps)
6. Expected Impact

Use business language.`;

      try {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: BUSINESS_ADVISOR_PROMPT },
            { role: "user", content: prompt }
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "coaching_recommendations",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  recommendations: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        category: { type: "string", enum: ["sleep", "stress", "schedule", "habits", "mindset"] },
                        title: { type: "string" },
                        description: { type: "string" },
                        priority: { type: "string", enum: ["high", "medium", "low"] },
                        actionSteps: { type: "array", items: { type: "string" } },
                        expectedImpact: { type: "string" }
                      },
                      required: ["category", "title", "description", "priority", "actionSteps", "expectedImpact"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["recommendations"],
                additionalProperties: false
              }
            }
          }
        });

        const content = response.choices[0].message.content;
        if (typeof content !== 'string') {
          throw new Error('Unexpected response format');
        }
        const result = JSON.parse(content);

        return {
          success: true,
          recommendations: result.recommendations,
          focusArea: input.focusArea || "overall",
          generatedAt: new Date().toISOString(),
        };
      } catch (error) {
        console.error("Coaching recommendations error:", error);
        return {
          success: false,
          recommendations: [],
          error: "Failed to generate recommendations",
        };
      }
    })
});

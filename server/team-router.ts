/**
 * Team Collaboration Router
 * 
 * Handles team management, energy comparison, and optimal meeting time finding
 */

import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { invokeLLM } from "./_core/llm";

export const teamRouter = router({
  /**
   * Find optimal meeting times for a team
   */
  findOptimalMeetingTimes: protectedProcedure
    .input(
      z.object({
        teamMembers: z.array(z.object({
          name: z.string(),
          energyData: z.array(z.object({
            date: z.string(),
            score: z.number(),
            peakHours: z.string(),
          })),
        })),
        meetingDuration: z.number(), // in minutes
        daysAhead: z.number(), // how many days to look ahead
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Prepare data for AI analysis
        const teamEnergyData = input.teamMembers.map(member => ({
          name: member.name,
          averageScore: member.energyData.reduce((sum, d) => sum + d.score, 0) / member.energyData.length,
          peakHours: member.energyData[0]?.peakHours || "9:00 AM - 11:00 AM",
        }));

        const prompt = `Analyze this team's energy data and find the optimal meeting times:

Team Members:
${teamEnergyData.map(m => `- ${m.name}: Average Energy ${m.averageScore}/100, Peak Hours ${m.peakHours}`).join('\n')}

Meeting Requirements:
- Duration: ${input.meetingDuration} minutes
- Planning horizon: Next ${input.daysAhead} days

Find the 3 best meeting times that:
1. Maximize collective team energy
2. Align with most members' peak hours
3. Consider time zone compatibility (if applicable)

Respond in this exact JSON format (no markdown, just JSON):
{
  "recommendations": [
    {
      "date": "2026-01-20",
      "time": "10:00 AM",
      "score": 92,
      "reason": "All team members at peak energy",
      "memberScores": {
        "Member 1": 95,
        "Member 2": 89
      }
    }
  ],
  "insights": [
    "Team energy peaks mid-morning",
    "Avoid meetings after 3 PM"
  ]
}`;

        const response = await invokeLLM({
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        });

        const content = typeof response.choices[0].message.content === 'string' 
          ? response.choices[0].message.content 
          : JSON.stringify(response.choices[0].message.content);
        
        const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const analysis = JSON.parse(cleanContent);

        return {
          success: true,
          recommendations: analysis.recommendations,
          insights: analysis.insights,
        };
      } catch (error) {
        console.error("Meeting time optimization error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to find optimal meeting times",
        });
      }
    }),

  /**
   * Compare team energy patterns
   */
  compareTeamEnergy: protectedProcedure
    .input(
      z.object({
        teamMembers: z.array(z.object({
          name: z.string(),
          energyData: z.array(z.object({
            date: z.string(),
            score: z.number(),
            type: z.string(),
          })),
        })),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Prepare data for AI analysis
        const teamComparison = input.teamMembers.map(member => {
          const avgScore = member.energyData.reduce((sum, d) => sum + d.score, 0) / member.energyData.length;
          const energyTypes = member.energyData.map(d => d.type);
          const mostCommonType = energyTypes.sort((a, b) =>
            energyTypes.filter(t => t === a).length - energyTypes.filter(t => t === b).length
          ).pop();

          return {
            name: member.name,
            averageScore: avgScore,
            mostCommonType,
            consistency: calculateConsistency(member.energyData.map(d => d.score)),
          };
        });

        const prompt = `Analyze this team's energy patterns and provide insights:

Team Energy Comparison:
${teamComparison.map(m => `- ${m.name}: Avg ${m.averageScore.toFixed(0)}/100, Type: ${m.mostCommonType}, Consistency: ${m.consistency}%`).join('\n')}

Provide insights on:
1. Team energy compatibility
2. Complementary energy patterns
3. Potential collaboration challenges
4. Recommendations for team dynamics

Respond in this exact JSON format (no markdown, just JSON):
{
  "compatibility": 85,
  "strengths": [
    "Complementary energy types",
    "High overall consistency"
  ],
  "challenges": [
    "Different peak hours",
    "Energy misalignment on Fridays"
  ],
  "recommendations": [
    "Schedule important meetings mid-week",
    "Pair high-energy members with lower-energy members"
  ],
  "memberInsights": {
    "Member 1": "Natural leader with consistent high energy",
    "Member 2": "Creative contributor, best in afternoons"
  }
}`;

        const response = await invokeLLM({
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        });

        const content = typeof response.choices[0].message.content === 'string' 
          ? response.choices[0].message.content 
          : JSON.stringify(response.choices[0].message.content);
        
        const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const analysis = JSON.parse(cleanContent);

        return {
          success: true,
          ...analysis,
        };
      } catch (error) {
        console.error("Team energy comparison error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to compare team energy",
        });
      }
    }),
});

/**
 * Calculate consistency score (0-100) based on energy score variance
 */
function calculateConsistency(scores: number[]): number {
  if (scores.length === 0) return 0;
  
  const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
  const variance = scores.reduce((sum, s) => sum + Math.pow(s - avg, 2), 0) / scores.length;
  const stdDev = Math.sqrt(variance);
  
  // Lower standard deviation = higher consistency
  // Normalize to 0-100 scale (assuming max std dev of 30)
  const consistency = Math.max(0, 100 - (stdDev / 30) * 100);
  return Math.round(consistency);
}

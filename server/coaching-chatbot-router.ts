import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";

type LLMContentItem = { type: "text"; text: string } | { type: "image_url"; image_url: { url: string } };

const chatMessageSchema = z.object({
  message: z.string(),
  context: z.object({
    recentEnergy: z.array(z.object({
      date: z.string(),
      score: z.number(),
    })).optional(),
    recentWorkouts: z.array(z.object({
      type: z.string(),
      duration: z.number(),
      intensity: z.string(),
      timestamp: z.string(),
    })).optional(),
    recentMeals: z.array(z.object({
      foods: z.array(z.string()),
      timestamp: z.string(),
    })).optional(),
    sleepData: z.array(z.object({
      date: z.string(),
      duration: z.number(),
      quality: z.number(),
    })).optional(),
  }),
});

export const coachingChatbotRouter = router({
  chat: protectedProcedure
    .input(chatMessageSchema)
    .mutation(async ({ input, ctx }) => {
      const { message, context } = input;

      // Build context summary for AI
      const contextSummary = [];
      
      if (context.recentEnergy && context.recentEnergy.length > 0) {
        const avgEnergy = context.recentEnergy.reduce((sum, e) => sum + e.score, 0) / context.recentEnergy.length;
        contextSummary.push(`Recent average energy: ${avgEnergy.toFixed(1)}/100`);
      }

      if (context.recentWorkouts && context.recentWorkouts.length > 0) {
        const totalWorkouts = context.recentWorkouts.length;
        const totalMinutes = context.recentWorkouts.reduce((sum, w) => sum + w.duration, 0);
        contextSummary.push(`${totalWorkouts} workouts logged (${totalMinutes} total minutes)`);
      }

      if (context.recentMeals && context.recentMeals.length > 0) {
        contextSummary.push(`${context.recentMeals.length} meals logged recently`);
      }

      if (context.sleepData && context.sleepData.length > 0) {
        const avgSleep = context.sleepData.reduce((sum, s) => sum + s.duration, 0) / context.sleepData.length;
        const avgQuality = context.sleepData.reduce((sum, s) => sum + s.quality, 0) / context.sleepData.length;
        contextSummary.push(`Average sleep: ${avgSleep.toFixed(1)} hours (quality: ${avgQuality.toFixed(1)}/100)`);
      }

      const systemPrompt = `You are an expert energy optimization coach helping users improve their daily energy levels and productivity.

User's Context:
${contextSummary.join("\n")}

Guidelines:
- Be supportive, encouraging, and actionable
- Reference the user's specific data when relevant
- Provide concrete, science-based recommendations
- Keep responses concise (2-3 paragraphs max)
- Focus on practical tips they can implement today
- If asked about patterns, analyze their data and explain trends
- If data is limited, acknowledge it and provide general guidance

User's Question: ${message}`;

      const response = await invokeLLM({
        messages: [{ role: "user", content: systemPrompt }],
      });

      const responseMessage = response.choices[0]?.message;
      let responseText = "";
      
      if (responseMessage) {
        if (typeof responseMessage.content === "string") {
          responseText = responseMessage.content;
        } else if (Array.isArray(responseMessage.content)) {
          responseText = responseMessage.content
            .filter((item: any) => item.type === "text")
            .map((item: any) => item.text)
            .join("\n");
        }
      }

      return {
        response: responseText,
        timestamp: new Date().toISOString(),
      };
    }),

  getQuickActions: protectedProcedure
    .query(async ({ ctx }) => {
      return {
        actions: [
          "How can I improve my energy levels?",
          "Why am I tired in the afternoons?",
          "What's the best time to exercise?",
          "How does sleep affect my energy?",
          "Tips for better focus during work",
          "Should I change my meal timing?",
        ],
      };
    }),
});

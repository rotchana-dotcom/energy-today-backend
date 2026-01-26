import { z } from "zod";
import { router, publicProcedure } from "./_core/trpc";

const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  estimatedDuration: z.number(), // in minutes
  priority: z.enum(["low", "medium", "high"]),
  energyRequirement: z.enum(["low", "moderate", "high"]),
  deadline: z.string().optional(), // ISO date string
  completed: z.boolean().default(false),
  scheduledTime: z.string().optional(), // ISO date string
});

export const taskSchedulerRouter = router({
  /**
   * Get optimal time slots for a task based on user's energy patterns
   */
  getOptimalTimeSlots: publicProcedure
    .input(
      z.object({
        taskDuration: z.number(),
        energyRequirement: z.enum(["low", "moderate", "high"]),
        priority: z.enum(["low", "medium", "high"]),
      })
    )
    .mutation(async ({ input, ctx }: { input: any; ctx: any }) => {
      const { taskDuration, energyRequirement, priority } = input;

      // Default energy history (can be enhanced with real user data later)
      const energyHistory = [
        { date: new Date().toISOString(), energyLevel: 75, timeOfDay: "morning" as const },
        { date: new Date().toISOString(), energyLevel: 60, timeOfDay: "afternoon" as const },
        { date: new Date().toISOString(), energyLevel: 50, timeOfDay: "evening" as const },
      ];

      const availableHours = { start: 6, end: 22 };

      // Analyze energy patterns
      const morningEnergy =
        energyHistory
          .filter((h: any) => h.timeOfDay === "morning")
          .reduce((sum: number, h: any) => sum + h.energyLevel, 0) /
          energyHistory.filter((h: any) => h.timeOfDay === "morning").length || 50;

      const afternoonEnergy =
        energyHistory
          .filter((h: any) => h.timeOfDay === "afternoon")
          .reduce((sum: number, h: any) => sum + h.energyLevel, 0) /
          energyHistory.filter((h: any) => h.timeOfDay === "afternoon").length || 50;

      const eveningEnergy =
        energyHistory
          .filter((h: any) => h.timeOfDay === "evening")
          .reduce((sum: number, h: any) => sum + h.energyLevel, 0) /
          energyHistory.filter((h: any) => h.timeOfDay === "evening").length || 50;

      // Determine required energy level
      const requiredEnergy =
        task.energyRequirement === "high" ? 70 : task.energyRequirement === "moderate" ? 50 : 30;

      // Generate time slots
      const slots: Array<{
        time: string;
        hour: number;
        energyMatch: number;
        recommendation: string;
      }> = [];

      for (let hour = availableHours.start; hour < availableHours.end; hour++) {
        let timeOfDay: "morning" | "afternoon" | "evening";
        let avgEnergy: number;

        if (hour < 12) {
          timeOfDay = "morning";
          avgEnergy = morningEnergy;
        } else if (hour < 18) {
          timeOfDay = "afternoon";
          avgEnergy = afternoonEnergy;
        } else {
          timeOfDay = "evening";
          avgEnergy = eveningEnergy;
        }

        const energyMatch = Math.max(0, 100 - Math.abs(avgEnergy - requiredEnergy));

        let recommendation: string;
        if (energyMatch >= 80) {
          recommendation = "Excellent match - Your energy peaks at this time";
        } else if (energyMatch >= 60) {
          recommendation = "Good match - Suitable for this task";
        } else if (energyMatch >= 40) {
          recommendation = "Fair match - Consider if no better options";
        } else {
          recommendation = "Poor match - Try a different time if possible";
        }

        slots.push({
          time: `${hour.toString().padStart(2, "0")}:00`,
          hour,
          energyMatch,
          recommendation,
        });
      }

      // Sort by energy match
      slots.sort((a, b) => b.energyMatch - a.energyMatch);

      return {
        optimalSlots: slots.slice(0, 5), // Top 5 recommendations
        analysis: {
          morningEnergy: Math.round(morningEnergy),
          afternoonEnergy: Math.round(afternoonEnergy),
          eveningEnergy: Math.round(eveningEnergy),
          bestTimeOfDay:
            morningEnergy > afternoonEnergy && morningEnergy > eveningEnergy
              ? "morning"
              : afternoonEnergy > eveningEnergy
                ? "afternoon"
                : "evening",
        },
      };
    }),

  /**
   * AI-powered task scheduling recommendations
   */
  getAISchedulingAdvice: publicProcedure
    .input(
      z.object({
        tasks: z.array(TaskSchema),
        energyPatterns: z.object({
          peakHours: z.array(z.number()),
          lowHours: z.array(z.number()),
          averageEnergy: z.number(),
        }),
        constraints: z.object({
          workingHours: z.object({
            start: z.number(),
            end: z.number(),
          }),
          breakDuration: z.number(), // minutes
          maxTasksPerDay: z.number(),
        }),
      })
    )
    .mutation(async ({ input, ctx }: { input: any; ctx: any }) => {
      const { tasks, energyPatterns, constraints } = input;

      // Use LLM to generate personalized scheduling advice
      const prompt = `You are an AI scheduling assistant specializing in energy-based productivity optimization.

User's Energy Patterns:
- Peak energy hours: ${energyPatterns.peakHours.map((h: number) => `${h}:00`).join(", ")}
- Low energy hours: ${energyPatterns.lowHours.map((h: number) => `${h}:00`).join(", ")}
- Average energy level: ${energyPatterns.averageEnergy}/100

Tasks to schedule:
${tasks
  .map(
    (t: any) =>
      `- ${t.title} (${t.estimatedDuration}min, ${t.priority} priority, requires ${t.energyRequirement} energy)${t.deadline ? ` - Due: ${new Date(t.deadline).toLocaleDateString()}` : ""}`
  )
  .join("\n")}

Constraints:
- Working hours: ${constraints.workingHours.start}:00 - ${constraints.workingHours.end}:00
- Break duration: ${constraints.breakDuration} minutes
- Max tasks per day: ${constraints.maxTasksPerDay}

Provide:
1. Optimal daily schedule with specific time slots for each task
2. Reasoning for each scheduling decision based on energy patterns
3. Tips for maximizing productivity
4. Warnings about potential energy conflicts

Format your response as JSON with this structure:
{
  "schedule": [
    {
      "taskId": "string",
      "scheduledTime": "HH:MM",
      "reasoning": "string"
    }
  ],
  "tips": ["string"],
  "warnings": ["string"]
}`;

      try {
        const completion = await ctx.llm.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You are an expert AI scheduling assistant. Always respond with valid JSON only.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 1500,
        });

        const responseText = completion.choices[0]?.message?.content || "{}";
        const advice = JSON.parse(responseText);

        return {
          schedule: advice.schedule || [],
          tips: advice.tips || [],
          warnings: advice.warnings || [],
          confidence: 0.85,
        };
      } catch (error) {
        console.error("AI scheduling advice error:", error);

        // Fallback: Simple rule-based scheduling
        const schedule = tasks.map((task: any) => {
          const optimalHour =
            task.energyRequirement === "high"
              ? energyPatterns.peakHours[0] || 9
              : task.energyRequirement === "moderate"
                ? energyPatterns.peakHours[1] || 14
                : energyPatterns.lowHours[0] || 16;

          return {
            taskId: task.id,
            scheduledTime: `${optimalHour.toString().padStart(2, "0")}:00`,
            reasoning: `Scheduled during ${task.energyRequirement} energy period`,
          };
        });

        return {
          schedule,
          tips: [
            "Schedule high-energy tasks during your peak hours",
            "Take breaks between demanding tasks",
            "Save low-energy tasks for your natural dips",
          ],
          warnings: [],
          confidence: 0.6,
        };
      }
    }),

  /**
   * Analyze task completion patterns
   */
  analyzeTaskPatterns: publicProcedure
    .input(
      z.object({
        completedTasks: z.array(
          TaskSchema.extend({
            completedAt: z.string(),
            energyAtCompletion: z.number(),
          })
        ),
      })
    )
    .mutation(async ({ input }: { input: any }) => {
      const { completedTasks } = input;

      if (completedTasks.length === 0) {
        return {
          patterns: [],
          insights: ["Complete more tasks to discover your productivity patterns"],
        };
      }

      // Analyze completion times
      const completionHours = completedTasks.map((t: any) => new Date(t.completedAt).getHours());
      const avgCompletionHour =
        completionHours.reduce((sum: number, h: number) => sum + h, 0) / completionHours.length;

      // Analyze energy levels
      const avgEnergyAtCompletion =
        completedTasks.reduce((sum: number, t: any) => sum + t.energyAtCompletion, 0) / completedTasks.length;

      // Group by priority
      const highPriorityTasks = completedTasks.filter((t: any) => t.priority === "high");
      const avgHighPriorityEnergy =
        highPriorityTasks.length > 0
          ? highPriorityTasks.reduce((sum: number, t: any) => sum + t.energyAtCompletion, 0) /
            highPriorityTasks.length
          : 0;

      const insights: string[] = [];

      if (avgCompletionHour < 12) {
        insights.push("You tend to complete tasks in the morning - a morning person!");
      } else if (avgCompletionHour < 17) {
        insights.push("You're most productive in the afternoon");
      } else {
        insights.push("You complete tasks best in the evening");
      }

      if (avgEnergyAtCompletion > 70) {
        insights.push("You work best with high energy - prioritize peak hours");
      } else if (avgEnergyAtCompletion < 40) {
        insights.push("You can complete tasks even with lower energy - good resilience!");
      }

      if (highPriorityTasks.length > 0 && avgHighPriorityEnergy > 60) {
        insights.push("High-priority tasks need your peak energy - schedule them early");
      }

      return {
        patterns: [
          {
            type: "completion_time",
            value: `${Math.round(avgCompletionHour)}:00`,
            description: "Average task completion time",
          },
          {
            type: "energy_level",
            value: Math.round(avgEnergyAtCompletion),
            description: "Average energy at completion",
          },
          {
            type: "high_priority_energy",
            value: Math.round(avgHighPriorityEnergy),
            description: "Energy needed for high-priority tasks",
          },
        ],
        insights,
      };
    }),
});

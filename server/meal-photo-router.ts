import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";

export const mealPhotoRouter = router({
  /**
   * Analyze meal photo and identify foods
   */
  analyzePhoto: protectedProcedure
    .input(
      z.object({
        imageUrl: z.string().url(),
      })
    )
    .mutation(async ({ input }) => {
      const { imageUrl } = input;

      const prompt = `Analyze this meal photo and identify all food items visible. For each item, provide:
1. Food name
2. Estimated portion size (in grams or standard serving)
3. Estimated calories
4. Estimated macronutrients (protein, carbs, fats in grams)

Format your response as a JSON array of objects with these fields:
- name: string
- portion: string
- calories: number
- protein: number
- carbs: number
- fats: number

Be as accurate as possible based on visual appearance. If multiple items are present, list them all.`;

      const response = await invokeLLM({
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: imageUrl } },
            ],
          },
        ],
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content || "{}";
      const contentStr = typeof content === "string" ? content : JSON.stringify(content);
      const parsed = JSON.parse(contentStr);

      return {
        foods: parsed.foods || [],
        totalCalories: parsed.foods?.reduce((sum: number, f: any) => sum + (f.calories || 0), 0) || 0,
        totalProtein: parsed.foods?.reduce((sum: number, f: any) => sum + (f.protein || 0), 0) || 0,
        totalCarbs: parsed.foods?.reduce((sum: number, f: any) => sum + (f.carbs || 0), 0) || 0,
        totalFats: parsed.foods?.reduce((sum: number, f: any) => sum + (f.fats || 0), 0) || 0,
      };
    }),

  /**
   * Get nutritional suggestions based on meal photo analysis
   */
  getSuggestions: protectedProcedure
    .input(
      z.object({
        foods: z.array(
          z.object({
            name: z.string(),
            calories: z.number(),
            protein: z.number(),
            carbs: z.number(),
            fats: z.number(),
          })
        ),
        energyLevel: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { foods, energyLevel } = input;

      const totalCalories = foods.reduce((sum, f) => sum + f.calories, 0);
      const totalProtein = foods.reduce((sum, f) => sum + f.protein, 0);
      const totalCarbs = foods.reduce((sum, f) => sum + f.carbs, 0);
      const totalFats = foods.reduce((sum, f) => sum + f.fats, 0);

      const prompt = `Analyze this meal and provide nutritional insights:

Foods: ${foods.map((f) => f.name).join(", ")}
Total Calories: ${totalCalories}
Protein: ${totalProtein}g
Carbs: ${totalCarbs}g
Fats: ${totalFats}g
${energyLevel ? `Current Energy Level: ${energyLevel}/100` : ""}

Provide:
1. Overall meal quality assessment (1-10)
2. Energy impact prediction (will this boost or drain energy?)
3. 2-3 specific suggestions for improvement
4. Best time of day to eat this meal

Keep response concise and practical.`;

      const response = await invokeLLM({
        messages: [{ role: "user", content: prompt }],
      });

      const content = response.choices[0]?.message?.content || "";
      const contentStr = typeof content === "string" ? content : JSON.stringify(content);

      return {
        analysis: contentStr,
        mealQuality: totalProtein > 20 && totalCarbs < 60 ? 8 : 6,
        energyImpact: totalProtein > 15 ? "boost" : "neutral",
      };
    }),
});

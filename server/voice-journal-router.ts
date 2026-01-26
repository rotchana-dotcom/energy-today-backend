/**
 * Voice Journal Router
 * 
 * Handles voice recording transcription and AI analysis
 */

import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { invokeLLM } from "./_core/llm";
import { transcribeAudio } from "./_core/voiceTranscription";

export const voiceJournalRouter = router({
  /**
   * Transcribe audio file using Whisper
   */
  transcribeAudio: protectedProcedure
    .input(
      z.object({
        audioUrl: z.string().url(), // S3 URL of uploaded audio
      })
    )
    .mutation(async ({ input }: any) => {
      try {
        // Use Whisper API for transcription
        const transcription = await transcribeAudio({
          audioUrl: input.audioUrl,
        });

        // Check if transcription was successful
        if ('error' in transcription) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: transcription.error,
          });
        }

        return {
          success: true,
          transcription: transcription.text,
          language: transcription.language,
        };
      } catch (error) {
        console.error("Transcription error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to transcribe audio",
        });
      }
    }),

  /**
   * Analyze journal entry for emotional content
   */
  analyzeJournalEntry: protectedProcedure
    .input(
      z.object({
        text: z.string(),
        date: z.string(),
        energyScore: z.number().optional(),
      })
    )
    .mutation(async ({ input }: any) => {
      try {
        const prompt = `Analyze this daily journal entry and provide insights:

Entry: "${input.text}"
Date: ${input.date}
${input.energyScore ? `Energy Score: ${input.energyScore}/100` : ""}

Analyze and respond in this exact JSON format (no markdown, just JSON):
{
  "emotionalTone": "positive",
  "emotions": ["confident", "motivated"],
  "energyLevel": "high",
  "themes": ["productivity", "success"],
  "insight": "Brief insight about patterns"
}`;

        const response = await invokeLLM({
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        });

        // Parse JSON response
        const content = typeof response.choices[0].message.content === 'string' 
          ? response.choices[0].message.content 
          : JSON.stringify(response.choices[0].message.content);
        
        // Remove markdown code blocks if present
        const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const analysis = JSON.parse(cleanContent);

        return {
          success: true,
          analysis: {
            emotionalTone: analysis.emotionalTone,
            emotions: analysis.emotions,
            energyLevel: analysis.energyLevel,
            themes: analysis.themes,
            insight: analysis.insight,
          },
        };
      } catch (error) {
        console.error("Journal analysis error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to analyze journal entry",
        });
      }
    }),
});

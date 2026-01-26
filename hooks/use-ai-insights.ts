/**
 * useAIInsights Hook
 * 
 * Reusable hook for loading AI-powered insights across all features
 */

import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { collectUserDataForAnalytics } from "@/lib/collect-user-data";
import type { AIInsight } from "@/components/ai-insights-card";

export type FeatureFocus = 'sleep' | 'meditation' | 'diet' | 'fitness' | 'chi' | 'business' | 'general';

export function useAIInsights(focus: FeatureFocus) {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInsights = async () => {
    try {
      setLoading(true);
      setError(null);

      // Collect user data
      const userData = await collectUserDataForAnalytics(30);

      // Call AI analytics endpoint
      const result = await trpc.aiAnalytics.generatePersonalizedAnalytics.query({
        userData,
        focus,
        esotericData: {} // Populated by server
      });

      // Transform results based on focus
      const transformedInsights: AIInsight[] = [];

      switch (focus) {
        case 'sleep':
          if (result.bestTimes.sleep) {
            transformedInsights.push({
              title: "Optimal Bedtime",
              recommendation: result.bestTimes.sleep.time,
              confidence: result.bestTimes.sleep.confidence,
              reason: result.bestTimes.sleep.reason
            });
          }
          if (result.bestTimes.wake) {
            transformedInsights.push({
              title: "Optimal Wake Time",
              recommendation: result.bestTimes.wake.time,
              confidence: result.bestTimes.wake.confidence,
              reason: result.bestTimes.wake.reason
            });
          }
          break;

        case 'meditation':
          if (result.bestTimes.meditation) {
            transformedInsights.push({
              title: "Best Meditation Time",
              recommendation: result.bestTimes.meditation.time,
              confidence: result.bestTimes.meditation.confidence,
              reason: result.bestTimes.meditation.reason
            });
          }
          if (result.insights && result.insights.length > 0) {
            transformedInsights.push({
              title: "Meditation Insight",
              recommendation: result.insights[0],
              confidence: 80,
              reason: "Based on your energy patterns and spiritual cycles"
            });
          }
          break;

        case 'diet':
          if (result.bestTimes.meals) {
            transformedInsights.push({
              title: "Optimal Meal Times",
              recommendation: result.bestTimes.meals.time,
              confidence: result.bestTimes.meals.confidence,
              reason: result.bestTimes.meals.reason
            });
          }
          if (result.insights && result.insights.length > 0) {
            transformedInsights.push({
              title: "Dietary Recommendation",
              recommendation: result.insights[0],
              confidence: 75,
              reason: "Based on your Ayurvedic dosha and energy patterns"
            });
          }
          break;

        case 'fitness':
          if (result.bestTimes.exercise) {
            transformedInsights.push({
              title: "Best Workout Time",
              recommendation: result.bestTimes.exercise.time,
              confidence: result.bestTimes.exercise.confidence,
              reason: result.bestTimes.exercise.reason
            });
          }
          break;

        case 'chi':
          if (result.insights && result.insights.length > 0) {
            transformedInsights.push({
              title: "Chi Cultivation Guidance",
              recommendation: result.insights[0],
              confidence: 85,
              reason: "Based on Feng Shui, lunar phases, and your energy data"
            });
          }
          break;

        case 'business':
          if (result.bestTimes.meetings) {
            transformedInsights.push({
              title: "Optimal Meeting Times",
              recommendation: result.bestTimes.meetings.time,
              confidence: result.bestTimes.meetings.confidence,
              reason: result.bestTimes.meetings.reason
            });
          }
          if (result.bestTimes.decisions) {
            transformedInsights.push({
              title: "Best Time for Decisions",
              recommendation: result.bestTimes.decisions.time,
              confidence: result.bestTimes.decisions.confidence,
              reason: result.bestTimes.decisions.reason
            });
          }
          break;

        case 'general':
          // Add top 3 insights
          result.insights?.slice(0, 3).forEach((insight, i) => {
            transformedInsights.push({
              title: `Insight ${i + 1}`,
              recommendation: insight,
              confidence: 80 - (i * 5),
              reason: "Based on 7 spiritual systems + your personal data"
            });
          });
          break;
      }

      // Add discovered patterns
      const relevantPatterns = result.patterns.filter(p => {
        const lower = p.toLowerCase();
        return lower.includes(focus) || focus === 'general';
      });

      if (relevantPatterns.length > 0 && transformedInsights.length < 3) {
        transformedInsights.push({
          title: "Pattern Discovered",
          recommendation: relevantPatterns[0],
          confidence: 75,
          reason: "Based on your data over the past 30 days"
        });
      }

      setInsights(transformedInsights);
    } catch (err) {
      console.error('Error loading AI insights:', err);
      setError('Unable to load AI insights. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInsights();
  }, [focus]);

  return {
    insights,
    loading,
    error,
    reload: loadInsights
  };
}

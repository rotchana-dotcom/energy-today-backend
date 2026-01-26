/**
 * Subscription API Router
 * Provides endpoints for checking subscription status
 */

import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { subscriptions } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

export const subscriptionRouter = router({
  /**
   * Check if user has active subscription or valid trial
   * Returns Pro status based on:
   * 1. Active paid subscription
   * 2. 7-day trial (if no subscription exists and app installed < 7 days ago)
   */
  checkStatus: publicProcedure
    .input(z.object({
      userId: z.string(),
      installDate: z.string().optional(), // ISO date string when app was first installed
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        return {
          isPro: false,
          provider: null,
          plan: null,
          status: null,
          trialDaysRemaining: 0,
          isTrialActive: false,
        };
      }

      // Check for active paid subscription
      const result = await db
        .select()
        .from(subscriptions)
        .where(
          and(
            eq(subscriptions.userId, parseInt(input.userId)),
            eq(subscriptions.status, "active")
          )
        )
        .limit(1);

      // If paid subscription exists, return Pro status
      if (result.length > 0) {
        const subscription = result[0];
        return {
          isPro: true,
          provider: subscription.provider,
          plan: subscription.plan,
          status: subscription.status,
          nextBillingDate: subscription.nextBillingDate,
          trialDaysRemaining: 0,
          isTrialActive: false,
        };
      }

      // No paid subscription - check if user is in 7-day trial
      if (input.installDate) {
        const installDate = new Date(input.installDate);
        const now = new Date();
        const daysSinceInstall = Math.floor((now.getTime() - installDate.getTime()) / (1000 * 60 * 60 * 24));
        const trialDaysRemaining = Math.max(0, 7 - daysSinceInstall);
        const isTrialActive = trialDaysRemaining > 0;

        if (isTrialActive) {
          return {
            isPro: true,
            provider: "trial",
            plan: null,
            status: "trial",
            trialDaysRemaining,
            isTrialActive: true,
          };
        }
      }

      // No subscription and trial expired
      return {
        isPro: false,
        provider: null,
        plan: null,
        status: null,
        trialDaysRemaining: 0,
        isTrialActive: false,
      };
    }),

  /**
   * Get subscription details
   */
  getDetails: publicProcedure
    .input(z.object({
      userId: z.string(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        return null;
      }

      // Get subscription (active or cancelled)
      const result = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, parseInt(input.userId)))
        .limit(1);

      if (result.length === 0) {
        return null;
      }

      return result[0];
    }),
});

/**
 * Payment API Router
 * Handles Stripe and PayPal payment processing for Pro subscriptions
 */

import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import Stripe from "stripe";

const STRIPE_SECRET_KEY = process.env.ENERGY_TODAY_STRIPE_SECRET_KEY;
const STRIPE_MONTHLY_PRICE_ID = process.env.ENERGY_TODAY_STRIPE_MONTHLY_PRICE_ID;
const STRIPE_ANNUAL_PRICE_ID = process.env.ENERGY_TODAY_STRIPE_ANNUAL_PRICE_ID;

const PAYPAL_CLIENT_ID = process.env.ENERGY_TODAY_PAYPAL_CLIENT_ID;
const PAYPAL_SECRET = process.env.ENERGY_TODAY_PAYPAL_SECRET;
const PAYPAL_MONTHLY_PLAN_ID = process.env.ENERGY_TODAY_PAYPAL_MONTHLY_PLAN_ID;
const PAYPAL_ANNUAL_PLAN_ID = process.env.ENERGY_TODAY_PAYPAL_ANNUAL_PLAN_ID;

const GOOGLE_PLAY_SERVICE_ACCOUNT = process.env.ENERGY_TODAY_GOOGLE_PLAY_SERVICE_ACCOUNT;
const GOOGLE_PLAY_PACKAGE_NAME = process.env.ENERGY_TODAY_GOOGLE_PLAY_PACKAGE_NAME || "space.manus.energy.today";

// Initialize Stripe
const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2025-12-15.clover",
}) : null;

/**
 * Get PayPal access token
 */
async function getPayPalAccessToken(): Promise<string> {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString("base64");
  
  const response = await fetch("https://api-m.paypal.com/v1/oauth2/token", {
    method: "POST",
    headers: {
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error("Failed to get PayPal access token");
  }

  const data = await response.json();
  return data.access_token;
}

export const paymentRouter = router({
  /**
   * Create Stripe checkout session
   */
  createStripeCheckout: publicProcedure
    .input(z.object({
      userId: z.string(),
      plan: z.enum(["monthly", "annual"]).default("monthly"),
      successUrl: z.string(),
      cancelUrl: z.string(),
    }))
    .mutation(async ({ input }) => {
      if (!STRIPE_SECRET_KEY) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Stripe not configured",
        });
      }

      if (!stripe) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Stripe not initialized",
        });
      }

      if (!STRIPE_MONTHLY_PRICE_ID || !STRIPE_ANNUAL_PRICE_ID) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Stripe Price IDs not configured",
        });
      }

      try {
        const priceId = input.plan === "annual" ? STRIPE_ANNUAL_PRICE_ID : STRIPE_MONTHLY_PRICE_ID;
        
        // Create Stripe checkout session with Price ID
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: [
            {
              price: priceId,
              quantity: 1,
            },
          ],
          mode: "subscription",
          success_url: input.successUrl,
          cancel_url: input.cancelUrl,
          client_reference_id: input.userId,
          metadata: {
            userId: input.userId,
            plan: input.plan,
          },
        });
        
        return {
          success: true,
          sessionId: session.id,
          url: session.url,
        };
      } catch (error) {
        console.error("Stripe checkout error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Payment failed",
        });
      }
    }),

  /**
   * Create PayPal subscription
   */
  createPayPalSubscription: publicProcedure
    .input(z.object({
      userId: z.string(),
      plan: z.enum(["monthly", "annual"]).default("monthly"),
    }))
    .mutation(async ({ input }) => {
      if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "PayPal not configured",
        });
      }

      if (!PAYPAL_MONTHLY_PLAN_ID || !PAYPAL_ANNUAL_PLAN_ID) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "PayPal Plan IDs not configured",
        });
      }

      try {
        const accessToken = await getPayPalAccessToken();
        const planId = input.plan === "annual" ? PAYPAL_ANNUAL_PLAN_ID : PAYPAL_MONTHLY_PLAN_ID;

        // Create subscription with Plan ID
        const response = await fetch("https://api-m.paypal.com/v1/billing/subscriptions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            plan_id: planId,
            custom_id: input.userId,
            application_context: {
              brand_name: "Energy Today",
              shipping_preference: "NO_SHIPPING",
              user_action: "SUBSCRIBE_NOW",
              return_url: "energytoday://payment-success?provider=paypal&plan=" + input.plan,
              cancel_url: "energytoday://upgrade",
            },
          }),
        });

        if (!response.ok) {
          const error = await response.text();
          console.error("PayPal error:", error);
          throw new Error("Failed to create PayPal subscription");
        }

        const subscription = await response.json();
        const approveLink = subscription.links.find((link: any) => link.rel === "approve");

        return {
          success: true,
          subscriptionId: subscription.id,
          approveUrl: approveLink?.href,
        };
      } catch (error) {
        console.error("PayPal subscription error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Payment failed",
        });
      }
    }),

  /**
   * Verify payment status
   */
  verifyPayment: publicProcedure
    .input(z.object({
      provider: z.enum(["stripe", "paypal"]),
      paymentId: z.string(),
    }))
    .query(async ({ input }) => {
      try {
        if (input.provider === "stripe") {
          if (!stripe) {
            return { success: false, paid: false };
          }

          const session = await stripe.checkout.sessions.retrieve(input.paymentId);
          return {
            success: true,
            paid: session.payment_status === "paid",
            userId: session.client_reference_id,
          };
        } else {
          const accessToken = await getPayPalAccessToken();
          const response = await fetch(`https://api-m.paypal.com/v1/billing/subscriptions/${input.paymentId}`, {
            headers: {
              "Authorization": `Bearer ${accessToken}`,
            },
          });

          if (!response.ok) {
            return { success: false, paid: false };
          }

          const subscription = await response.json();
          return {
            success: true,
            paid: subscription.status === "ACTIVE",
            userId: subscription.custom_id,
          };
        }
      } catch (error) {
        console.error("Payment verification error:", error);
        return { success: false, paid: false };
      }
    }),

  /**
   * Verify Google Play purchase
   * Validates purchase token with Google Play Developer API
   */
  verifyGooglePlayPurchase: publicProcedure
    .input(z.object({
      productId: z.string(),
      purchaseToken: z.string(),
      orderId: z.string(),
      packageName: z.string(),
    }))
    .mutation(async ({ input }) => {
      if (!GOOGLE_PLAY_SERVICE_ACCOUNT) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Google Play service account not configured",
        });
      }

      try {
        // Parse service account JSON
        const serviceAccount = JSON.parse(GOOGLE_PLAY_SERVICE_ACCOUNT);
        
        // Get OAuth2 access token
        const jwtToken = await getGooglePlayAccessToken(serviceAccount);
        
        // Verify purchase with Google Play API
        const url = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${input.packageName}/purchases/subscriptions/${input.productId}/tokens/${input.purchaseToken}`;
        
        const response = await fetch(url, {
          headers: {
            "Authorization": `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const error = await response.text();
          console.error("Google Play verification error:", error);
          return { success: false, error: "Verification failed" };
        }

        const purchase = await response.json();
        
        // Check if subscription is active
        const isActive = purchase.paymentState === 1; // 1 = Payment received
        const notCancelled = !purchase.cancelReason;
        
        if (isActive && notCancelled) {
          // TODO: Save subscription to database
          // await saveSubscriptionToDatabase({
          //   userId: input.userId,
          //   provider: "google_play",
          //   productId: input.productId,
          //   orderId: input.orderId,
          //   expiryDate: new Date(parseInt(purchase.expiryTimeMillis)),
          // });
          
          return {
            success: true,
            isActive: true,
            expiryDate: new Date(parseInt(purchase.expiryTimeMillis)),
          };
        } else {
          return {
            success: false,
            error: "Subscription not active",
          };
        }
      } catch (error) {
        console.error("Google Play verification error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Verification failed",
        });
      }
    }),
});

/**
 * Get Google Play access token using service account
 */
async function getGooglePlayAccessToken(serviceAccount: any): Promise<string> {
  const { GoogleAuth } = await import("google-auth-library");
  
  const auth = new GoogleAuth({
    credentials: serviceAccount,
    scopes: ["https://www.googleapis.com/auth/androidpublisher"],
  });
  
  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();
  
  if (!accessToken.token) {
    throw new Error("Failed to get Google Play access token");
  }
  
  return accessToken.token;
}

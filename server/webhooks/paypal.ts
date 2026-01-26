/**
 * PayPal Webhook Handler
 * Handles subscription events from PayPal and updates subscription status
 */

import { Request, Response } from "express";
import { getDb } from "../db";
import { subscriptions } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

const PAYPAL_CLIENT_ID = process.env.ENERGY_TODAY_PAYPAL_CLIENT_ID;
const PAYPAL_SECRET = process.env.ENERGY_TODAY_PAYPAL_SECRET;
const PAYPAL_WEBHOOK_ID = process.env.ENERGY_TODAY_PAYPAL_WEBHOOK_ID;

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

/**
 * Verify PayPal webhook signature
 */
async function verifyWebhookSignature(req: Request): Promise<boolean> {
  if (!PAYPAL_WEBHOOK_ID) {
    console.warn("PayPal webhook ID not configured, skipping verification");
    return true; // Allow in development
  }

  try {
    const accessToken = await getPayPalAccessToken();
    
    const verificationData = {
      auth_algo: req.headers["paypal-auth-algo"],
      cert_url: req.headers["paypal-cert-url"],
      transmission_id: req.headers["paypal-transmission-id"],
      transmission_sig: req.headers["paypal-transmission-sig"],
      transmission_time: req.headers["paypal-transmission-time"],
      webhook_id: PAYPAL_WEBHOOK_ID,
      webhook_event: req.body,
    };

    const response = await fetch("https://api-m.paypal.com/v1/notifications/verify-webhook-signature", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(verificationData),
    });

    const result = await response.json();
    return result.verification_status === "SUCCESS";
  } catch (error) {
    console.error("PayPal webhook verification failed:", error);
    return false;
  }
}

/**
 * Handle PayPal webhook events
 */
export async function handlePayPalWebhook(req: Request, res: Response) {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET) {
    console.error("PayPal not configured");
    return res.status(500).json({ error: "PayPal not configured" });
  }

  // Verify webhook signature
  const isValid = await verifyWebhookSignature(req);
  if (!isValid) {
    console.error("Invalid PayPal webhook signature");
    return res.status(400).json({ error: "Invalid signature" });
  }

  const event = req.body;
  const eventType = event.event_type;

  console.log(`PayPal webhook received: ${eventType}`);

  try {
    switch (eventType) {
      case "BILLING.SUBSCRIPTION.ACTIVATED": {
        await handleSubscriptionActivated(event);
        break;
      }

      case "BILLING.SUBSCRIPTION.UPDATED": {
        await handleSubscriptionUpdated(event);
        break;
      }

      case "BILLING.SUBSCRIPTION.CANCELLED": {
        await handleSubscriptionCancelled(event);
        break;
      }

      case "BILLING.SUBSCRIPTION.EXPIRED": {
        await handleSubscriptionExpired(event);
        break;
      }

      default:
        console.log(`Unhandled event type: ${eventType}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
}

/**
 * Handle BILLING.SUBSCRIPTION.ACTIVATED event
 * This fires when a subscription is activated
 */
async function handleSubscriptionActivated(event: any) {
  const subscription = event.resource;
  const subscriptionId = subscription.id;
  const customId = subscription.custom_id; // This is the userId we passed
  const planId = subscription.plan_id;

  console.log("Subscription activated:", subscriptionId);

  if (!customId) {
    console.error("Missing customId in subscription");
    return;
  }

  // Determine plan from plan ID
  const monthlyPlanId = process.env.ENERGY_TODAY_PAYPAL_MONTHLY_PLAN_ID;
  const annualPlanId = process.env.ENERGY_TODAY_PAYPAL_ANNUAL_PLAN_ID;

  let plan: "monthly" | "annual" = "monthly";
  if (planId === annualPlanId) {
    plan = "annual";
  }

  // Get next billing time
  const nextBillingTime = subscription.billing_info?.next_billing_time;

  // Create subscription record
  const db = await getDb();
  if (!db) {
    console.error("Database not available");
    return;
  }

  await db.insert(subscriptions).values({
    userId: parseInt(customId),
    provider: "paypal",
    plan,
    status: "active",
    subscriptionId: subscriptionId,
    customerId: subscription.subscriber?.payer_id || null,
    startDate: new Date(subscription.start_time || Date.now()),
    nextBillingDate: nextBillingTime ? new Date(nextBillingTime) : null,
  });

  console.log(`Subscription created for user ${customId}: ${subscriptionId}`);
}

/**
 * Handle BILLING.SUBSCRIPTION.UPDATED event
 */
async function handleSubscriptionUpdated(event: any) {
  const subscription = event.resource;
  const subscriptionId = subscription.id;

  console.log("Subscription updated:", subscriptionId);

  const db = await getDb();
  if (!db) return;

  const nextBillingTime = subscription.billing_info?.next_billing_time;

  await db
    .update(subscriptions)
    .set({
      nextBillingDate: nextBillingTime ? new Date(nextBillingTime) : null,
      status: subscription.status === "ACTIVE" ? "active" : "cancelled",
    })
    .where(eq(subscriptions.subscriptionId, subscriptionId));
}

/**
 * Handle BILLING.SUBSCRIPTION.CANCELLED event
 */
async function handleSubscriptionCancelled(event: any) {
  const subscription = event.resource;
  const subscriptionId = subscription.id;

  console.log("Subscription cancelled:", subscriptionId);

  const db = await getDb();
  if (!db) return;

  await db
    .update(subscriptions)
    .set({
      status: "cancelled",
      endDate: new Date(),
    })
    .where(eq(subscriptions.subscriptionId, subscriptionId));
}

/**
 * Handle BILLING.SUBSCRIPTION.EXPIRED event
 */
async function handleSubscriptionExpired(event: any) {
  const subscription = event.resource;
  const subscriptionId = subscription.id;

  console.log("Subscription expired:", subscriptionId);

  const db = await getDb();
  if (!db) return;

  await db
    .update(subscriptions)
    .set({
      status: "expired",
      endDate: new Date(),
    })
    .where(eq(subscriptions.subscriptionId, subscriptionId));
}

/**
 * Stripe Webhook Handler
 * Handles payment events from Stripe and updates subscription status
 */

import { Request, Response } from "express";
import Stripe from "stripe";
import { getDb } from "../db";
import { subscriptions } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

const STRIPE_SECRET_KEY = process.env.ENERGY_TODAY_STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.ENERGY_TODAY_STRIPE_WEBHOOK_SECRET;

const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2025-12-15.clover",
}) : null;

/**
 * Handle Stripe webhook events
 */
export async function handleStripeWebhook(req: Request, res: Response) {
  if (!stripe || !STRIPE_WEBHOOK_SECRET) {
    console.error("Stripe not configured");
    return res.status(500).json({ error: "Stripe not configured" });
  }

  const sig = req.headers["stripe-signature"];

  if (!sig) {
    console.error("No Stripe signature");
    return res.status(400).json({ error: "No signature" });
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return res.status(400).json({ error: "Invalid signature" });
  }

  console.log(`Stripe webhook received: ${event.type}`);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCreated(subscription);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
}

/**
 * Handle checkout.session.completed event
 * This fires when a user completes payment
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log("Checkout completed:", session.id);

  const userId = session.client_reference_id;
  const subscriptionId = session.subscription as string;

  if (!userId || !subscriptionId) {
    console.error("Missing userId or subscriptionId in checkout session");
    return;
  }

  // Get subscription details
  if (!stripe) return;
  const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);

  // Determine plan from price
  const priceId = stripeSubscription.items.data[0]?.price.id;
  const monthlyPriceId = process.env.ENERGY_TODAY_STRIPE_MONTHLY_PRICE_ID;
  const annualPriceId = process.env.ENERGY_TODAY_STRIPE_ANNUAL_PRICE_ID;

  let plan: "monthly" | "annual" = "monthly";
  if (priceId === annualPriceId) {
    plan = "annual";
  }

  // Create subscription record
  const db = await getDb();
  if (!db) {
    console.error("Database not available");
    return;
  }
  
  await db.insert(subscriptions).values({
    userId: parseInt(userId),
    provider: "stripe",
    plan,
    status: "active",
    subscriptionId: stripeSubscription.id,
    customerId: stripeSubscription.customer as string,
    startDate: new Date((stripeSubscription as any).current_period_start * 1000),
    nextBillingDate: new Date((stripeSubscription as any).current_period_end * 1000),
  });

  console.log(`Subscription created for user ${userId}: ${stripeSubscription.id}`);
}

/**
 * Handle customer.subscription.created event
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log("Subscription created:", subscription.id);
  // Usually handled by checkout.session.completed
  // This is a backup in case checkout event is missed
}

/**
 * Handle customer.subscription.updated event
 * This fires when subscription is renewed or modified
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log("Subscription updated:", subscription.id);

  // Update next billing date
  const db = await getDb();
  if (!db) return;
  
  await db
    .update(subscriptions)
    .set({
      nextBillingDate: (subscription as any).current_period_end ? new Date((subscription as any).current_period_end * 1000) : null,
      status: subscription.status === "active" ? "active" : "cancelled",
    })
    .where(eq(subscriptions.subscriptionId, subscription.id));
}

/**
 * Handle customer.subscription.deleted event
 * This fires when subscription is cancelled
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log("Subscription deleted:", subscription.id);

  // Mark subscription as cancelled
  const db = await getDb();
  if (!db) return;
  
  await db
    .update(subscriptions)
    .set({
      status: "cancelled",
      endDate: new Date(),
    })
    .where(eq(subscriptions.subscriptionId, subscription.id));
}

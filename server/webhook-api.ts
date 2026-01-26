/**
 * Webhook API Routes
 * Express routes for Stripe and PayPal webhooks
 */

import express, { Router } from "express";
import { handleStripeWebhook } from "./webhooks/stripe";
import { handlePayPalWebhook } from "./webhooks/paypal";

export function createWebhookRouter(): Router {
  const router = Router();

  // Stripe webhook - requires raw body for signature verification
  router.post(
    "/stripe",
    express.raw({ type: "application/json" }),
    handleStripeWebhook
  );

  // PayPal webhook - uses JSON body
  router.post("/paypal", express.json(), handlePayPalWebhook);

  return router;
}

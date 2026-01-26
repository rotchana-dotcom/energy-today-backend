/**
 * Payment REST API
 * Simple Express endpoints for Stripe and PayPal payments
 */

import express from "express";
import Stripe from "stripe";

const router = express.Router();

const STRIPE_SECRET_KEY = process.env.ENERGY_TODAY_STRIPE_SECRET_KEY;
const PAYPAL_CLIENT_ID = process.env.ENERGY_TODAY_PAYPAL_CLIENT_ID;
const PAYPAL_SECRET = process.env.ENERGY_TODAY_PAYPAL_SECRET;

const PRICE_USD = 9.99;

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

/**
 * POST /api/payment/stripe/create-checkout
 * Create Stripe checkout session
 */
router.post("/stripe/create-checkout", async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({
        success: false,
        error: "Stripe not configured",
      });
    }

    const { userId, successUrl, cancelUrl } = req.body;

    if (!userId || !successUrl || !cancelUrl) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Energy Today Pro",
              description: "Monthly Pro subscription",
            },
            unit_amount: Math.round(PRICE_USD * 100),
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: userId,
      metadata: {
        userId,
      },
    });

    res.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Payment failed",
    });
  }
});

/**
 * POST /api/payment/paypal/create-subscription
 * Create PayPal subscription
 */
router.post("/paypal/create-subscription", async (req, res) => {
  try {
    if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET) {
      return res.status(500).json({
        success: false,
        error: "PayPal not configured",
      });
    }

    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "Missing userId",
      });
    }

    const accessToken = await getPayPalAccessToken();

    // Create subscription
    const response = await fetch("https://api-m.paypal.com/v1/billing/subscriptions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        plan_id: "P-ENERGY-TODAY-PRO", // You need to create this plan in PayPal dashboard
        custom_id: userId,
        application_context: {
          brand_name: "Energy Today",
          shipping_preference: "NO_SHIPPING",
          user_action: "SUBSCRIBE_NOW",
          return_url: `https://example.com/payment-success?provider=paypal`,
          cancel_url: `https://example.com/upgrade`,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("PayPal error:", error);
      throw new Error("Failed to create subscription");
    }

    const subscription = await response.json();
    const approveLink = subscription.links.find((link: any) => link.rel === "approve");

    res.json({
      success: true,
      subscriptionId: subscription.id,
      approveUrl: approveLink?.href,
    });
  } catch (error) {
    console.error("PayPal subscription error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Payment failed",
    });
  }
});

/**
 * GET /api/payment/verify
 * Verify payment status
 */
router.get("/verify", async (req, res) => {
  try {
    const { provider, paymentId } = req.query;

    if (!provider || !paymentId) {
      return res.status(400).json({
        success: false,
        error: "Missing provider or paymentId",
      });
    }

    if (provider === "stripe") {
      if (!stripe) {
        return res.status(500).json({
          success: false,
          error: "Stripe not configured",
        });
      }

      const session = await stripe.checkout.sessions.retrieve(paymentId as string);
      
      res.json({
        success: true,
        paid: session.payment_status === "paid",
        userId: session.client_reference_id,
      });
    } else if (provider === "paypal") {
      const accessToken = await getPayPalAccessToken();
      
      const response = await fetch(`https://api-m.paypal.com/v1/billing/subscriptions/${paymentId}`, {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to verify PayPal subscription");
      }

      const subscription = await response.json();
      
      res.json({
        success: true,
        paid: subscription.status === "ACTIVE",
        userId: subscription.custom_id,
      });
    } else {
      res.status(400).json({
        success: false,
        error: "Invalid provider",
      });
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Verification failed",
    });
  }
});

export default router;

import { describe, it, expect } from "vitest";
import Stripe from "stripe";

/**
 * Payment API Keys Validation Test
 * 
 * Validates that Stripe and PayPal API keys are correctly configured
 * and can authenticate with their respective APIs.
 */

describe("Payment API Keys Validation", () => {
  it("should have valid Stripe secret key", async () => {
    const stripeKey = process.env.ENERGY_TODAY_STRIPE_SECRET_KEY;
    expect(stripeKey).toBeDefined();
    expect(stripeKey).toMatch(/^sk_live_/);
    
    // Test Stripe API connection
    const stripe = new Stripe(stripeKey!, {
      apiVersion: "2025-12-15.clover",
    });
    
    // List products to verify API key works
    const products = await stripe.products.list({ limit: 1 });
    expect(products).toBeDefined();
  }, 15000);

  it("should have valid PayPal client ID and secret", async () => {
    const clientId = process.env.ENERGY_TODAY_PAYPAL_CLIENT_ID;
    const secret = process.env.ENERGY_TODAY_PAYPAL_SECRET;
    
    expect(clientId).toBeDefined();
    expect(secret).toBeDefined();
    
    // Test PayPal API connection by getting access token
    const auth = Buffer.from(`${clientId}:${secret}`).toString("base64");
    
    const response = await fetch("https://api-m.paypal.com/v1/oauth2/token", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });
    
    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(data.access_token).toBeDefined();
  }, 15000);
});

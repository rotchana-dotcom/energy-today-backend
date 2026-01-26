import { describe, it, expect } from "vitest";
import Stripe from "stripe";
import axios from "axios";

describe("Payment Integration E2E Test", () => {
  it("should create Stripe checkout session with monthly price", async () => {
    const stripeKey = process.env.ENERGY_TODAY_STRIPE_SECRET_KEY;
    const monthlyPriceId = process.env.ENERGY_TODAY_STRIPE_MONTHLY_PRICE_ID;
    
    expect(stripeKey).toBeDefined();
    expect(monthlyPriceId).toBeDefined();
    
    const stripe = new Stripe(stripeKey!, {
      apiVersion: "2025-12-15.clover",
    });
    
    // Create checkout session (same as backend API does)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: monthlyPriceId!,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: "https://example.com/success",
      cancel_url: "https://example.com/cancel",
      client_reference_id: "test-user-123",
    });
    
    expect(session.id).toBeDefined();
    expect(session.url).toBeDefined();
    expect(session.mode).toBe("subscription");
    expect(session.client_reference_id).toBe("test-user-123");
  }, 15000);

  it("should create Stripe checkout session with annual price", async () => {
    const stripeKey = process.env.ENERGY_TODAY_STRIPE_SECRET_KEY;
    const annualPriceId = process.env.ENERGY_TODAY_STRIPE_ANNUAL_PRICE_ID;
    
    expect(stripeKey).toBeDefined();
    expect(annualPriceId).toBeDefined();
    
    const stripe = new Stripe(stripeKey!, {
      apiVersion: "2025-12-15.clover",
    });
    
    // Create checkout session (same as backend API does)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: annualPriceId!,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: "https://example.com/success",
      cancel_url: "https://example.com/cancel",
      client_reference_id: "test-user-123",
    });
    
    expect(session.id).toBeDefined();
    expect(session.url).toBeDefined();
    expect(session.mode).toBe("subscription");
    expect(session.client_reference_id).toBe("test-user-123");
  }, 15000);

  it("should create PayPal subscription with monthly plan", async () => {
    const clientId = process.env.ENERGY_TODAY_PAYPAL_CLIENT_ID;
    const secret = process.env.ENERGY_TODAY_PAYPAL_SECRET;
    const monthlyPlanId = process.env.ENERGY_TODAY_PAYPAL_MONTHLY_PLAN_ID;
    
    expect(clientId).toBeDefined();
    expect(secret).toBeDefined();
    expect(monthlyPlanId).toBeDefined();
    
    // Get access token
    const auth = Buffer.from(`${clientId}:${secret}`).toString("base64");
    const tokenResponse = await axios.post(
      "https://api-m.paypal.com/v1/oauth2/token",
      "grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    const accessToken = tokenResponse.data.access_token;
    
    // Create subscription (same as backend API does)
    const response = await axios.post(
      "https://api-m.paypal.com/v1/billing/subscriptions",
      {
        plan_id: monthlyPlanId,
        custom_id: "test-user-123",
        application_context: {
          brand_name: "Energy Today",
          shipping_preference: "NO_SHIPPING",
          user_action: "SUBSCRIBE_NOW",
          return_url: "https://example.com/success",
          cancel_url: "https://example.com/cancel",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    
    expect(response.data.id).toBeDefined();
    expect(response.data.status).toBe("APPROVAL_PENDING");
    const approveLink = response.data.links.find((link: any) => link.rel === "approve");
    expect(approveLink).toBeDefined();
    expect(approveLink.href).toContain("paypal.com");
  }, 15000);

  it("should create PayPal subscription with annual plan", async () => {
    const clientId = process.env.ENERGY_TODAY_PAYPAL_CLIENT_ID;
    const secret = process.env.ENERGY_TODAY_PAYPAL_SECRET;
    const annualPlanId = process.env.ENERGY_TODAY_PAYPAL_ANNUAL_PLAN_ID;
    
    expect(clientId).toBeDefined();
    expect(secret).toBeDefined();
    expect(annualPlanId).toBeDefined();
    
    // Get access token
    const auth = Buffer.from(`${clientId}:${secret}`).toString("base64");
    const tokenResponse = await axios.post(
      "https://api-m.paypal.com/v1/oauth2/token",
      "grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    const accessToken = tokenResponse.data.access_token;
    
    // Create subscription (same as backend API does)
    const response = await axios.post(
      "https://api-m.paypal.com/v1/billing/subscriptions",
      {
        plan_id: annualPlanId,
        custom_id: "test-user-123",
        application_context: {
          brand_name: "Energy Today",
          shipping_preference: "NO_SHIPPING",
          user_action: "SUBSCRIBE_NOW",
          return_url: "https://example.com/success",
          cancel_url: "https://example.com/cancel",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    
    expect(response.data.id).toBeDefined();
    expect(response.data.status).toBe("APPROVAL_PENDING");
    const approveLink = response.data.links.find((link: any) => link.rel === "approve");
    expect(approveLink).toBeDefined();
    expect(approveLink.href).toContain("paypal.com");
  }, 15000);
});

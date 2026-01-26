import { describe, it, expect } from "vitest";
import Stripe from "stripe";

describe("Stripe Price IDs Validation", () => {
  it("should have valid monthly and annual price IDs", async () => {
    const stripeKey = process.env.ENERGY_TODAY_STRIPE_SECRET_KEY;
    const monthlyPriceId = process.env.ENERGY_TODAY_STRIPE_MONTHLY_PRICE_ID;
    const annualPriceId = process.env.ENERGY_TODAY_STRIPE_ANNUAL_PRICE_ID;
    
    expect(stripeKey).toBeDefined();
    expect(monthlyPriceId).toBeDefined();
    expect(annualPriceId).toBeDefined();
    
    const stripe = new Stripe(stripeKey!, {
      apiVersion: "2025-12-15.clover",
    });
    
    // Verify monthly price
    const monthlyPrice = await stripe.prices.retrieve(monthlyPriceId!);
    expect(monthlyPrice.unit_amount).toBe(999); // $9.99
    expect(monthlyPrice.recurring?.interval).toBe("month");
    
    // Verify annual price
    const annualPrice = await stripe.prices.retrieve(annualPriceId!);
    expect(annualPrice.unit_amount).toBe(9999); // $99.99
    expect(annualPrice.recurring?.interval).toBe("year");
  }, 15000);
});

import { describe, it, expect } from "vitest";
import axios from "axios";

describe("PayPal Plan IDs Validation", () => {
  it("should have valid monthly and annual plan IDs", async () => {
    const clientId = process.env.ENERGY_TODAY_PAYPAL_CLIENT_ID;
    const secret = process.env.ENERGY_TODAY_PAYPAL_SECRET;
    const monthlyPlanId = process.env.ENERGY_TODAY_PAYPAL_MONTHLY_PLAN_ID;
    const annualPlanId = process.env.ENERGY_TODAY_PAYPAL_ANNUAL_PLAN_ID;
    
    expect(clientId).toBeDefined();
    expect(secret).toBeDefined();
    expect(monthlyPlanId).toBeDefined();
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
    
    // Verify monthly plan
    const monthlyPlan = await axios.get(
      `https://api-m.paypal.com/v1/billing/plans/${monthlyPlanId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    expect(monthlyPlan.data.billing_cycles[0].pricing_scheme.fixed_price.value).toBe("9.99");
    expect(monthlyPlan.data.billing_cycles[0].frequency.interval_unit).toBe("MONTH");
    
    // Verify annual plan
    const annualPlan = await axios.get(
      `https://api-m.paypal.com/v1/billing/plans/${annualPlanId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    expect(annualPlan.data.billing_cycles[0].pricing_scheme.fixed_price.value).toBe("99.99");
    expect(annualPlan.data.billing_cycles[0].frequency.interval_unit).toBe("YEAR");
  }, 15000);
});

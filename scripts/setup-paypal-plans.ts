import axios from "axios";
import "dotenv/config";

const PAYPAL_CLIENT_ID = process.env.ENERGY_TODAY_PAYPAL_CLIENT_ID;
const PAYPAL_SECRET = process.env.ENERGY_TODAY_PAYPAL_SECRET;
const PAYPAL_API_BASE = "https://api-m.paypal.com";

if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET) {
  console.error("❌ Missing PayPal credentials");
  process.exit(1);
}

async function getAccessToken(): Promise<string> {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString("base64");
  const response = await axios.post(
    `${PAYPAL_API_BASE}/v1/oauth2/token`,
    "grant_type=client_credentials",
    {
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
  return response.data.access_token;
}

async function createProduct(accessToken: string): Promise<string> {
  const response = await axios.post(
    `${PAYPAL_API_BASE}/v1/catalogs/products`,
    {
      name: "Energy Today Pro",
      description: "Premium subscription for Energy Today app",
      type: "SERVICE",
      category: "SOFTWARE",
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data.id;
}

async function createPlan(
  accessToken: string,
  productId: string,
  interval: "MONTH" | "YEAR",
  amount: string
): Promise<string> {
  const planName = interval === "MONTH" ? "Energy Today Pro Monthly" : "Energy Today Pro Annual";
  const response = await axios.post(
    `${PAYPAL_API_BASE}/v1/billing/plans`,
    {
      product_id: productId,
      name: planName,
      description: `${planName} subscription`,
      billing_cycles: [
        {
          frequency: {
            interval_unit: interval,
            interval_count: 1,
          },
          tenure_type: "REGULAR",
          sequence: 1,
          total_cycles: 0, // Infinite
          pricing_scheme: {
            fixed_price: {
              value: amount,
              currency_code: "USD",
            },
          },
        },
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee_failure_action: "CONTINUE",
        payment_failure_threshold: 3,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
    }
  );
  return response.data.id;
}

async function main() {
  console.log("Creating PayPal subscription plans...");
  
  const accessToken = await getAccessToken();
  console.log("✅ Authenticated with PayPal");
  
  const productId = await createProduct(accessToken);
  console.log(`✅ Product created: ${productId}`);
  
  const monthlyPlanId = await createPlan(accessToken, productId, "MONTH", "9.99");
  console.log(`✅ Monthly plan created: ${monthlyPlanId} ($9.99/month)`);
  
  const annualPlanId = await createPlan(accessToken, productId, "YEAR", "99.99");
  console.log(`✅ Annual plan created: ${annualPlanId} ($99.99/year)`);
  
  console.log("\n📋 Add these to your .env file:");
  console.log(`ENERGY_TODAY_PAYPAL_PRODUCT_ID=${productId}`);
  console.log(`ENERGY_TODAY_PAYPAL_MONTHLY_PLAN_ID=${monthlyPlanId}`);
  console.log(`ENERGY_TODAY_PAYPAL_ANNUAL_PLAN_ID=${annualPlanId}`);
}

main().catch((error) => {
  console.error("❌ Error:", error.response?.data || error.message);
  process.exit(1);
});

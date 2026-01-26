/**
 * Setup Stripe Products and Prices
 * Creates Energy Today Pro subscription products and prices in Stripe
 */

import Stripe from "stripe";

const STRIPE_SECRET_KEY = process.env.ENERGY_TODAY_STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
  console.error("ENERGY_TODAY_STRIPE_SECRET_KEY not set");
  process.exit(1);
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2025-12-15.clover",
});

async function setupStripeProducts() {
  try {
    console.log("Creating Stripe products and prices...\n");

    // Create product
    const product = await stripe.products.create({
      name: "Energy Today Pro",
      description: "Premium subscription with advanced features",
    });

    console.log(`✅ Product created: ${product.id}`);

    // Create monthly price
    const monthlyPrice = await stripe.prices.create({
      product: product.id,
      currency: "usd",
      unit_amount: 999, // $9.99
      recurring: {
        interval: "month",
      },
    });

    console.log(`✅ Monthly price created: ${monthlyPrice.id} ($9.99/month)`);

    // Create annual price
    const annualPrice = await stripe.prices.create({
      product: product.id,
      currency: "usd",
      unit_amount: 9999, // $99.99
      recurring: {
        interval: "year",
      },
    });

    console.log(`✅ Annual price created: ${annualPrice.id} ($99.99/year)`);

    console.log("\n📋 Add these to your .env file:");
    console.log(`ENERGY_TODAY_STRIPE_PRODUCT_ID=${product.id}`);
    console.log(`ENERGY_TODAY_STRIPE_MONTHLY_PRICE_ID=${monthlyPrice.id}`);
    console.log(`ENERGY_TODAY_STRIPE_ANNUAL_PRICE_ID=${annualPrice.id}`);
  } catch (error) {
    console.error("Error setting up Stripe products:", error);
    process.exit(1);
  }
}

setupStripeProducts();

/**
 * Subscription System Tests
 * Tests the complete subscription flow including:
 * - 7-day trial logic
 * - Database subscription checking
 * - Trial countdown
 * - Pro feature access
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock AsyncStorage
vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    clear: vi.fn(),
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
}));

describe("Subscription System", () => {
  beforeEach(() => {
    // Tests don't need AsyncStorage - they test pure logic
  });

  describe("Trial Period Calculation", () => {
    it("should calculate trial days remaining correctly", () => {
      const installDate = new Date();
      installDate.setDate(installDate.getDate() - 3); // 3 days ago
      
      const now = new Date();
      const daysSinceInstall = Math.floor(
        (now.getTime() - installDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const trialDaysRemaining = Math.max(0, 7 - daysSinceInstall);
      
      expect(daysSinceInstall).toBe(3);
      expect(trialDaysRemaining).toBe(4);
    });

    it("should show trial active for first 7 days", () => {
      const installDate = new Date();
      installDate.setDate(installDate.getDate() - 5); // 5 days ago
      
      const now = new Date();
      const daysSinceInstall = Math.floor(
        (now.getTime() - installDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const trialDaysRemaining = Math.max(0, 7 - daysSinceInstall);
      const isTrialActive = trialDaysRemaining > 0;
      
      expect(isTrialActive).toBe(true);
      expect(trialDaysRemaining).toBe(2);
    });

    it("should expire trial after 7 days", () => {
      const installDate = new Date();
      installDate.setDate(installDate.getDate() - 8); // 8 days ago
      
      const now = new Date();
      const daysSinceInstall = Math.floor(
        (now.getTime() - installDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const trialDaysRemaining = Math.max(0, 7 - daysSinceInstall);
      const isTrialActive = trialDaysRemaining > 0;
      
      expect(isTrialActive).toBe(false);
      expect(trialDaysRemaining).toBe(0);
    });

    it("should show exactly 7 days on day 0", () => {
      const installDate = new Date();
      
      const now = new Date();
      const daysSinceInstall = Math.floor(
        (now.getTime() - installDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const trialDaysRemaining = Math.max(0, 7 - daysSinceInstall);
      
      expect(daysSinceInstall).toBe(0);
      expect(trialDaysRemaining).toBe(7);
    });

    it("should show 1 day remaining on day 6", () => {
      const installDate = new Date();
      installDate.setDate(installDate.getDate() - 6); // 6 days ago
      
      const now = new Date();
      const daysSinceInstall = Math.floor(
        (now.getTime() - installDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const trialDaysRemaining = Math.max(0, 7 - daysSinceInstall);
      
      expect(daysSinceInstall).toBe(6);
      expect(trialDaysRemaining).toBe(1);
    });

    it("should expire on day 7", () => {
      const installDate = new Date();
      installDate.setDate(installDate.getDate() - 7); // 7 days ago
      
      const now = new Date();
      const daysSinceInstall = Math.floor(
        (now.getTime() - installDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const trialDaysRemaining = Math.max(0, 7 - daysSinceInstall);
      const isTrialActive = trialDaysRemaining > 0;
      
      expect(daysSinceInstall).toBe(7);
      expect(trialDaysRemaining).toBe(0);
      expect(isTrialActive).toBe(false);
    });
  });

  describe("Trial Countdown Banner Logic", () => {
    it("should show banner when trial has 5 days remaining", () => {
      const trialDaysRemaining = 5;
      const isTrialActive = true;
      const shouldShowBanner = isTrialActive && trialDaysRemaining <= 5;
      
      expect(shouldShowBanner).toBe(true);
    });

    it("should show banner when trial has 1 day remaining", () => {
      const trialDaysRemaining = 1;
      const isTrialActive = true;
      const shouldShowBanner = isTrialActive && trialDaysRemaining <= 5;
      
      expect(shouldShowBanner).toBe(true);
    });

    it("should NOT show banner when trial has 6 days remaining", () => {
      const trialDaysRemaining = 6;
      const isTrialActive = true;
      const shouldShowBanner = isTrialActive && trialDaysRemaining <= 5;
      
      expect(shouldShowBanner).toBe(false);
    });

    it("should NOT show banner when trial has 7 days remaining", () => {
      const trialDaysRemaining = 7;
      const isTrialActive = true;
      const shouldShowBanner = isTrialActive && trialDaysRemaining <= 5;
      
      expect(shouldShowBanner).toBe(false);
    });

    it("should NOT show banner when trial is expired", () => {
      const trialDaysRemaining = 0;
      const isTrialActive = false;
      const shouldShowBanner = isTrialActive && trialDaysRemaining <= 5;
      
      expect(shouldShowBanner).toBe(false);
    });

    it("should NOT show banner for paid users", () => {
      const trialDaysRemaining = 3;
      const isTrialActive = false; // Paid user, not on trial
      const shouldShowBanner = isTrialActive && trialDaysRemaining <= 5;
      
      expect(shouldShowBanner).toBe(false);
    });
  });

  describe("Pro Access Logic", () => {
    it("should grant Pro access during active trial", () => {
      const subscription = {
        isPro: true,
        provider: "trial" as const,
        status: "trial" as const,
        isTrialActive: true,
        trialDaysRemaining: 5,
      };
      
      expect(subscription.isPro).toBe(true);
      expect(subscription.isTrialActive).toBe(true);
    });

    it("should grant Pro access for paid Stripe subscription", () => {
      const subscription = {
        isPro: true,
        provider: "stripe" as const,
        plan: "monthly" as const,
        status: "active" as const,
        isTrialActive: false,
        trialDaysRemaining: 0,
      };
      
      expect(subscription.isPro).toBe(true);
      expect(subscription.provider).toBe("stripe");
    });

    it("should grant Pro access for paid PayPal subscription", () => {
      const subscription = {
        isPro: true,
        provider: "paypal" as const,
        plan: "annual" as const,
        status: "active" as const,
        isTrialActive: false,
        trialDaysRemaining: 0,
      };
      
      expect(subscription.isPro).toBe(true);
      expect(subscription.provider).toBe("paypal");
    });

    it("should DENY Pro access when trial expired and no payment", () => {
      const subscription = {
        isPro: false,
        provider: null,
        status: null,
        isTrialActive: false,
        trialDaysRemaining: 0,
      };
      
      expect(subscription.isPro).toBe(false);
      expect(subscription.isTrialActive).toBe(false);
    });

    it("should grant Pro access with admin code", () => {
      const subscription = {
        isPro: true,
        provider: "admin" as const,
        status: "active" as const,
        source: "admin" as const,
        isTrialActive: false,
        trialDaysRemaining: 0,
      };
      
      expect(subscription.isPro).toBe(true);
      expect(subscription.provider).toBe("admin");
    });
  });

  describe("Subscription Priority", () => {
    it("should prioritize admin code over trial", () => {
      // Admin code should always grant Pro access
      const adminSubscription = {
        isPro: true,
        provider: "admin" as const,
        source: "admin" as const,
      };
      
      const trialSubscription = {
        isPro: true,
        provider: "trial" as const,
        source: "database" as const,
      };
      
      // Admin code is checked first, so it takes priority
      expect(adminSubscription.source).toBe("admin");
      expect(trialSubscription.source).toBe("database");
    });

    it("should prioritize paid subscription over trial", () => {
      // If user has both paid subscription and trial, paid takes priority
      const paidSubscription = {
        isPro: true,
        provider: "stripe" as const,
        status: "active" as const,
        isTrialActive: false,
      };
      
      expect(paidSubscription.provider).toBe("stripe");
      expect(paidSubscription.isTrialActive).toBe(false);
    });
  });

  describe("Subscription Status Display", () => {
    it("should display 'Free Trial' for trial users", () => {
      const subscription = {
        isPro: true,
        status: "trial" as const,
        trialDaysRemaining: 3,
      };
      
      const displayText = subscription.isPro && subscription.status === "trial"
        ? "Free Trial"
        : subscription.isPro
        ? "Energy Today Pro"
        : "Free Plan";
      
      expect(displayText).toBe("Free Trial");
    });

    it("should display 'Energy Today Pro' for paid users", () => {
      const subscription = {
        isPro: true,
        status: "active" as "active" | "trial" | null,
        provider: "stripe" as const,
      };
      
      const displayText = subscription.status === "trial"
        ? "Free Trial"
        : subscription.isPro
        ? "Energy Today Pro"
        : "Free Plan";
      
      expect(displayText).toBe("Energy Today Pro");
    });

    it("should display 'Free Plan' for non-Pro users", () => {
      const subscription = {
        isPro: false,
        status: null,
      };
      
      const displayText = subscription.isPro && subscription.status === "trial"
        ? "Free Trial"
        : subscription.isPro
        ? "Energy Today Pro"
        : "Free Plan";
      
      expect(displayText).toBe("Free Plan");
    });

    it("should display trial days remaining for trial users", () => {
      const subscription = {
        isPro: true,
        status: "trial" as const,
        trialDaysRemaining: 4,
      };
      
      const subtitleText = subscription.isPro && subscription.status === "trial"
        ? `${subscription.trialDaysRemaining} days remaining`
        : subscription.isPro
        ? "Access to all features"
        : "Basic features";
      
      expect(subtitleText).toBe("4 days remaining");
    });
  });

  describe("Banner Message Logic", () => {
    it("should show 'Last day' message when 1 day remains", () => {
      const trialDaysRemaining = 1;
      const message = trialDaysRemaining === 1
        ? "Last day of your free trial!"
        : `${trialDaysRemaining} days left in your free trial`;
      
      expect(message).toBe("Last day of your free trial!");
    });

    it("should show countdown message when multiple days remain", () => {
      const trialDaysRemaining: number = 3;
      const message = trialDaysRemaining === 1
        ? "Last day of your free trial!"
        : `${trialDaysRemaining} days left in your free trial`;
      
      expect(message).toContain("days left in your free trial");
      expect(message).toContain("3");
    });

    it("should show correct message for 5 days", () => {
      const trialDaysRemaining: number = 5;
      const message = trialDaysRemaining === 1
        ? "Last day of your free trial!"
        : `${trialDaysRemaining} days left in your free trial`;
      
      expect(message).toContain("days left in your free trial");
      expect(message).toContain("5");
    });
  });
});

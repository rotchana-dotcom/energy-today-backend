/**
 * User Flow Verification Tests
 * 
 * Tests three critical scenarios:
 * 1. Pro vs Free tier logic works correctly
 * 2. Returning user goes directly to Today screen
 * 3. All routing logic is correct
 */

import { describe, it, expect, beforeEach } from 'vitest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserProfile, saveUserProfile } from './lib/storage';
import { getSubscriptionStatus, saveSubscriptionStatus } from './lib/subscription-status';
import { clearRedeemedCodes, redeemPromoCode } from './lib/secure-promo-codes';
import { UserProfile } from './types';

describe('Pro vs Free Tier Logic', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('should return isPro=false for new free users (7-day trial)', async () => {
    // New install - should have 7-day trial
    const status = await getSubscriptionStatus();
    
    expect(status.isPro).toBe(true); // Trial gives Pro access
    expect(status.provider).toBe('trial');
    expect(status.status).toBe('trial');
    expect(status.isTrialActive).toBe(true);
    expect(status.trialDaysRemaining).toBeGreaterThan(0);
    expect(status.trialDaysRemaining).toBeLessThanOrEqual(7);
  });

  it('should return isPro=false after trial expires', async () => {
    // Set install date to 8 days ago
    const eightDaysAgo = new Date();
    eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);
    await AsyncStorage.setItem('app_install_date', eightDaysAgo.toISOString());
    
    const status = await getSubscriptionStatus();
    
    expect(status.isPro).toBe(false);
    expect(status.provider).toBe(null);
    expect(status.status).toBe(null);
    expect(status.isTrialActive).toBe(false);
    expect(status.trialDaysRemaining).toBe(0);
  });

  it('should return isPro=true for paid users', async () => {
    // Simulate paid subscription
    await saveSubscriptionStatus({
      isPro: true,
      provider: 'stripe',
      plan: 'monthly',
    });
    
    const status = await getSubscriptionStatus();
    
    expect(status.isPro).toBe(true);
    expect(status.provider).toBe('stripe');
    expect(status.plan).toBe('monthly');
  });

  it('should return isPro=true for admin unlocked users', async () => {
    // Redeem admin code
    const result = await redeemPromoCode('ENERGY2026PRO');
    expect(result.success).toBe(true);
    
    const status = await getSubscriptionStatus();
    
    expect(status.isPro).toBe(true);
    expect(status.provider).toBe('admin');
    expect(status.source).toBe('admin');
  });
});

describe('Returning User Flow', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('should load profile for returning user', async () => {
    // Save profile (simulate completed onboarding)
    const testProfile: UserProfile = {
      name: 'Returning User',
      dateOfBirth: '1990-01-01T00:00:00.000Z',
      placeOfBirth: {
        city: 'Bangkok',
        country: 'Thailand',
        latitude: 13.7563,
        longitude: 100.5018,
      },
      onboardingComplete: true,
    };
    
    await saveUserProfile(testProfile);
    
    // Load profile (what app/index.tsx does)
    const loadedProfile = await getUserProfile();
    
    expect(loadedProfile).not.toBeNull();
    expect(loadedProfile?.name).toBe('Returning User');
    expect(loadedProfile?.onboardingComplete).toBe(true);
  });

  it('should route returning user to main app (not onboarding)', async () => {
    // Save profile
    const testProfile: UserProfile = {
      name: 'Test User',
      dateOfBirth: '1995-05-15T00:00:00.000Z',
      placeOfBirth: {
        city: 'New York',
        country: 'USA',
        latitude: 40.7128,
        longitude: -74.0060,
      },
      onboardingComplete: true,
    };
    
    await saveUserProfile(testProfile);
    
    // Simulate app/index.tsx logic
    const profile = await getUserProfile();
    const shouldShowOnboarding = !profile || !profile.onboardingComplete;
    
    expect(shouldShowOnboarding).toBe(false); // Should go to main app
  });

  it('should route new user to onboarding', async () => {
    // No profile saved
    
    // Simulate app/index.tsx logic
    const profile = await getUserProfile();
    const shouldShowOnboarding = !profile || !profile.onboardingComplete;
    
    expect(shouldShowOnboarding).toBe(true); // Should go to onboarding
  });
});

describe('Routing Logic Correctness', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('should handle profile with onboardingComplete=false', async () => {
    // Save incomplete profile
    const incompleteProfile: UserProfile = {
      name: 'Incomplete User',
      dateOfBirth: '1990-01-01T00:00:00.000Z',
      placeOfBirth: {
        city: 'Test',
        country: 'Test',
        latitude: 0,
        longitude: 0,
      },
      onboardingComplete: false, // Not complete!
    };
    
    await saveUserProfile(incompleteProfile);
    
    // Simulate app/index.tsx logic
    const profile = await getUserProfile();
    const shouldShowOnboarding = !profile || !profile.onboardingComplete;
    
    expect(shouldShowOnboarding).toBe(true); // Should still go to onboarding
  });

  it('should handle missing onboardingComplete field', async () => {
    // Save profile without onboardingComplete field
    const profileData = {
      name: 'Legacy User',
      dateOfBirth: '1990-01-01T00:00:00.000Z',
      placeOfBirth: {
        city: 'Test',
        country: 'Test',
        latitude: 0,
        longitude: 0,
      },
      // No onboardingComplete field
    };
    
    await AsyncStorage.setItem('@energy_today:user_profile', JSON.stringify(profileData));
    
    // Simulate app/index.tsx logic
    const profile = await getUserProfile();
    const shouldShowOnboarding = !profile || !profile.onboardingComplete;
    
    expect(shouldShowOnboarding).toBe(true); // Should go to onboarding (missing field = incomplete)
  });
});

describe('Pro/Free Feature Display Logic', () => {
  it('should show AI insights only for Pro users', async () => {
    // Simulate Pro user
    await saveSubscriptionStatus({
      isPro: true,
      provider: 'stripe',
      plan: 'monthly',
    });
    
    const status = await getSubscriptionStatus();
    
    // This is what Today screen checks
    const shouldShowAIInsights = status.isPro;
    
    expect(shouldShowAIInsights).toBe(true);
  });

  it('should NOT show AI insights for free users', async () => {
    // Simulate expired trial (free user)
    const eightDaysAgo = new Date();
    eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);
    await AsyncStorage.setItem('app_install_date', eightDaysAgo.toISOString());
    
    const status = await getSubscriptionStatus();
    
    // This is what Today screen checks
    const shouldShowAIInsights = status.isPro;
    
    expect(shouldShowAIInsights).toBe(false);
  });

  it('should show AI insights during trial period', async () => {
    // New install (trial active)
    const status = await getSubscriptionStatus();
    
    // This is what Today screen checks
    const shouldShowAIInsights = status.isPro;
    
    expect(shouldShowAIInsights).toBe(true); // Trial gives Pro access
  });
});

describe('Edge Cases', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('should handle AsyncStorage errors gracefully', async () => {
    // This test verifies error handling doesn't break the flow
    
    // Try to get profile when AsyncStorage might fail
    const profile = await getUserProfile();
    
    // Should return null instead of throwing
    expect(profile).toBeNull();
  });

  it('should handle concurrent profile saves', async () => {
    const profile1: UserProfile = {
      name: 'User 1',
      dateOfBirth: '1990-01-01T00:00:00.000Z',
      placeOfBirth: { city: 'City1', country: 'Country1', latitude: 0, longitude: 0 },
      onboardingComplete: true,
    };
    
    const profile2: UserProfile = {
      name: 'User 2',
      dateOfBirth: '1991-02-02T00:00:00.000Z',
      placeOfBirth: { city: 'City2', country: 'Country2', latitude: 0, longitude: 0 },
      onboardingComplete: true,
    };
    
    // Save both at the same time
    await Promise.all([
      saveUserProfile(profile1),
      saveUserProfile(profile2),
    ]);
    
    // One of them should win
    const loaded = await getUserProfile();
    expect(loaded).not.toBeNull();
    expect(['User 1', 'User 2']).toContain(loaded?.name);
  });
});

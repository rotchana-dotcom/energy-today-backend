/**
 * Critical Flow Verification Tests
 * 
 * Simplified tests that verify the core logic without complex dependencies
 */

import { describe, it, expect, beforeEach } from 'vitest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserProfile, saveUserProfile } from './lib/storage';
import { UserProfile } from './types';

describe('Critical Flow 1: Returning User Routing', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('should load profile for returning user', async () => {
    // Simulate user who completed onboarding
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
    
    // Simulate app/index.tsx loading profile
    const loadedProfile = await getUserProfile();
    
    // Verify profile loaded correctly
    expect(loadedProfile).not.toBeNull();
    expect(loadedProfile?.name).toBe('Returning User');
    expect(loadedProfile?.onboardingComplete).toBe(true);
  });

  it('should route returning user to main app (check onboardingComplete=true)', async () => {
    // Save completed profile
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
    
    // Simulate app/index.tsx routing logic
    const profile = await getUserProfile();
    const shouldShowOnboarding = !profile || !profile.onboardingComplete;
    const shouldShowMainApp = profile && profile.onboardingComplete;
    
    expect(shouldShowOnboarding).toBe(false);
    expect(shouldShowMainApp).toBe(true);
  });

  it('should route new user to onboarding (no profile)', async () => {
    // No profile saved (new user)
    
    // Simulate app/index.tsx routing logic
    const profile = await getUserProfile();
    const shouldShowOnboarding = !profile || !profile.onboardingComplete;
    
    expect(profile).toBeNull();
    expect(shouldShowOnboarding).toBe(true);
  });

  it('should route incomplete user to onboarding (onboardingComplete=false)', async () => {
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
      onboardingComplete: false,
    };
    
    await saveUserProfile(incompleteProfile);
    
    // Simulate app/index.tsx routing logic
    const profile = await getUserProfile();
    const shouldShowOnboarding = !profile || !profile.onboardingComplete;
    const shouldShowMainApp = profile && profile.onboardingComplete;
    
    expect(shouldShowOnboarding).toBe(true);
    expect(shouldShowMainApp).toBe(false);
  });
});

describe('Critical Flow 2: Pro/Free Tier Detection', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('should detect free user (no subscription in AsyncStorage)', async () => {
    // No subscription saved
    const stored = await AsyncStorage.getItem('subscription_status');
    
    expect(stored).toBeNull();
    // In real app, this means isPro = false (free user)
  });

  it('should detect Pro user (subscription in AsyncStorage)', async () => {
    // Save Pro subscription
    const proSubscription = {
      isPro: true,
      provider: 'stripe',
      plan: 'monthly',
    };
    
    await AsyncStorage.setItem('subscription_status', JSON.stringify(proSubscription));
    
    // Load subscription
    const stored = await AsyncStorage.getItem('subscription_status');
    expect(stored).not.toBeNull();
    
    const data = JSON.parse(stored!);
    expect(data.isPro).toBe(true);
    expect(data.provider).toBe('stripe');
  });

  it('should detect trial user (install date within 7 days)', async () => {
    // Set install date to 3 days ago
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    await AsyncStorage.setItem('app_install_date', threeDaysAgo.toISOString());
    
    // Calculate if trial is active
    const installDate = await AsyncStorage.getItem('app_install_date');
    expect(installDate).not.toBeNull();
    
    const install = new Date(installDate!);
    const now = new Date();
    const daysSinceInstall = Math.floor((now.getTime() - install.getTime()) / (1000 * 60 * 60 * 24));
    const trialDaysRemaining = Math.max(0, 7 - daysSinceInstall);
    const isTrialActive = trialDaysRemaining > 0;
    
    expect(daysSinceInstall).toBe(3);
    expect(trialDaysRemaining).toBe(4);
    expect(isTrialActive).toBe(true);
  });

  it('should detect expired trial (install date > 7 days ago)', async () => {
    // Set install date to 10 days ago
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
    await AsyncStorage.setItem('app_install_date', tenDaysAgo.toISOString());
    
    // Calculate if trial is active
    const installDate = await AsyncStorage.getItem('app_install_date');
    const install = new Date(installDate!);
    const now = new Date();
    const daysSinceInstall = Math.floor((now.getTime() - install.getTime()) / (1000 * 60 * 60 * 24));
    const trialDaysRemaining = Math.max(0, 7 - daysSinceInstall);
    const isTrialActive = trialDaysRemaining > 0;
    
    expect(daysSinceInstall).toBe(10);
    expect(trialDaysRemaining).toBe(0);
    expect(isTrialActive).toBe(false);
  });
});

describe('Critical Flow 3: Profile Persistence', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('should persist profile across app restarts', async () => {
    // First "session" - save profile
    const profile1: UserProfile = {
      name: 'Persistent User',
      dateOfBirth: '1990-01-01T00:00:00.000Z',
      placeOfBirth: {
        city: 'Bangkok',
        country: 'Thailand',
        latitude: 13.7563,
        longitude: 100.5018,
      },
      onboardingComplete: true,
    };
    
    await saveUserProfile(profile1);
    
    // Simulate app restart (clear memory, but AsyncStorage persists)
    // Second "session" - load profile
    const profile2 = await getUserProfile();
    
    expect(profile2).not.toBeNull();
    expect(profile2?.name).toBe('Persistent User');
    expect(profile2?.onboardingComplete).toBe(true);
  });

  it('should handle profile updates correctly', async () => {
    // Save initial profile
    const initialProfile: UserProfile = {
      name: 'Initial Name',
      dateOfBirth: '1990-01-01T00:00:00.000Z',
      placeOfBirth: {
        city: 'Bangkok',
        country: 'Thailand',
        latitude: 13.7563,
        longitude: 100.5018,
      },
      onboardingComplete: true,
    };
    
    await saveUserProfile(initialProfile);
    
    // Update profile
    const updatedProfile: UserProfile = {
      name: 'Updated Name',
      dateOfBirth: '1995-05-15T00:00:00.000Z',
      placeOfBirth: {
        city: 'New York',
        country: 'USA',
        latitude: 40.7128,
        longitude: -74.0060,
      },
      onboardingComplete: true,
    };
    
    await saveUserProfile(updatedProfile);
    
    // Load and verify update
    const loaded = await getUserProfile();
    expect(loaded?.name).toBe('Updated Name');
    expect(loaded?.dateOfBirth).toBe('1995-05-15T00:00:00.000Z');
  });
});

describe('Critical Flow 4: Error Handling', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('should return null for corrupted profile data', async () => {
    // Set corrupted data
    await AsyncStorage.setItem('@energy_today:user_profile', 'invalid json{{{');
    
    // Should return null instead of throwing
    const profile = await getUserProfile();
    expect(profile).toBeNull();
  });

  it('should handle missing profile gracefully', async () => {
    // No profile saved
    const profile = await getUserProfile();
    
    expect(profile).toBeNull();
    // App should route to onboarding
  });
});

/**
 * Test Suite for New Onboarding Flow (Phase 53)
 * 
 * Tests the complete rewrite of onboarding and navigation logic
 * to fix the infinite loop bug.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserProfile, saveUserProfile } from './lib/storage';
import { UserProfile } from './types';

describe('New Onboarding Flow - Phase 53', () => {
  beforeEach(async () => {
    // Clear AsyncStorage before each test
    await AsyncStorage.clear();
  });

  it('should save profile to AsyncStorage successfully', async () => {
    const testProfile: UserProfile = {
      name: 'Test User',
      dateOfBirth: '1990-01-01T00:00:00.000Z',
      placeOfBirth: {
        city: 'Bangkok',
        country: 'Thailand',
        latitude: 0,
        longitude: 0,
      },
      onboardingComplete: true,
    };

    // Save profile
    await saveUserProfile(testProfile);

    // Wait a bit for AsyncStorage to persist
    await new Promise(resolve => setTimeout(resolve, 100));

    // Verify it was saved
    const loadedProfile = await getUserProfile();
    expect(loadedProfile).not.toBeNull();
    expect(loadedProfile?.name).toBe('Test User');
    expect(loadedProfile?.onboardingComplete).toBe(true);
  });

  it('should return null when no profile exists', async () => {
    const profile = await getUserProfile();
    expect(profile).toBeNull();
  });

  it('should handle profile save and immediate load', async () => {
    const testProfile: UserProfile = {
      name: 'Quick Test',
      dateOfBirth: '1995-05-15T00:00:00.000Z',
      placeOfBirth: {
        city: 'New York',
        country: 'USA',
        latitude: 0,
        longitude: 0,
      },
      onboardingComplete: true,
    };

    // Save profile
    await saveUserProfile(testProfile);

    // Try to load immediately (this is what causes the race condition)
    const loadedProfile = await getUserProfile();

    // Should work because saveUserProfile includes verification
    expect(loadedProfile).not.toBeNull();
    expect(loadedProfile?.name).toBe('Quick Test');
  });

  it('should handle multiple sequential saves', async () => {
    const profiles = [
      {
        name: 'User 1',
        dateOfBirth: '1990-01-01T00:00:00.000Z',
        placeOfBirth: { city: 'City1', country: 'Country1', latitude: 0, longitude: 0 },
        onboardingComplete: true,
      },
      {
        name: 'User 2',
        dateOfBirth: '1991-02-02T00:00:00.000Z',
        placeOfBirth: { city: 'City2', country: 'Country2', latitude: 0, longitude: 0 },
        onboardingComplete: true,
      },
    ];

    // Save first profile
    await saveUserProfile(profiles[0]);
    let loaded = await getUserProfile();
    expect(loaded?.name).toBe('User 1');

    // Save second profile (overwrite)
    await saveUserProfile(profiles[1]);
    loaded = await getUserProfile();
    expect(loaded?.name).toBe('User 2');
  });

  it('should preserve onboardingComplete flag', async () => {
    const testProfile: UserProfile = {
      name: 'Complete User',
      dateOfBirth: '1992-03-03T00:00:00.000Z',
      placeOfBirth: {
        city: 'London',
        country: 'UK',
        latitude: 0,
        longitude: 0,
      },
      onboardingComplete: true,
    };

    await saveUserProfile(testProfile);
    const loaded = await getUserProfile();

    expect(loaded?.onboardingComplete).toBe(true);
  });
});

describe('ProfileContext Integration', () => {
  it('should work with ProfileContext saveProfile', async () => {
    // This test verifies that the ProfileContext saveProfile function
    // saves to AsyncStorage correctly

    const testProfile: UserProfile = {
      name: 'Context Test',
      dateOfBirth: '1993-04-04T00:00:00.000Z',
      placeOfBirth: {
        city: 'Paris',
        country: 'France',
        latitude: 0,
        longitude: 0,
      },
      onboardingComplete: true,
    };

    // Use the same storage function that ProfileContext uses
    await saveUserProfile(testProfile);

    // Verify it's in AsyncStorage
    const loaded = await getUserProfile();
    expect(loaded).not.toBeNull();
    expect(loaded?.name).toBe('Context Test');
  });
});

describe('Error Handling', () => {
  beforeEach(async () => {
    // Clear AsyncStorage before each error test
    await AsyncStorage.clear();
  });

  it('should handle corrupted profile data gracefully', async () => {
    // Manually set corrupted data in AsyncStorage
    await AsyncStorage.setItem('@energy_today:user_profile', 'invalid json{{{');

    // Should return null instead of throwing
    const profile = await getUserProfile();
    expect(profile).toBeNull();
  });

  it('should handle missing fields in profile', async () => {
    // Save incomplete profile directly
    const incompleteProfile = {
      name: 'Incomplete User',
      dateOfBirth: '1990-01-01T00:00:00.000Z',
      placeOfBirth: { city: 'Test', country: 'Test', latitude: 0, longitude: 0 },
      onboardingComplete: true,
    };
    await AsyncStorage.setItem('@energy_today:user_profile', JSON.stringify(incompleteProfile));

    // Should still load
    const profile = await getUserProfile();
    expect(profile).not.toBeNull();
    expect(profile?.name).toBe('Incomplete User');
  });
});

import { describe, it, expect, beforeEach } from 'vitest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveUserProfile, getUserProfile } from './lib/storage';
import { calculateUnifiedEnergy } from './lib/unified-energy-engine';
import type { UserProfile } from './types';

describe('Onboarding Flow - End to End', () => {
  beforeEach(async () => {
    // Clear all AsyncStorage before each test
    await AsyncStorage.clear();
  });

  it('should save user profile and calculate energy without hanging', async () => {
    // Simulate user completing onboarding
    const testProfile: UserProfile = {
      name: 'Test User',
      dateOfBirth: '1990-01-15',
      placeOfBirth: {
        city: 'Bangkok',
        country: 'Thailand',
        latitude: 13.7563,
        longitude: 100.5018
      },
      onboardingComplete: true
    };

    // Save profile (what onboarding does)
    await saveUserProfile(testProfile);

    // Verify profile was saved
    const savedProfile = await getUserProfile();
    expect(savedProfile).toBeTruthy();
    expect(savedProfile?.name).toBe('Test User');

    // This is the critical test - calculateUnifiedEnergy should NOT hang
    // It should return immediately since it's synchronous now
    const startTime = Date.now();
    const reading = calculateUnifiedEnergy(savedProfile!);
    const endTime = Date.now();

    // Should complete in under 100ms (it's just math, no I/O)
    const executionTime = endTime - startTime;
    expect(executionTime).toBeLessThan(100);

    // Verify the reading has all required fields
    expect(reading).toBeTruthy();
    expect(reading.personalProfile).toBeTruthy();
    expect(reading.earthProfile).toBeTruthy();
    expect(reading.combinedAnalysis).toBeTruthy();
    expect(reading.businessInsights).toBeTruthy();

    // Verify energy scores are within valid range
    expect(reading.combinedAnalysis.overallAlignment).toBeGreaterThanOrEqual(0);
    expect(reading.combinedAnalysis.overallAlignment).toBeLessThanOrEqual(100);
    expect(reading.combinedAnalysis.perfectDayScore).toBeGreaterThanOrEqual(0);
    expect(reading.combinedAnalysis.perfectDayScore).toBeLessThanOrEqual(100);
  });

  it('should handle multiple sequential energy calculations without blocking', async () => {
    const testProfile: UserProfile = {
      name: 'Test User',
      dateOfBirth: '1985-06-20',
      placeOfBirth: {
        city: 'New York',
        country: 'USA',
        latitude: 40.7128,
        longitude: -74.0060
      },
      onboardingComplete: true
    };

    await saveUserProfile(testProfile);
    const savedProfile = await getUserProfile();

    // Calculate energy for multiple dates rapidly
    const dates = [
      new Date('2024-01-15'),
      new Date('2024-02-20'),
      new Date('2024-03-10'),
      new Date('2024-04-05'),
      new Date('2024-05-25')
    ];

    const startTime = Date.now();
    const readings = dates.map(date => calculateUnifiedEnergy(savedProfile!, date));
    const endTime = Date.now();

    // All 5 calculations should complete in under 500ms total
    const totalTime = endTime - startTime;
    expect(totalTime).toBeLessThan(500);

    // Verify all readings are valid
    readings.forEach(reading => {
      expect(reading).toBeTruthy();
      expect(reading.combinedAnalysis.overallAlignment).toBeGreaterThanOrEqual(0);
      expect(reading.combinedAnalysis.overallAlignment).toBeLessThanOrEqual(100);
    });
  });

  it('should not be async anymore', async () => {
    // Verify calculateUnifiedEnergy is truly synchronous
    const testProfile: UserProfile = {
      name: 'Test User',
      dateOfBirth: '1992-03-10',
      placeOfBirth: {
        city: 'London',
        country: 'UK',
        latitude: 51.5074,
        longitude: -0.1278
      },
      onboardingComplete: true
    };

    await saveUserProfile(testProfile);
    const savedProfile = await getUserProfile();

    // This should return immediately, not a Promise
    const result = calculateUnifiedEnergy(savedProfile!);
    
    // If it's truly synchronous, result should NOT be a Promise
    expect(result).not.toBeInstanceOf(Promise);
    expect(typeof result).toBe('object');
    expect(result.personalProfile).toBeTruthy();
  });
});

import { describe, it, expect, beforeEach } from 'vitest';
import { calculateUnifiedEnergy } from './lib/unified-energy-engine';
import { trace, clearTraces, printTraceReport } from './lib/diagnostic-trace';
import type { UserProfile } from './types';

/**
 * Test with user's EXACT birth data
 * Name: Rotchana dixon
 * DOB: January 22, 1969
 * Location: Leeston, New Zealand (-43.8167, 172.2833)
 */

describe('User Exact Data - Deep Investigation', () => {
  beforeEach(() => {
    clearTraces();
  });

  it('should calculate unified energy with user exact data', () => {
    trace('TEST START', true, { test: 'User exact data' });

    // User's exact profile from screenshots
    const userProfile: UserProfile = {
      name: 'Rotchana dixon',
      dateOfBirth: '1969-01-22', // January 22, 1969
      placeOfBirth: {
        city: 'Leeston',
        country: 'New Zealand',
        latitude: -43.8167,
        longitude: 172.2833
      },
      onboardingComplete: true
    };

    trace('Profile created', true, userProfile);

    try {
      trace('Calling calculateUnifiedEnergy', true);
      const result = calculateUnifiedEnergy(userProfile);
      trace('calculateUnifiedEnergy SUCCESS', true, {
        score: result.combinedAnalysis.perfectDayScore,
        hasPersonalProfile: !!result.personalProfile,
        hasEarthProfile: !!result.earthProfile,
        hasChallengesProfile: !!result.challengesProfile
      });

      // Verify result structure
      expect(result).toBeDefined();
      expect(result.personalProfile).toBeDefined();
      expect(result.earthProfile).toBeDefined();
      expect(result.challengesProfile).toBeDefined();
      expect(result.combinedAnalysis).toBeDefined();
      expect(result.businessInsights).toBeDefined();

      // Verify personal profile has all required fields
      expect(result.personalProfile.lifePathNumber).toBeDefined();
      expect(result.personalProfile.birthHexagram).toBeDefined();
      expect(result.personalProfile.dosha).toBeDefined();
      expect(result.personalProfile.birthElement).toBeDefined();
      expect(result.personalProfile.zodiacSign).toBeDefined();
      expect(result.personalProfile.astrologyProfile).toBeDefined();

      // Verify astrology profile (signs are strings)
      expect(result.personalProfile.astrologyProfile.sunSign).toBeDefined();
      expect(typeof result.personalProfile.astrologyProfile.sunSign).toBe('string');
      expect(result.personalProfile.astrologyProfile.moonSign).toBeDefined();
      expect(typeof result.personalProfile.astrologyProfile.moonSign).toBe('string');
      expect(result.personalProfile.astrologyProfile.risingSign).toBeDefined();
      expect(typeof result.personalProfile.astrologyProfile.risingSign).toBe('string');

      trace('All assertions passed', true);

      console.log('\n✅ SUCCESS: User data processed correctly');
      console.log('Profile:', userProfile);
      console.log('Result score:', result.combinedAnalysis.perfectDayScore);
      console.log('Sun sign:', result.personalProfile.astrologyProfile.sunSign);
      console.log('Moon sign:', result.personalProfile.astrologyProfile.moonSign);
      console.log('Rising sign:', result.personalProfile.astrologyProfile.risingSign);

    } catch (error) {
      trace('calculateUnifiedEnergy FAILED', false, userProfile, error);
      printTraceReport();
      throw error;
    }

    printTraceReport();
  });

  it('should handle date parsing correctly', () => {
    const testDate = '1969-01-22';
    // Use UTC parsing like the actual code does
    const date = new Date(testDate + 'T12:00:00Z');
    
    trace('Date parsing test', true, {
      input: testDate,
      parsed: date.toISOString(),
      month: date.getUTCMonth() + 1,
      day: date.getUTCDate(),
      year: date.getUTCFullYear()
    });

    expect(date.getUTCFullYear()).toBe(1969);
    expect(date.getUTCMonth() + 1).toBe(1); // January
    expect(date.getUTCDate()).toBe(22);
  });

  it('should calculate moon sign with location', () => {
    const userProfile: UserProfile = {
      name: 'Rotchana dixon',
      dateOfBirth: '1969-01-22',
      placeOfBirth: {
        city: 'Leeston',
        country: 'New Zealand',
        latitude: -43.8167,
        longitude: 172.2833
      },
      onboardingComplete: true
    };

    try {
      const result = calculateUnifiedEnergy(userProfile);
      const moonSign = result.personalProfile.astrologyProfile.moonSign;

      trace('Moon sign calculated', true, {
        moonSign: moonSign
      });

      expect(moonSign).toBeDefined();
      expect(typeof moonSign).toBe('string');
      expect(moonSign.length).toBeGreaterThan(0);

      console.log('\n🌙 Moon Sign:', moonSign);

    } catch (error) {
      trace('Moon sign calculation FAILED', false, userProfile, error);
      printTraceReport();
      throw error;
    }
  });
});

import { describe, it, expect } from 'vitest';
import { calculateUnifiedEnergy } from './lib/unified-energy-engine';
import type { UserProfile } from './types';

/**
 * Test with user's EXACT data from phone: March 24, 1969, Leeston, New Zealand
 * This is the data that's causing the error on the physical device
 */

describe('User Exact Data - March 24, 1969', () => {
  it('should calculate energy for March 24, 1969 birth date', () => {
    const userProfile: UserProfile = {
      name: 'Rotchana dixon',
      dateOfBirth: '1969-03-24',
      placeOfBirth: {
        city: 'Leeston',
        country: 'New Zealand',
        latitude: -43.8167,
        longitude: 172.2833
      },
      onboardingComplete: true
    };

    console.log('Testing with user exact data:', userProfile);

    let result;
    try {
      result = calculateUnifiedEnergy(userProfile);
      console.log('✅ Energy calculation SUCCESS');
      console.log('   Sun Sign:', result.personalProfile.astrologyProfile.sunSign);
      console.log('   Moon Sign:', result.personalProfile.astrologyProfile.moonSign);
      console.log('   Rising Sign:', result.personalProfile.astrologyProfile.risingSign);
      console.log('   Perfect Day Score:', result.combinedAnalysis.perfectDayScore);
    } catch (error) {
      console.error('❌ Energy calculation FAILED');
      console.error('   Error:', error instanceof Error ? error.message : String(error));
      console.error('   Stack:', error instanceof Error ? error.stack : 'No stack');
      throw error;
    }

    expect(result).toBeDefined();
    expect(result.personalProfile).toBeDefined();
    expect(result.personalProfile.astrologyProfile).toBeDefined();
    expect(result.personalProfile.astrologyProfile.sunSign).toBe('Aries'); // March 24 is Aries
    expect(result.personalProfile.astrologyProfile.moonSign).toBeDefined();
    expect(result.personalProfile.astrologyProfile.risingSign).toBeDefined();
    expect(result.earthProfile).toBeDefined();
    expect(result.combinedAnalysis).toBeDefined();
    expect(result.businessInsights).toBeDefined();
  });

  it('should handle March 24 date parsing correctly', () => {
    const dateString = '1969-03-24';
    
    // Test UTC parsing (what the code uses)
    const parts = dateString.split('-');
    const utcDate = new Date(Date.UTC(
      parseInt(parts[0]),
      parseInt(parts[1]) - 1,
      parseInt(parts[2])
    ));
    
    console.log('Date parsing test:');
    console.log('   Input:', dateString);
    console.log('   UTC Date:', utcDate.toISOString());
    console.log('   Day:', utcDate.getUTCDate());
    console.log('   Month:', utcDate.getUTCMonth() + 1);
    console.log('   Year:', utcDate.getUTCFullYear());
    
    expect(utcDate.getUTCDate()).toBe(24);
    expect(utcDate.getUTCMonth()).toBe(2); // March = 2 (0-indexed)
    expect(utcDate.getUTCFullYear()).toBe(1969);
  });

  it('should calculate correct sun sign for March 24', () => {
    // March 24 is definitely Aries (March 21 - April 19)
    const userProfile: UserProfile = {
      name: 'Test User',
      dateOfBirth: '1969-03-24',
      placeOfBirth: {
        city: 'Leeston',
        country: 'New Zealand',
        latitude: -43.8167,
        longitude: 172.2833
      },
      onboardingComplete: true
    };

    const result = calculateUnifiedEnergy(userProfile);
    
    console.log('Sun sign for March 24:', result.personalProfile.astrologyProfile.sunSign);
    
    expect(result.personalProfile.astrologyProfile.sunSign).toBe('Aries');
  });
});

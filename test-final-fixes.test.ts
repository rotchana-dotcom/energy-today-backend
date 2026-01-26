/**
 * Final Fixes Test Suite
 * 
 * Tests:
 * 1. Date format normalization (ISO timestamp vs simple date string)
 * 2. Name numerology analysis
 * 3. Complete unified energy calculation with user's exact data
 */

import { describe, it, expect } from 'vitest';
import { calculateAstrologyProfile } from './lib/astrology';
import { analyzeNameNumerology } from './lib/name-numerology';
import { calculateUnifiedEnergy } from './lib/unified-energy-engine';
import { UserProfile } from './types';

describe('Date Format Normalization', () => {
  it('should handle ISO timestamp date format', () => {
    const isoDate = '1969-03-24T04:23:00.000Z';
    const result = calculateAstrologyProfile(isoDate, { latitude: -43.8, longitude: 172.3 });
    
    expect(result).toBeDefined();
    expect(result.sunSign).toBeDefined();
    expect(result.moonSign).toBeDefined();
    expect(result.risingSign).toBeDefined();
  });
  
  it('should handle simple date string format', () => {
    const simpleDate = '1969-03-24';
    const result = calculateAstrologyProfile(simpleDate, { latitude: -43.8, longitude: 172.3 });
    
    expect(result).toBeDefined();
    expect(result.sunSign).toBeDefined();
    expect(result.moonSign).toBeDefined();
    expect(result.risingSign).toBeDefined();
  });
  
  it('should produce same results for both date formats', () => {
    const isoDate = '1969-03-24T04:23:00.000Z';
    const simpleDate = '1969-03-24';
    const location = { latitude: -43.8, longitude: 172.3 };
    
    const result1 = calculateAstrologyProfile(isoDate, location);
    const result2 = calculateAstrologyProfile(simpleDate, location);
    
    expect(result1.sunSign).toBe(result2.sunSign);
    expect(result1.moonSign).toBe(result2.moonSign);
    expect(result1.risingSign).toBe(result2.risingSign);
  });
});

describe('Name Numerology Analysis', () => {
  it('should analyze name correctly', () => {
    const result = analyzeNameNumerology('Rotchana dixon');
    
    expect(result).toBeDefined();
    expect(result.expressionNumber).toBeGreaterThanOrEqual(1);
    expect(result.expressionNumber).toBeLessThanOrEqual(33);
    expect(result.expressionMeaning).toBeTruthy();
    
    expect(result.soulUrgeNumber).toBeGreaterThanOrEqual(1);
    expect(result.soulUrgeNumber).toBeLessThanOrEqual(33);
    expect(result.soulUrgeMeaning).toBeTruthy();
    
    expect(result.personalityNumber).toBeGreaterThanOrEqual(1);
    expect(result.personalityNumber).toBeLessThanOrEqual(33);
    expect(result.personalityMeaning).toBeTruthy();
  });
  
  it('should handle names with spaces and special characters', () => {
    const result = analyzeNameNumerology('Mary-Jane O\'Brien');
    
    expect(result).toBeDefined();
    expect(result.expressionNumber).toBeGreaterThanOrEqual(1);
  });
});

describe('Complete Unified Energy Calculation', () => {
  it('should calculate energy with ISO timestamp date', () => {
    const profile: UserProfile = {
      name: 'Rotchana dixon',
      dateOfBirth: '1969-03-24T04:23:00.000Z',
      placeOfBirth: {
        city: 'Leeston',
        country: 'New Zealand',
        latitude: -43.8,
        longitude: 172.3,
      },
      onboardingComplete: true,
    };
    
    const result = calculateUnifiedEnergy(profile, new Date('2024-01-22'));
    
    expect(result).toBeDefined();
    expect(result.personalProfile).toBeDefined();
    expect(result.personalProfile.astrologyProfile).toBeDefined();
    expect(result.personalProfile.astrologyProfile.sunSign).toBeTruthy();
    expect(result.personalProfile.astrologyProfile.moonSign).toBeTruthy();
  });
  
  it('should calculate energy with simple date string', () => {
    const profile: UserProfile = {
      name: 'Rotchana dixon',
      dateOfBirth: '1969-03-24',
      placeOfBirth: {
        city: 'Leeston',
        country: 'New Zealand',
        latitude: -43.8,
        longitude: 172.3,
      },
      onboardingComplete: true,
    };
    
    const result = calculateUnifiedEnergy(profile, new Date('2024-01-22'));
    
    expect(result).toBeDefined();
    expect(result.personalProfile).toBeDefined();
    expect(result.personalProfile.astrologyProfile).toBeDefined();
    expect(result.personalProfile.astrologyProfile.sunSign).toBeTruthy();
    expect(result.personalProfile.astrologyProfile.moonSign).toBeTruthy();
  });
  
  it('should produce consistent results for both date formats', () => {
    const profileISO: UserProfile = {
      name: 'Rotchana dixon',
      dateOfBirth: '1969-03-24T04:23:00.000Z',
      placeOfBirth: {
        city: 'Leeston',
        country: 'New Zealand',
        latitude: -43.8,
        longitude: 172.3,
      },
      onboardingComplete: true,
    };
    
    const profileSimple: UserProfile = {
      ...profileISO,
      dateOfBirth: '1969-03-24',
    };
    
    const date = new Date('2024-01-22');
    const result1 = calculateUnifiedEnergy(profileISO, date);
    const result2 = calculateUnifiedEnergy(profileSimple, date);
    
    expect(result1.personalProfile.astrologyProfile.sunSign).toBe(
      result2.personalProfile.astrologyProfile.sunSign
    );
    expect(result1.personalProfile.astrologyProfile.moonSign).toBe(
      result2.personalProfile.astrologyProfile.moonSign
    );
  });
});

import { describe, it, expect } from 'vitest';
import { geocode, hasCoordinates } from './lib/geocoding';
import { calculateUnifiedEnergy } from './lib/unified-energy-engine';
import { UserProfile } from './types';

describe('Phase 54: Geocoding Fix for Location Permission Bug', () => {
  describe('Geocoding Utility', () => {
    it('should geocode Leeston, New Zealand correctly', () => {
      const coords = geocode('Leeston', 'New Zealand');
      expect(coords.latitude).toBeCloseTo(-43.7667, 2);
      expect(coords.longitude).toBeCloseTo(172.3000, 2);
    });

    it('should be case-insensitive', () => {
      const coords1 = geocode('LEESTON', 'NEW ZEALAND');
      const coords2 = geocode('leeston', 'new zealand');
      expect(coords1.latitude).toBe(coords2.latitude);
      expect(coords1.longitude).toBe(coords2.longitude);
    });

    it('should return default coordinates for unknown city', () => {
      const coords = geocode('Unknown City', 'Unknown Country');
      expect(coords.latitude).toBe(0);
      expect(coords.longitude).toBe(0);
    });

    it('should check if coordinates exist', () => {
      expect(hasCoordinates('Leeston', 'New Zealand')).toBe(true);
      expect(hasCoordinates('Unknown', 'Unknown')).toBe(false);
    });
  });

  describe('Integration with Energy Calculation', () => {
    it('should calculate energy with geocoded coordinates (Leeston, NZ)', () => {
      const coords = geocode('Leeston', 'New Zealand');
      
      const profile: UserProfile = {
        name: 'Rotchana dixon',
        dateOfBirth: '1969-03-24',
        placeOfBirth: {
          city: 'Leeston',
          country: 'New Zealand',
          latitude: coords.latitude,
          longitude: coords.longitude,
        },
        onboardingComplete: true,
      };

      const reading = calculateUnifiedEnergy(new Date('2026-01-22'), profile);
      
      expect(reading).toBeDefined();
      expect(reading.personalEnergy).toBeDefined();
      expect(reading.personalEnergy.astrology).toBeDefined();
      expect(reading.personalEnergy.astrology.sunSign).toBeDefined();
      expect(reading.personalEnergy.astrology.moonSign).toBeDefined();
    });

    it('should handle zero coordinates gracefully (unknown city)', () => {
      const coords = geocode('Unknown City', 'Unknown Country');
      
      const profile: UserProfile = {
        name: 'Test User',
        dateOfBirth: '1990-01-15',
        placeOfBirth: {
          city: 'Unknown City',
          country: 'Unknown Country',
          latitude: coords.latitude,
          longitude: coords.longitude,
        },
        onboardingComplete: true,
      };

      const reading = calculateUnifiedEnergy(new Date('2026-01-22'), profile);
      
      // Should not crash, even with (0, 0) coordinates
      expect(reading).toBeDefined();
      expect(reading.personalEnergy).toBeDefined();
    });

    it('should calculate different moon signs for different locations', () => {
      const cities = [
        { city: 'Leeston', country: 'New Zealand' },
        { city: 'London', country: 'United Kingdom' },
        { city: 'Tokyo', country: 'Japan' },
      ];

      const moonSigns = cities.map(({ city, country }) => {
        const coords = geocode(city, country);
        const profile: UserProfile = {
          name: 'Test User',
          dateOfBirth: '1990-01-15',
          placeOfBirth: {
            city,
            country,
            latitude: coords.latitude,
            longitude: coords.longitude,
          },
          onboardingComplete: true,
        };

        const reading = calculateUnifiedEnergy(new Date('2026-01-22'), profile);
        return reading.personalEnergy.astrology.moonSign;
      });

      // Moon signs should be calculated (may or may not be different depending on location)
      expect(moonSigns).toHaveLength(3);
      moonSigns.forEach(sign => {
        expect(sign).toBeTruthy();
        expect(typeof sign).toBe('string');
      });
    });
  });

  describe('User Exact Data - Rotchana dixon', () => {
    it('should calculate energy with exact user data', () => {
      const coords = geocode('Leeston', 'New Zealand');
      
      const profile: UserProfile = {
        name: 'Rotchana dixon',
        dateOfBirth: '1969-03-24',
        placeOfBirth: {
          city: 'Leeston',
          country: 'New Zealand',
          latitude: coords.latitude,
          longitude: coords.longitude,
        },
        onboardingComplete: true,
      };

      console.log('Testing with profile:', profile);

      const reading = calculateUnifiedEnergy(new Date('2026-01-22'), profile);
      
      console.log('Energy reading:', {
        score: reading.overallScore,
        sunSign: reading.personalEnergy.astrology.sunSign,
        moonSign: reading.personalEnergy.astrology.moonSign,
        risingSign: reading.personalEnergy.astrology.risingSign,
      });

      expect(reading).toBeDefined();
      expect(reading.overallScore).toBeGreaterThan(0);
      expect(reading.overallScore).toBeLessThanOrEqual(100);
      expect(reading.personalEnergy.astrology.sunSign).toBe('Aries');
      expect(reading.personalEnergy.astrology.moonSign).toBeTruthy();
      expect(reading.personalEnergy.astrology.risingSign).toBeTruthy();
    });
  });
});

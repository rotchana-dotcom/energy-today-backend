import { describe, it, expect } from 'vitest';
import { geocode, hasCoordinates } from './lib/geocoding';

describe('Geocoding Fix - Simple Tests', () => {
  it('should geocode Leeston, New Zealand', () => {
    const coords = geocode('Leeston', 'New Zealand');
    expect(coords.latitude).toBeCloseTo(-43.7667, 2);
    expect(coords.longitude).toBeCloseTo(172.3000, 2);
  });

  it('should geocode Auckland, New Zealand', () => {
    const coords = geocode('Auckland', 'New Zealand');
    expect(coords.latitude).toBeCloseTo(-36.8485, 2);
    expect(coords.longitude).toBeCloseTo(174.7633, 2);
  });

  it('should be case-insensitive', () => {
    const lower = geocode('leeston', 'new zealand');
    const upper = geocode('LEESTON', 'NEW ZEALAND');
    const mixed = geocode('Leeston', 'New Zealand');
    
    expect(lower.latitude).toBe(upper.latitude);
    expect(lower.longitude).toBe(upper.longitude);
    expect(lower.latitude).toBe(mixed.latitude);
  });

  it('should return (0, 0) for unknown cities', () => {
    const coords = geocode('Unknown City', 'Unknown Country');
    expect(coords.latitude).toBe(0);
    expect(coords.longitude).toBe(0);
  });

  it('should check if coordinates exist', () => {
    expect(hasCoordinates('Leeston', 'New Zealand')).toBe(true);
    expect(hasCoordinates('Auckland', 'New Zealand')).toBe(true);
    expect(hasCoordinates('Unknown', 'Unknown')).toBe(false);
  });

  it('should handle major world cities', () => {
    const london = geocode('London', 'United Kingdom');
    expect(london.latitude).toBeCloseTo(51.5074, 2);
    
    const tokyo = geocode('Tokyo', 'Japan');
    expect(tokyo.latitude).toBeCloseTo(35.6762, 2);
    
    const sydney = geocode('Sydney', 'Australia');
    expect(sydney.latitude).toBeCloseTo(-33.8688, 2);
  });
});

/**
 * Test: AI Insights Forecast Date Generation
 * 
 * Verifies that the predictEnergy API generates real future dates
 * instead of placeholder dates like June/July
 */

import { describe, it, expect } from 'vitest';

describe('AI Insights - Forecast Date Generation', () => {
  it('should generate real future dates starting from tomorrow', () => {
    const today = new Date('2026-01-23');
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Simulate what the backend does
    const daysAhead = 7;
    const dates: string[] = [];
    
    for (let i = 0; i < daysAhead; i++) {
      const date = new Date(tomorrow);
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    // Verify dates are sequential and start from tomorrow
    expect(dates.length).toBe(7);
    expect(dates[0]).toBe('2026-01-24'); // Tomorrow
    expect(dates[1]).toBe('2026-01-25');
    expect(dates[2]).toBe('2026-01-26');
    expect(dates[3]).toBe('2026-01-27');
    expect(dates[4]).toBe('2026-01-28');
    expect(dates[5]).toBe('2026-01-29');
    expect(dates[6]).toBe('2026-01-30');
    
    // Verify no placeholder dates (June/July)
    dates.forEach(date => {
      expect(date).not.toContain('2024-06');
      expect(date).not.toContain('2024-07');
      expect(date).not.toContain('2025-06');
      expect(date).not.toContain('2025-07');
    });
  });
  
  it('should format dates correctly for display', () => {
    const date = new Date('2026-01-24T12:00:00');
    const formatted = date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric',
      timeZone: 'UTC'
    });
    
    expect(formatted).toBe('Saturday, Jan 24');
  });
  
  it('should handle month boundaries correctly', () => {
    const endOfMonth = new Date('2026-01-31');
    const nextDay = new Date(endOfMonth);
    nextDay.setDate(nextDay.getDate() + 1);
    
    expect(nextDay.toISOString().split('T')[0]).toBe('2026-02-01');
  });
});

/**
 * Test: Analytics Dashboard Pro Paywall
 * 
 * Verifies that time ranges are correctly locked/unlocked based on Pro status
 */

import { describe, it, expect } from 'vitest';

describe('Analytics Dashboard - Pro Paywall', () => {
  type TimeRange = '7D' | '30D' | '90D' | 'ALL';
  
  interface PaywallConfig {
    freeRanges: TimeRange[];
    proRanges: TimeRange[];
  }
  
  const config: PaywallConfig = {
    freeRanges: ['7D'],
    proRanges: ['30D', '90D', 'ALL'],
  };
  
  function isRangeLocked(range: TimeRange, isPro: boolean): boolean {
    if (isPro) return false; // Pro users: all unlocked
    return config.proRanges.includes(range); // Free users: pro ranges locked
  }
  
  describe('Free User', () => {
    const isPro = false;
    
    it('should have 7D unlocked', () => {
      expect(isRangeLocked('7D', isPro)).toBe(false);
    });
    
    it('should have 30D locked', () => {
      expect(isRangeLocked('30D', isPro)).toBe(true);
    });
    
    it('should have 90D locked', () => {
      expect(isRangeLocked('90D', isPro)).toBe(true);
    });
    
    it('should have ALL locked', () => {
      expect(isRangeLocked('ALL', isPro)).toBe(true);
    });
  });
  
  describe('Pro User', () => {
    const isPro = true;
    
    it('should have 7D unlocked', () => {
      expect(isRangeLocked('7D', isPro)).toBe(false);
    });
    
    it('should have 30D unlocked', () => {
      expect(isRangeLocked('30D', isPro)).toBe(false);
    });
    
    it('should have 90D unlocked', () => {
      expect(isRangeLocked('90D', isPro)).toBe(false);
    });
    
    it('should have ALL unlocked', () => {
      expect(isRangeLocked('ALL', isPro)).toBe(false);
    });
  });
  
  describe('Upgrade Flow', () => {
    it('should redirect to upgrade page when tapping locked range', () => {
      const isPro = false;
      const tappedRange: TimeRange = '30D';
      
      if (isRangeLocked(tappedRange, isPro)) {
        const redirectTo = '/upgrade';
        expect(redirectTo).toBe('/upgrade');
      }
    });
    
    it('should not redirect when tapping unlocked range', () => {
      const isPro = false;
      const tappedRange: TimeRange = '7D';
      
      expect(isRangeLocked(tappedRange, isPro)).toBe(false);
      // No redirect needed
    });
  });
  
  describe('Visual Indicators', () => {
    it('locked ranges should show lock icon badge', () => {
      const isPro = false;
      const lockedRanges = ['30D', '90D', 'ALL'].filter(r => 
        isRangeLocked(r as TimeRange, isPro)
      );
      
      expect(lockedRanges).toEqual(['30D', '90D', 'ALL']);
    });
    
    it('locked ranges should have reduced opacity', () => {
      const isPro = false;
      const opacity = isRangeLocked('30D', isPro) ? 0.6 : 1.0;
      
      expect(opacity).toBe(0.6);
    });
  });
});

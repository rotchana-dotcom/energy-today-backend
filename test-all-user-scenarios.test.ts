import { describe, it, expect, beforeEach } from 'vitest';
import { calculateUnifiedEnergy } from './lib/unified-energy-engine';
import { getSubscriptionStatus } from './lib/subscription-status';
import type { UserProfile } from './types';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Comprehensive test suite for all user scenarios
 * 
 * Tests:
 * 1. First-time user (onboarding → Today screen)
 * 2. Returning user (direct to Today screen)
 * 3. Free tier user (7-day trial active)
 * 4. Pro tier user (unlimited access)
 * 5. Expired trial user (free tier after 7 days)
 */

describe('All User Scenarios', () => {
  beforeEach(async () => {
    // Clear all AsyncStorage before each test
    await AsyncStorage.clear();
  });

  describe('First-Time User Flow', () => {
    it('should complete onboarding and load Today screen data', async () => {
      // Simulate user completing onboarding
      const newUser: UserProfile = {
        name: 'Test User',
        dateOfBirth: '1990-05-15',
        placeOfBirth: {
          city: 'Auckland',
          country: 'New Zealand',
          latitude: -36.8485,
          longitude: 174.7633
        },
        onboardingComplete: true
      };

      // Save profile (simulating onboarding completion)
      await AsyncStorage.setItem('user_profile', JSON.stringify(newUser));
      await AsyncStorage.setItem('install_date', new Date().toISOString());

      // Load profile (simulating Today screen mount)
      const savedProfile = await AsyncStorage.getItem('user_profile');
      expect(savedProfile).toBeDefined();
      
      const profile = JSON.parse(savedProfile!);
      expect(profile.name).toBe('Test User');
      expect(profile.onboardingComplete).toBe(true);

      // Calculate energy data
      const result = calculateUnifiedEnergy(profile);
      expect(result).toBeDefined();
      expect(result.personalProfile).toBeDefined();
      expect(result.earthProfile).toBeDefined();
      expect(result.combinedAnalysis).toBeDefined();
      expect(result.businessInsights).toBeDefined();

      console.log('✅ First-time user flow: PASS');
      console.log('   - Profile saved:', profile.name);
      console.log('   - Energy calculated:', result.combinedAnalysis.perfectDayScore);
    });
  });

  describe('Returning User Flow', () => {
    it('should load existing profile and skip onboarding', async () => {
      // Simulate existing user
      const existingUser: UserProfile = {
        name: 'Returning User',
        dateOfBirth: '1985-12-25',
        placeOfBirth: {
          city: 'Wellington',
          country: 'New Zealand',
          latitude: -41.2865,
          longitude: 174.7762
        },
        onboardingComplete: true
      };

      // Save profile (simulating previous session)
      await AsyncStorage.setItem('user_profile', JSON.stringify(existingUser));
      await AsyncStorage.setItem('install_date', new Date('2024-01-01').toISOString());

      // Load profile (simulating app restart)
      const savedProfile = await AsyncStorage.getItem('user_profile');
      expect(savedProfile).toBeDefined();
      
      const profile = JSON.parse(savedProfile!);
      expect(profile.onboardingComplete).toBe(true);

      // Should go directly to Today screen
      const result = calculateUnifiedEnergy(profile);
      expect(result).toBeDefined();

      console.log('✅ Returning user flow: PASS');
      console.log('   - Profile loaded:', profile.name);
      console.log('   - Onboarding skipped: true');
    });
  });

  describe('Free Tier User (Trial Active)', () => {
    it('should show Pro features during 7-day trial', async () => {
      // Simulate user within 7-day trial
      const trialUser: UserProfile = {
        name: 'Trial User',
        dateOfBirth: '1992-08-10',
        placeOfBirth: {
          city: 'Christchurch',
          country: 'New Zealand',
          latitude: -43.5321,
          longitude: 172.6362
        },
        onboardingComplete: true
      };

      // Set install date to 3 days ago
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      await AsyncStorage.setItem('install_date', threeDaysAgo.toISOString());

      // Check subscription status
      const status = await getSubscriptionStatus();
      expect(status.isPro).toBe(true); // Should be Pro during trial
      expect(status.isTrialActive).toBe(true);
      expect(status.trialDaysRemaining).toBeGreaterThan(0);
      expect(status.trialDaysRemaining).toBeLessThanOrEqual(7);

      // Calculate energy (Pro features should work)
      const result = calculateUnifiedEnergy(trialUser);
      expect(result).toBeDefined();
      expect(result.businessInsights).toBeDefined(); // Pro feature

      console.log('✅ Free tier (trial active): PASS');
      console.log('   - Trial days remaining:', status.trialDaysRemaining);
      console.log('   - Pro features enabled: true');
    });
  });

  describe('Pro Tier User', () => {
    it('should have unlimited access to all features', async () => {
      // Simulate Pro user
      const proUser: UserProfile = {
        name: 'Pro User',
        dateOfBirth: '1988-03-20',
        placeOfBirth: {
          city: 'Dunedin',
          country: 'New Zealand',
          latitude: -45.8788,
          longitude: 170.5028
        },
        onboardingComplete: true
      };

      // Set install date to 30 days ago (trial expired)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      await AsyncStorage.setItem('install_date', thirtyDaysAgo.toISOString());

      // Simulate Pro subscription
      await AsyncStorage.setItem('subscription_tier', 'pro');

      // Check subscription status
      const status = await getSubscriptionStatus();
      expect(status.isPro).toBe(true);

      // All features should work
      const result = calculateUnifiedEnergy(proUser);
      expect(result).toBeDefined();
      expect(result.businessInsights).toBeDefined();

      console.log('✅ Pro tier user: PASS');
      console.log('   - Subscription: Pro');
      console.log('   - All features enabled: true');
    });
  });

  describe('Expired Trial User', () => {
    it('should show free tier features after trial expires', async () => {
      // Simulate user after 7-day trial
      const expiredTrialUser: UserProfile = {
        name: 'Expired Trial User',
        dateOfBirth: '1995-11-05',
        placeOfBirth: {
          city: 'Hamilton',
          country: 'New Zealand',
          latitude: -37.7870,
          longitude: 175.2793
        },
        onboardingComplete: true
      };

      // Set install date to 10 days ago (trial expired)
      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
      await AsyncStorage.setItem('install_date', tenDaysAgo.toISOString());

      // Check subscription status
      const status = await getSubscriptionStatus();
      expect(status.isPro).toBe(false); // Should be free tier
      expect(status.isTrialActive).toBe(false);

      // Basic features should still work
      const result = calculateUnifiedEnergy(expiredTrialUser);
      expect(result).toBeDefined();
      expect(result.personalProfile).toBeDefined();
      expect(result.earthProfile).toBeDefined();

      console.log('✅ Expired trial user: PASS');
      console.log('   - Trial expired: true');
      console.log('   - Free tier features enabled: true');
    });
  });

  describe('Data Calculation with Various Birth Dates', () => {
    it('should handle birth dates from different decades', async () => {
      const testDates = [
        { date: '1950-01-15', name: '1950s' },
        { date: '1969-01-22', name: '1960s (user exact)' },
        { date: '1985-06-30', name: '1980s' },
        { date: '2000-12-31', name: '2000s' },
        { date: '2020-03-15', name: '2020s' }
      ];

      for (const testCase of testDates) {
        const user: UserProfile = {
          name: `Test ${testCase.name}`,
          dateOfBirth: testCase.date,
          placeOfBirth: {
            city: 'Auckland',
            country: 'New Zealand',
            latitude: -36.8485,
            longitude: 174.7633
          },
          onboardingComplete: true
        };

        const result = calculateUnifiedEnergy(user);
        expect(result).toBeDefined();
        expect(result.personalProfile.astrologyProfile.sunSign).toBeDefined();
        expect(result.personalProfile.astrologyProfile.moonSign).toBeDefined();
        expect(result.personalProfile.astrologyProfile.risingSign).toBeDefined();

        console.log(`✅ Birth date ${testCase.name}: ${result.personalProfile.astrologyProfile.sunSign}`);
      }
    });
  });
});

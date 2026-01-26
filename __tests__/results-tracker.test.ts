/**
 * Results Tracker Tests
 * 
 * Tests for the results tracking and pattern analysis system
 */

import { describe, it, expect, beforeEach } from 'vitest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  logDailyOutcome,
  getAllOutcomes,
  getTodayOutcome,
  analyzePatterns,
  clearAllOutcomes,
  type DailyOutcome,
  type OutcomeRating,
  type ActivityType,
  type PatternAnalysis
} from '../lib/results-tracker';

describe('Results Tracker', () => {
  beforeEach(async () => {
    // Clear storage before each test
    await AsyncStorage.clear();
  });

  describe('logDailyOutcome', () => {
    it('should save a daily outcome', async () => {
      const outcome: DailyOutcome = {
        date: '2026-01-20',
        energyScore: 85,
        outcomeRating: 'excellent',
        activities: ['meeting', 'decision'],
        dealsClosed: 2,
        revenue: 50000,
        notes: 'Great day!',
        followedAdvice: true,
        createdAt: new Date().toISOString()
      };

      await logDailyOutcome(outcome);
      const outcomes = await getAllOutcomes();
      
      expect(outcomes).toHaveLength(1);
      expect(outcomes[0].date).toBe('2026-01-20');
      expect(outcomes[0].energyScore).toBe(85);
      expect(outcomes[0].outcomeRating).toBe('excellent');
    });

    it('should update existing outcome for same date', async () => {
      const outcome1: DailyOutcome = {
        date: '2026-01-20',
        energyScore: 85,
        outcomeRating: 'excellent',
        activities: ['meeting'],
        dealsClosed: 1,
        revenue: 10000,
        notes: 'First version',
        followedAdvice: true,
        createdAt: new Date().toISOString()
      };

      const outcome2: DailyOutcome = {
        date: '2026-01-20',
        energyScore: 85,
        outcomeRating: 'good',
        activities: ['meeting', 'decision'],
        dealsClosed: 2,
        revenue: 20000,
        notes: 'Updated version',
        followedAdvice: true,
        createdAt: new Date().toISOString()
      };

      await logDailyOutcome(outcome1);
      await logDailyOutcome(outcome2);
      
      const outcomes = await getAllOutcomes();
      expect(outcomes).toHaveLength(1);
      expect(outcomes[0].outcomeRating).toBe('good');
      expect(outcomes[0].dealsClosed).toBe(2);
    });
  });

  describe('getTodayOutcome', () => {
    it('should return today\'s outcome if it exists', async () => {
      const today = new Date().toISOString().split('T')[0];
      const outcome: DailyOutcome = {
        date: today,
        energyScore: 75,
        outcomeRating: 'good',
        activities: ['planning'],
        dealsClosed: 0,
        revenue: 0,
        notes: '',
        followedAdvice: true,
        createdAt: new Date().toISOString()
      };

      await logDailyOutcome(outcome);
      const todayOutcome = await getTodayOutcome();
      
      expect(todayOutcome).not.toBeNull();
      expect(todayOutcome?.date).toBe(today);
    });

    it('should return null if no outcome for today', async () => {
      const todayOutcome = await getTodayOutcome();
      expect(todayOutcome).toBeNull();
    });
  });

  describe('analyzePatterns', () => {
    it('should calculate success rates by energy score range', async () => {
      // High energy, good outcome
      await logDailyOutcome({
        date: '2026-01-15',
        energyScore: 90,
        outcomeRating: 'excellent',
        activities: ['meeting'],
        dealsClosed: 2,
        revenue: 50000,
        notes: '',
        followedAdvice: true,
        createdAt: new Date().toISOString()
      });

      // High energy, good outcome
      await logDailyOutcome({
        date: '2026-01-16',
        energyScore: 85,
        outcomeRating: 'good',
        activities: ['decision'],
        dealsClosed: 1,
        revenue: 25000,
        notes: '',
        followedAdvice: true,
        createdAt: new Date().toISOString()
      });

      // Low energy, poor outcome
      await logDailyOutcome({
        date: '2026-01-17',
        energyScore: 45,
        outcomeRating: 'poor',
        activities: ['negotiation'],
        dealsClosed: 0,
        revenue: 0,
        notes: '',
        followedAdvice: false,
        createdAt: new Date().toISOString()
      });

      const analysis = await analyzePatterns();
      
      expect(analysis.daysLogged).toBe(3);
      expect(analysis.successRates.length).toBeGreaterThanOrEqual(3); // At least 3 ranges
      
      // High energy range should have 100% success
      const highEnergyRange = analysis.successRates.find((r: PatternAnalysis['successRates'][0]) => r.range === '85-100');
      expect(highEnergyRange?.successRate).toBe(100);
      expect(highEnergyRange?.count).toBe(2);
    });

    it('should identify best activities', async () => {
      await logDailyOutcome({
        date: '2026-01-15',
        energyScore: 90,
        outcomeRating: 'excellent',
        activities: ['meeting'],
        dealsClosed: 2,
        revenue: 50000,
        notes: '',
        followedAdvice: true,
        createdAt: new Date().toISOString()
      });

      await logDailyOutcome({
        date: '2026-01-16',
        energyScore: 85,
        outcomeRating: 'good',
        activities: ['meeting'],
        dealsClosed: 1,
        revenue: 25000,
        notes: '',
        followedAdvice: true,
        createdAt: new Date().toISOString()
      });

      const analysis = await analyzePatterns();
      
      const meetingActivity = analysis.bestActivities.find((a: PatternAnalysis['bestActivities'][0]) => a.activity === 'meeting');
      expect(meetingActivity).toBeDefined();
      expect(meetingActivity?.successRate).toBe(100);
      expect(meetingActivity?.totalAttempts).toBe(2);
    });

    it('should track followed vs ignored advice', async () => {
      // Followed advice, good outcome
      await logDailyOutcome({
        date: '2026-01-15',
        energyScore: 90,
        outcomeRating: 'excellent',
        activities: ['meeting'],
        dealsClosed: 2,
        revenue: 50000,
        notes: '',
        followedAdvice: true,
        createdAt: new Date().toISOString()
      });

      // Ignored advice, poor outcome
      await logDailyOutcome({
        date: '2026-01-16',
        energyScore: 45,
        outcomeRating: 'poor',
        activities: ['decision'],
        dealsClosed: 0,
        revenue: 0,
        notes: '',
        followedAdvice: false,
        createdAt: new Date().toISOString()
      });

      const analysis = await analyzePatterns();
      
      expect(analysis.followedAdviceStats.followed.count).toBe(1);
      expect(analysis.followedAdviceStats.followed.successRate).toBe(100);
      expect(analysis.followedAdviceStats.ignored.count).toBe(1);
      expect(analysis.followedAdviceStats.ignored.successRate).toBe(0);
    });

    it('should calculate correlation between energy and outcomes', async () => {
      // Perfect positive correlation
      await logDailyOutcome({
        date: '2026-01-15',
        energyScore: 90,
        outcomeRating: 'excellent',
        activities: ['meeting'],
        dealsClosed: 2,
        revenue: 50000,
        notes: '',
        followedAdvice: true,
        createdAt: new Date().toISOString()
      });

      await logDailyOutcome({
        date: '2026-01-16',
        energyScore: 40,
        outcomeRating: 'poor',
        activities: ['decision'],
        dealsClosed: 0,
        revenue: 0,
        notes: '',
        followedAdvice: true,
        createdAt: new Date().toISOString()
      });

      const analysis = await analyzePatterns();
      
      // Correlation should be positive (close to 1)
      expect(analysis.correlation).toBeGreaterThan(0.5);
    });
  });

  describe('clearAllOutcomes', () => {
    it('should remove all outcomes', async () => {
      await logDailyOutcome({
        date: '2026-01-15',
        energyScore: 85,
        outcomeRating: 'excellent',
        activities: ['meeting'],
        dealsClosed: 1,
        revenue: 10000,
        notes: '',
        followedAdvice: true,
        createdAt: new Date().toISOString()
      });

      await clearAllOutcomes();
      const outcomes = await getAllOutcomes();
      
      expect(outcomes).toHaveLength(0);
    });
  });
});

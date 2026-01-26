import { describe, it, expect } from 'vitest';

/**
 * Standalone Promo Code Validation Tests
 * Tests the validation logic without React Native dependencies
 */

describe('Promo Code Validation (Standalone)', () => {
  const ADMIN_UNLOCK_CODE = "ENERGY2026PRO";

  // Replicate the validation logic from admin-unlock.ts
  function validateAdminCode(code: string): boolean {
    return code.trim().toUpperCase() === ADMIN_UNLOCK_CODE;
  }

  describe('Valid Codes', () => {
    it('should accept exact correct code', () => {
      expect(validateAdminCode('ENERGY2026PRO')).toBe(true);
    });

    it('should accept lowercase code (case-insensitive)', () => {
      expect(validateAdminCode('energy2026pro')).toBe(true);
    });

    it('should accept mixed case code', () => {
      expect(validateAdminCode('Energy2026Pro')).toBe(true);
    });

    it('should accept code with leading spaces', () => {
      expect(validateAdminCode('  ENERGY2026PRO')).toBe(true);
    });

    it('should accept code with trailing spaces', () => {
      expect(validateAdminCode('ENERGY2026PRO  ')).toBe(true);
    });

    it('should accept code with both leading and trailing spaces', () => {
      expect(validateAdminCode('  ENERGY2026PRO  ')).toBe(true);
    });
  });

  describe('Invalid Codes', () => {
    it('should reject empty string', () => {
      expect(validateAdminCode('')).toBe(false);
    });

    it('should reject only spaces', () => {
      expect(validateAdminCode('   ')).toBe(false);
    });

    it('should reject wrong code', () => {
      expect(validateAdminCode('WRONGCODE')).toBe(false);
    });

    it('should reject code with spaces in middle', () => {
      expect(validateAdminCode('ENERGY 2026 PRO')).toBe(false);
    });

    it('should reject code with dashes', () => {
      expect(validateAdminCode('ENERGY-2026-PRO')).toBe(false);
    });

    it('should reject code with underscores', () => {
      expect(validateAdminCode('ENERGY_2026_PRO')).toBe(false);
    });

    it('should reject partial code', () => {
      expect(validateAdminCode('ENERGY2026')).toBe(false);
    });

    it('should reject code with extra characters', () => {
      expect(validateAdminCode('ENERGY2026PROEXTRA')).toBe(false);
    });

    it('should reject similar but wrong code', () => {
      expect(validateAdminCode('ENERGY2025PRO')).toBe(false);
    });

    it('should reject code with special characters', () => {
      expect(validateAdminCode('ENERGY@2026#PRO')).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long strings', () => {
      const longCode = 'ENERGY2026PRO' + 'X'.repeat(1000);
      expect(validateAdminCode(longCode)).toBe(false);
    });

    it('should handle tab characters', () => {
      expect(validateAdminCode('\tENERGY2026PRO\t')).toBe(true);
    });

    it('should handle newline characters', () => {
      expect(validateAdminCode('\nENERGY2026PRO\n')).toBe(true);
    });

    it('should handle mixed whitespace', () => {
      expect(validateAdminCode(' \t\nENERGY2026PRO\n\t ')).toBe(true);
    });
  });

  describe('Security', () => {
    it('should not accept null or undefined (TypeScript prevents this)', () => {
      // TypeScript would catch this at compile time
      // But if someone bypasses types, the function would throw
      expect(() => validateAdminCode(null as any)).toThrow();
    });

    it('should be deterministic', () => {
      // Same input should always give same output
      const code = 'ENERGY2026PRO';
      expect(validateAdminCode(code)).toBe(true);
      expect(validateAdminCode(code)).toBe(true);
      expect(validateAdminCode(code)).toBe(true);
    });
  });
});

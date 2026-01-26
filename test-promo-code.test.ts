/**
 * Test: Promo Code Functionality
 * 
 * Verifies that the admin unlock code system works correctly
 */

import { describe, it, expect, beforeEach } from "vitest";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  validateAdminCode,
  unlockProWithAdminCode,
  isProUnlockedByAdmin,
  removeAdminUnlock,
  getAdminUnlockCode,
} from "./lib/admin-unlock";

describe("Promo Code System", () => {
  beforeEach(async () => {
    // Clear AsyncStorage before each test
    await AsyncStorage.clear();
  });

  it("should validate correct admin code", () => {
    const validCode = "ENERGY2026PRO";
    expect(validateAdminCode(validCode)).toBe(true);
  });

  it("should validate correct admin code (lowercase)", () => {
    const validCode = "energy2026pro";
    expect(validateAdminCode(validCode)).toBe(true);
  });

  it("should validate correct admin code (with spaces)", () => {
    const validCode = "  ENERGY2026PRO  ";
    expect(validateAdminCode(validCode)).toBe(true);
  });

  it("should reject invalid admin code", () => {
    const invalidCode = "WRONGCODE";
    expect(validateAdminCode(invalidCode)).toBe(false);
  });

  it("should reject empty code", () => {
    expect(validateAdminCode("")).toBe(false);
  });

  it("should unlock Pro with correct admin code", async () => {
    const validCode = "ENERGY2026PRO";
    const success = await unlockProWithAdminCode(validCode);
    
    expect(success).toBe(true);
    
    // Verify Pro is unlocked
    const isUnlocked = await isProUnlockedByAdmin();
    expect(isUnlocked).toBe(true);
  });

  it("should not unlock Pro with incorrect admin code", async () => {
    const invalidCode = "WRONGCODE";
    const success = await unlockProWithAdminCode(invalidCode);
    
    expect(success).toBe(false);
    
    // Verify Pro is NOT unlocked
    const isUnlocked = await isProUnlockedByAdmin();
    expect(isUnlocked).toBe(false);
  });

  it("should return false when Pro is not unlocked", async () => {
    const isUnlocked = await isProUnlockedByAdmin();
    expect(isUnlocked).toBe(false);
  });

  it("should remove admin unlock", async () => {
    // First unlock Pro
    await unlockProWithAdminCode("ENERGY2026PRO");
    expect(await isProUnlockedByAdmin()).toBe(true);
    
    // Then remove unlock
    await removeAdminUnlock();
    expect(await isProUnlockedByAdmin()).toBe(false);
  });

  it("should return the admin unlock code", () => {
    const code = getAdminUnlockCode();
    expect(code).toBe("ENERGY2026PRO");
  });

  it("should persist Pro unlock across checks", async () => {
    // Unlock Pro
    await unlockProWithAdminCode("ENERGY2026PRO");
    
    // Check multiple times
    expect(await isProUnlockedByAdmin()).toBe(true);
    expect(await isProUnlockedByAdmin()).toBe(true);
    expect(await isProUnlockedByAdmin()).toBe(true);
  });

  it("should handle case-insensitive code validation", async () => {
    const codes = [
      "ENERGY2026PRO",
      "energy2026pro",
      "Energy2026Pro",
      "eNeRgY2026pRo",
    ];
    
    for (const code of codes) {
      await AsyncStorage.clear();
      const success = await unlockProWithAdminCode(code);
      expect(success).toBe(true);
      expect(await isProUnlockedByAdmin()).toBe(true);
    }
  });
});

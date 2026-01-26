/**
 * VIP Gift Code Generator
 * 
 * Utility to generate unique gift codes for influencers, partners, and VIPs.
 * Each code is one-time use, 30 days Pro access, with personalized messages.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

const VIP_CODES_KEY = "@energy_today_vip_codes";

export interface VIPGiftCode {
  code: string;
  recipientName: string;
  recipientType: "influencer" | "partner" | "vip" | "press";
  durationDays: number;
  createdAt: string;
  redeemedAt: string | null;
  redeemedBy: string | null; // Device ID or user ID
  message: string;
  notes?: string; // Internal notes about this recipient
}

/**
 * Generate a unique VIP gift code
 */
export function generateVIPCode(recipientName: string): string {
  // Format: VIP-FIRSTNAME-XXXX
  // Example: VIP-JOHN-A7K9
  const firstName = recipientName.split(" ")[0].toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `VIP-${firstName}-${random}`;
}

/**
 * Create a new VIP gift code
 */
export async function createVIPGiftCode(params: {
  recipientName: string;
  recipientType: "influencer" | "partner" | "vip" | "press";
  durationDays?: number;
  customMessage?: string;
  notes?: string;
}): Promise<VIPGiftCode> {
  const code = generateVIPCode(params.recipientName);
  const durationDays = params.durationDays || 30;
  
  const defaultMessages = {
    influencer: `Hi ${params.recipientName}! Thank you for your support. Enjoy ${durationDays} days of Pro access to Energy Today.`,
    partner: `Welcome ${params.recipientName}! As our valued partner, enjoy ${durationDays} days of Pro access to Energy Today.`,
    vip: `Dear ${params.recipientName}, thank you for being part of our journey. Enjoy ${durationDays} days of Pro access to Energy Today.`,
    press: `Hi ${params.recipientName}, thank you for your interest in Energy Today. Enjoy ${durationDays} days of Pro access for your review.`,
  };
  
  const vipCode: VIPGiftCode = {
    code,
    recipientName: params.recipientName,
    recipientType: params.recipientType,
    durationDays,
    createdAt: new Date().toISOString(),
    redeemedAt: null,
    redeemedBy: null,
    message: params.customMessage || defaultMessages[params.recipientType],
    notes: params.notes,
  };
  
  // Save to storage
  await saveVIPCode(vipCode);
  
  return vipCode;
}

/**
 * Save VIP code to storage
 */
async function saveVIPCode(vipCode: VIPGiftCode): Promise<void> {
  try {
    const codes = await getAllVIPCodes();
    codes.push(vipCode);
    await AsyncStorage.setItem(VIP_CODES_KEY, JSON.stringify(codes));
  } catch (error) {
    console.error("Failed to save VIP code:", error);
    throw error;
  }
}

/**
 * Get all VIP codes
 */
export async function getAllVIPCodes(): Promise<VIPGiftCode[]> {
  try {
    const stored = await AsyncStorage.getItem(VIP_CODES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to get VIP codes:", error);
    return [];
  }
}

/**
 * Get a specific VIP code
 */
export async function getVIPCode(code: string): Promise<VIPGiftCode | null> {
  const codes = await getAllVIPCodes();
  return codes.find((c) => c.code === code) || null;
}

/**
 * Mark VIP code as redeemed
 */
export async function markVIPCodeRedeemed(
  code: string,
  redeemedBy: string
): Promise<void> {
  try {
    const codes = await getAllVIPCodes();
    const codeIndex = codes.findIndex((c) => c.code === code);
    
    if (codeIndex !== -1) {
      codes[codeIndex].redeemedAt = new Date().toISOString();
      codes[codeIndex].redeemedBy = redeemedBy;
      await AsyncStorage.setItem(VIP_CODES_KEY, JSON.stringify(codes));
    }
  } catch (error) {
    console.error("Failed to mark VIP code as redeemed:", error);
    throw error;
  }
}

/**
 * Check if VIP code is valid and available
 */
export async function isVIPCodeAvailable(code: string): Promise<boolean> {
  const vipCode = await getVIPCode(code);
  return vipCode !== null && vipCode.redeemedAt === null;
}

/**
 * Get VIP code statistics
 */
export async function getVIPCodeStats(): Promise<{
  total: number;
  redeemed: number;
  available: number;
  byType: Record<string, { total: number; redeemed: number }>;
}> {
  const codes = await getAllVIPCodes();
  
  const stats = {
    total: codes.length,
    redeemed: codes.filter((c) => c.redeemedAt !== null).length,
    available: codes.filter((c) => c.redeemedAt === null).length,
    byType: {} as Record<string, { total: number; redeemed: number }>,
  };
  
  // Calculate stats by type
  codes.forEach((code) => {
    if (!stats.byType[code.recipientType]) {
      stats.byType[code.recipientType] = { total: 0, redeemed: 0 };
    }
    stats.byType[code.recipientType].total++;
    if (code.redeemedAt) {
      stats.byType[code.recipientType].redeemed++;
    }
  });
  
  return stats;
}

/**
 * Export VIP codes as CSV
 */
export async function exportVIPCodesCSV(): Promise<string> {
  const codes = await getAllVIPCodes();
  
  const headers = [
    "Code",
    "Recipient Name",
    "Type",
    "Duration (days)",
    "Created At",
    "Redeemed At",
    "Redeemed By",
    "Status",
    "Notes",
  ];
  
  const rows = codes.map((code) => [
    code.code,
    code.recipientName,
    code.recipientType,
    code.durationDays.toString(),
    new Date(code.createdAt).toLocaleString(),
    code.redeemedAt ? new Date(code.redeemedAt).toLocaleString() : "Not redeemed",
    code.redeemedBy || "N/A",
    code.redeemedAt ? "Redeemed" : "Available",
    code.notes || "",
  ]);
  
  const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
  return csv;
}

/**
 * Batch create VIP codes
 */
export async function batchCreateVIPCodes(
  recipients: Array<{
    name: string;
    type: "influencer" | "partner" | "vip" | "press";
    notes?: string;
  }>
): Promise<VIPGiftCode[]> {
  const codes: VIPGiftCode[] = [];
  
  for (const recipient of recipients) {
    const code = await createVIPGiftCode({
      recipientName: recipient.name,
      recipientType: recipient.type,
      notes: recipient.notes,
    });
    codes.push(code);
  }
  
  return codes;
}

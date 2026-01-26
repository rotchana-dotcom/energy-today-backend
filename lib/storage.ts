import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserProfile, JournalEntry, SubscriptionStatus } from "@/types";

const KEYS = {
  USER_PROFILE: "@energy_today:user_profile",
  JOURNAL_ENTRIES: "@energy_today:journal_entries",
  SUBSCRIPTION: "@energy_today:subscription",
};

// User Profile
export async function saveUserProfile(profile: UserProfile): Promise<void> {
  try {
    const jsonString = JSON.stringify(profile);
    await AsyncStorage.setItem(KEYS.USER_PROFILE, jsonString);
    console.log('[Storage] Profile saved successfully:', profile.name);
    
    // Verify save by reading back immediately
    const verification = await AsyncStorage.getItem(KEYS.USER_PROFILE);
    if (!verification) {
      console.error('[Storage] WARNING: Profile save verification failed!');
      throw new Error('Profile save verification failed');
    }
  } catch (error) {
    console.error('[Storage] Error saving profile:', error);
    throw error;
  }
}

export async function getUserProfile(): Promise<UserProfile | null> {
  try {
    const data = await AsyncStorage.getItem(KEYS.USER_PROFILE);
    if (data) {
      const profile = JSON.parse(data);
      console.log('[Storage] Profile loaded successfully:', profile.name);
      return profile;
    } else {
      console.log('[Storage] No profile found in storage');
      return null;
    }
  } catch (error) {
    console.error('[Storage] Error loading profile:', error);
    return null;
  }
}

export async function clearUserProfile(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.USER_PROFILE);
}

// Journal Entries
export async function saveJournalEntry(entry: JournalEntry): Promise<void> {
  const entries = await getJournalEntries();
  entries.push(entry);
  await AsyncStorage.setItem(KEYS.JOURNAL_ENTRIES, JSON.stringify(entries));
}

export async function getJournalEntries(): Promise<JournalEntry[]> {
  const data = await AsyncStorage.getItem(KEYS.JOURNAL_ENTRIES);
  return data ? JSON.parse(data) : [];
}

export async function getJournalEntryByDate(date: string): Promise<JournalEntry | null> {
  const entries = await getJournalEntries();
  return entries.find((e) => e.date === date) || null;
}

export async function updateJournalEntry(id: string, updates: Partial<JournalEntry>): Promise<void> {
  const entries = await getJournalEntries();
  const index = entries.findIndex((e) => e.id === id);
  if (index !== -1) {
    entries[index] = { ...entries[index], ...updates };
    await AsyncStorage.setItem(KEYS.JOURNAL_ENTRIES, JSON.stringify(entries));
  }
}

export async function deleteJournalEntry(id: string): Promise<void> {
  const entries = await getJournalEntries();
  const filtered = entries.filter((e) => e.id !== id);
  await AsyncStorage.setItem(KEYS.JOURNAL_ENTRIES, JSON.stringify(filtered));
}

// Subscription Status (Legacy - kept for backward compatibility)
export async function saveSubscriptionStatus(status: SubscriptionStatus): Promise<void> {
  await AsyncStorage.setItem(KEYS.SUBSCRIPTION, JSON.stringify(status));
}

// DEPRECATED: Use getSubscriptionStatus from @/lib/subscription-status instead
// This function only checks AsyncStorage, not database or admin code
export async function getSubscriptionStatus(): Promise<SubscriptionStatus> {
  const data = await AsyncStorage.getItem(KEYS.SUBSCRIPTION);
  return data ? JSON.parse(data) : { isPro: false };
}

export async function isProUser(): Promise<boolean> {
  const status = await getSubscriptionStatus();
  return status.isPro;
}

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile } from '@/types';
import { getUserProfile, saveUserProfile as saveToStorage } from '@/lib/storage';

interface ProfileContextType {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile | null) => void;
  saveProfile: (profile: UserProfile) => Promise<void>;
  isLoading: boolean;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load profile from AsyncStorage on mount
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const storedProfile = await getUserProfile();
      setProfile(storedProfile);
    } catch (error) {
      console.error('[ProfileContext] Failed to load profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveProfile = async (newProfile: UserProfile) => {
    // Save to AsyncStorage first
    await saveToStorage(newProfile);
    // Then immediately update context (no waiting for AsyncStorage!)
    setProfile(newProfile);
  };

  return (
    <ProfileContext.Provider value={{ profile, setProfile, saveProfile, isLoading }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}

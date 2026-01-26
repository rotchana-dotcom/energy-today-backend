/**
 * Team Members Management
 * 
 * Store and retrieve saved team members for quick collaboration
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

export interface SavedTeamMember {
  id: string;
  name: string;
  dateOfBirth: string;
  placeOfBirth: string;
  lastCollaborated?: string;
  collaborationCount: number;
  notes?: string;
}

const STORAGE_KEY = "saved_team_members";

export async function saveTeamMember(member: Omit<SavedTeamMember, "id" | "collaborationCount">): Promise<SavedTeamMember> {
  try {
    const existing = await getTeamMembers();
    
    // Check if member already exists (by name and DOB)
    const existingMember = existing.find(
      (m) => m.name === member.name && m.dateOfBirth === member.dateOfBirth
    );

    if (existingMember) {
      // Update existing member
      existingMember.placeOfBirth = member.placeOfBirth;
      existingMember.notes = member.notes;
      existingMember.lastCollaborated = new Date().toISOString();
      existingMember.collaborationCount += 1;
      
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
      return existingMember;
    } else {
      // Add new member
      const newMember: SavedTeamMember = {
        ...member,
        id: `member-${Date.now()}`,
        collaborationCount: 1,
        lastCollaborated: new Date().toISOString(),
      };
      
      const updated = [newMember, ...existing];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return newMember;
    }
  } catch (error) {
    console.error("Failed to save team member:", error);
    throw error;
  }
}

export async function getTeamMembers(): Promise<SavedTeamMember[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    
    const members: SavedTeamMember[] = JSON.parse(data);
    // Sort by last collaborated (most recent first)
    return members.sort((a, b) => {
      const dateA = a.lastCollaborated ? new Date(a.lastCollaborated).getTime() : 0;
      const dateB = b.lastCollaborated ? new Date(b.lastCollaborated).getTime() : 0;
      return dateB - dateA;
    });
  } catch (error) {
    console.error("Failed to load team members:", error);
    return [];
  }
}

export async function updateTeamMember(id: string, updates: Partial<SavedTeamMember>): Promise<void> {
  try {
    const existing = await getTeamMembers();
    const index = existing.findIndex((m) => m.id === id);
    
    if (index === -1) {
      throw new Error("Team member not found");
    }
    
    existing[index] = { ...existing[index], ...updates };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch (error) {
    console.error("Failed to update team member:", error);
    throw error;
  }
}

export async function deleteTeamMember(id: string): Promise<void> {
  try {
    const existing = await getTeamMembers();
    const updated = existing.filter((m) => m.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to delete team member:", error);
    throw error;
  }
}

export async function incrementCollaboration(id: string): Promise<void> {
  try {
    const existing = await getTeamMembers();
    const member = existing.find((m) => m.id === id);
    
    if (member) {
      member.collaborationCount += 1;
      member.lastCollaborated = new Date().toISOString();
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    }
  } catch (error) {
    console.error("Failed to increment collaboration:", error);
  }
}

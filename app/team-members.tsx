/**
 * Team Members Management Screen
 * 
 * Manage saved team members for quick collaboration
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import {
  getTeamMembers,
  deleteTeamMember,
  updateTeamMember,
  type SavedTeamMember,
} from "@/lib/team-members";

export default function TeamMembersScreen() {
  const [members, setMembers] = useState<SavedTeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState("");

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const teamMembers = await getTeamMembers();
      setMembers(teamMembers);
    } catch (error) {
      console.error("Failed to load team members:", error);
      Alert.alert("Error", "Failed to load team members");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (member: SavedTeamMember) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    Alert.alert(
      "Delete Team Member",
      `Remove ${member.name} from saved team members?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteTeamMember(member.id);
              await loadMembers();
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              console.error("Delete error:", error);
              Alert.alert("Error", "Failed to delete team member");
            }
          },
        },
      ]
    );
  };

  const handleEdit = (member: SavedTeamMember) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditingId(member.id);
    setEditNotes(member.notes || "");
  };

  const handleSaveEdit = async (memberId: string) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await updateTeamMember(memberId, { notes: editNotes });
      await loadMembers();
      setEditingId(null);
      setEditNotes("");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Update error:", error);
      Alert.alert("Error", "Failed to update team member");
    }
  };

  const handleCancelEdit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditingId(null);
    setEditNotes("");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-border">
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/(tabs)/more');
          }}
          className="py-2"
        >
          <Text className="text-primary text-base">← Back</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-foreground">Team Members</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView className="flex-1">
        {loading ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#0a7ea4" />
            <Text className="text-muted mt-4">Loading team members...</Text>
          </View>
        ) : members.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20 px-6">
            <Text className="text-6xl mb-4">👥</Text>
            <Text className="text-xl font-semibold text-foreground mb-2">No Saved Members</Text>
            <Text className="text-sm text-muted text-center mb-6">
              Team members will be saved automatically when you collaborate with them in Team Sync
            </Text>
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push("/team-sync" as any);
              }}
              className="bg-primary px-6 py-3 rounded-full"
            >
              <Text className="text-background font-semibold">Go to Team Sync</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="p-6 gap-4">
            {/* Info Banner */}
            <View className="bg-primary/10 rounded-xl p-4 border border-primary/30">
              <Text className="text-sm text-foreground">
                💡 <Text className="font-medium">Quick Tip:</Text> Saved team members can be quickly selected in Team Sync for faster collaboration analysis.
              </Text>
            </View>

            {/* Members List */}
            {members.map((member) => (
              <View
                key={member.id}
                className="bg-surface rounded-2xl p-5 border border-border gap-4"
              >
                {/* Member Info */}
                <View className="gap-2">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-lg font-bold text-foreground">{member.name}</Text>
                    <View className="bg-primary/10 px-3 py-1 rounded-full">
                      <Text className="text-xs font-medium text-primary">
                        {member.collaborationCount} {member.collaborationCount === 1 ? "session" : "sessions"}
                      </Text>
                    </View>
                  </View>

                  <View className="gap-1">
                    <Text className="text-sm text-muted">
                      📅 Born: {formatDate(member.dateOfBirth)}
                    </Text>
                    <Text className="text-sm text-muted">
                      📍 {member.placeOfBirth}
                    </Text>
                    {member.lastCollaborated && (
                      <Text className="text-xs text-muted">
                        Last collaborated: {formatDate(member.lastCollaborated)}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Notes Section */}
                {editingId === member.id ? (
                  <View className="gap-2">
                    <Text className="text-xs text-muted">NOTES</Text>
                    <TextInput
                      value={editNotes}
                      onChangeText={setEditNotes}
                      placeholder="Add notes about this team member..."
                      multiline
                      numberOfLines={3}
                      className="bg-background rounded-xl p-3 text-sm text-foreground border border-border"
                      placeholderTextColor="#9BA1A6"
                    />
                    <View className="flex-row gap-2">
                      <TouchableOpacity
                        onPress={() => handleSaveEdit(member.id)}
                        className="flex-1 bg-primary py-2 rounded-xl items-center"
                      >
                        <Text className="text-background font-medium text-sm">Save</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={handleCancelEdit}
                        className="flex-1 bg-surface border border-border py-2 rounded-xl items-center"
                      >
                        <Text className="text-foreground font-medium text-sm">Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : member.notes ? (
                  <View className="bg-background rounded-xl p-3 border border-border">
                    <Text className="text-xs text-muted mb-1">NOTES</Text>
                    <Text className="text-sm text-foreground">{member.notes}</Text>
                  </View>
                ) : null}

                {/* Actions */}
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={() => handleEdit(member)}
                    className="flex-1 bg-primary/10 py-2 rounded-xl items-center"
                  >
                    <Text className="text-primary font-medium text-sm">
                      {member.notes ? "Edit Notes" : "Add Notes"}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={() => handleDelete(member)}
                    className="bg-error/10 py-2 px-4 rounded-xl items-center"
                  >
                    <Text className="text-error font-medium text-sm">Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

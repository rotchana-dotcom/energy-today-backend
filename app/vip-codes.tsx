import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import {
  createVIPGiftCode,
  getAllVIPCodes,
  getVIPCodeStats,
  exportVIPCodesCSV,
  type VIPGiftCode,
} from "@/lib/vip-gift-codes";
import * as Clipboard from "expo-clipboard";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

export default function VIPCodesScreen() {
  const [loading, setLoading] = useState(true);
  const [codes, setCodes] = useState<VIPGiftCode[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Form state
  const [recipientName, setRecipientName] = useState("");
  const [recipientType, setRecipientType] = useState<"influencer" | "partner" | "vip" | "press">("influencer");
  const [notes, setNotes] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const allCodes = await getAllVIPCodes();
    const codeStats = await getVIPCodeStats();
    setCodes(allCodes);
    setStats(codeStats);
    setLoading(false);
  };

  const handleCreateCode = async () => {
    if (!recipientName.trim()) {
      Alert.alert("Error", "Please enter a recipient name");
      return;
    }

    setCreating(true);
    try {
      const newCode = await createVIPGiftCode({
        recipientName: recipientName.trim(),
        recipientType,
        notes: notes.trim() || undefined,
      });

      Alert.alert(
        "VIP Code Created!",
        `Code: ${newCode.code}\n\nCopied to clipboard!`,
        [{ text: "OK" }]
      );

      await Clipboard.setStringAsync(newCode.code);

      // Reset form
      setRecipientName("");
      setNotes("");
      setShowCreateForm(false);

      // Reload data
      await loadData();
    } catch (error) {
      console.error("Failed to create VIP code:", error);
      Alert.alert("Error", "Failed to create VIP code");
    } finally {
      setCreating(false);
    }
  };

  const handleCopyCode = async (code: string) => {
    await Clipboard.setStringAsync(code);
    Alert.alert("Copied!", `Code ${code} copied to clipboard`);
  };

  const handleExport = async () => {
    try {
      const csv = await exportVIPCodesCSV();
      const filename = `vip_codes_${new Date().toISOString().split("T")[0]}.csv`;
      const fileUri = `${FileSystem.documentDirectory}${filename}`;

      await FileSystem.writeAsStringAsync(fileUri, csv, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "text/csv",
          dialogTitle: "Export VIP Codes",
        });
      } else {
        Alert.alert("Success", `VIP codes exported to: ${fileUri}`);
      }
    } catch (error) {
      console.error("Failed to export:", error);
      Alert.alert("Error", "Failed to export VIP codes");
    }
  };

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color="#0A7EA4" />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          {/* Header */}
          <View className="flex-row items-center justify-between">
            <Text className="text-2xl font-bold text-foreground">VIP Gift Codes</Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text className="text-xl text-foreground">✕</Text>
            </TouchableOpacity>
          </View>

          {/* Stats */}
          {stats && (
            <View className="bg-surface rounded-2xl p-5 border border-border gap-3">
              <Text className="text-sm font-medium text-muted mb-2">STATISTICS</Text>

              <View className="flex-row justify-between">
                <Text className="text-xs text-muted">Total Codes</Text>
                <Text className="text-base font-semibold text-foreground">{stats.total}</Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-xs text-muted">Redeemed</Text>
                <Text className="text-base font-semibold text-success">{stats.redeemed}</Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-xs text-muted">Available</Text>
                <Text className="text-base font-semibold text-primary">{stats.available}</Text>
              </View>
            </View>
          )}

          {/* Create Form */}
          {showCreateForm ? (
            <View className="bg-surface rounded-2xl p-5 border border-border gap-4">
              <Text className="text-sm font-medium text-muted">CREATE NEW VIP CODE</Text>

              <View className="gap-2">
                <Text className="text-xs text-muted">Recipient Name</Text>
                <TextInput
                  value={recipientName}
                  onChangeText={setRecipientName}
                  placeholder="e.g., John Smith"
                  placeholderTextColor="#9BA1A6"
                  className="bg-background border border-border rounded-lg px-4 py-3 text-foreground"
                />
              </View>

              <View className="gap-2">
                <Text className="text-xs text-muted">Type</Text>
                <View className="flex-row gap-2">
                  {(["influencer", "partner", "vip", "press"] as const).map((type) => (
                    <TouchableOpacity
                      key={type}
                      onPress={() => setRecipientType(type)}
                      className={`flex-1 py-2 rounded-lg border ${
                        recipientType === type
                          ? "bg-primary border-primary"
                          : "bg-background border-border"
                      }`}
                    >
                      <Text
                        className={`text-center text-xs font-medium ${
                          recipientType === type ? "text-white" : "text-foreground"
                        }`}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View className="gap-2">
                <Text className="text-xs text-muted">Notes (Optional)</Text>
                <TextInput
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Internal notes about this recipient"
                  placeholderTextColor="#9BA1A6"
                  multiline
                  numberOfLines={2}
                  className="bg-background border border-border rounded-lg px-4 py-3 text-foreground"
                />
              </View>

              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => setShowCreateForm(false)}
                  className="flex-1 border border-border py-3 rounded-lg active:opacity-60"
                >
                  <Text className="text-center font-medium text-foreground">Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleCreateCode}
                  disabled={creating}
                  className="flex-1 bg-primary py-3 rounded-lg active:opacity-80"
                >
                  {creating ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text className="text-center font-semibold text-white">Create Code</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => setShowCreateForm(true)}
              className="bg-primary py-3 rounded-lg active:opacity-80"
            >
              <Text className="text-center font-semibold text-white">+ Create New VIP Code</Text>
            </TouchableOpacity>
          )}

          {/* Export Button */}
          {codes.length > 0 && (
            <TouchableOpacity
              onPress={handleExport}
              className="border border-primary py-3 rounded-lg active:opacity-60"
            >
              <Text className="text-center font-semibold text-primary">Export All Codes (CSV)</Text>
            </TouchableOpacity>
          )}

          {/* Codes List */}
          {codes.length > 0 ? (
            <View className="gap-3">
              <Text className="text-sm font-medium text-muted">ALL VIP CODES</Text>

              {codes.map((code) => (
                <View
                  key={code.code}
                  className="bg-surface rounded-2xl p-4 border border-border gap-2"
                >
                  <View className="flex-row justify-between items-center">
                    <Text className="text-base font-bold text-foreground">{code.code}</Text>
                    <TouchableOpacity
                      onPress={() => handleCopyCode(code.code)}
                      className="bg-primary px-3 py-1 rounded active:opacity-80"
                    >
                      <Text className="text-xs font-medium text-white">Copy</Text>
                    </TouchableOpacity>
                  </View>

                  <Text className="text-sm text-foreground">{code.recipientName}</Text>

                  <View className="flex-row gap-2">
                    <View className="bg-background px-2 py-1 rounded">
                      <Text className="text-xs text-muted">{code.recipientType}</Text>
                    </View>
                    <View className="bg-background px-2 py-1 rounded">
                      <Text className="text-xs text-muted">{code.durationDays} days</Text>
                    </View>
                    <View
                      className={`px-2 py-1 rounded ${
                        code.redeemedAt ? "bg-success" : "bg-primary"
                      }`}
                    >
                      <Text className="text-xs text-white">
                        {code.redeemedAt ? "Redeemed" : "Available"}
                      </Text>
                    </View>
                  </View>

                  {code.notes && (
                    <Text className="text-xs text-muted italic">{code.notes}</Text>
                  )}

                  {code.redeemedAt && (
                    <Text className="text-xs text-muted">
                      Redeemed: {new Date(code.redeemedAt).toLocaleDateString()}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          ) : (
            <View className="items-center justify-center py-12">
              <Text className="text-muted text-center">
                No VIP codes created yet.{"\n"}Create your first code above!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

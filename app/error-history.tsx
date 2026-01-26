import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { getErrorReports, clearErrorReports, getErrorDescription } from "@/lib/error-reporting";

export default function ErrorHistoryScreen() {
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<any[]>([]);

  useEffect(() => {
    loadErrors();
  }, []);

  const loadErrors = async () => {
    const reports = await getErrorReports();
    setErrors(reports);
    setLoading(false);
  };

  const handleClearHistory = async () => {
    await clearErrorReports();
    setErrors([]);
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
            <TouchableOpacity onPress={() => router.back()}>
              <Text className="text-xl text-foreground">←</Text>
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-foreground">Error History</Text>
            <View style={{ width: 24 }} />
          </View>

          {errors.length === 0 ? (
            <View className="flex-1 items-center justify-center gap-4">
              <Text className="text-6xl">✅</Text>
              <Text className="text-xl font-semibold text-foreground text-center">
                No Errors Recorded
              </Text>
              <Text className="text-sm text-muted text-center px-8">
                Your app is running smoothly! Errors will appear here if any issues occur.
              </Text>
            </View>
          ) : (
            <>
              {/* Error List */}
              <View className="gap-4">
                {errors.slice().reverse().map((error, index) => (
                  <View
                    key={index}
                    className="bg-surface rounded-2xl p-4 border border-border gap-3"
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="bg-error/20 px-3 py-1 rounded-full">
                        <Text className="text-xs font-bold text-error">
                          Error #{error.errorCode}
                        </Text>
                      </View>
                      <Text className="text-xs text-muted">
                        {new Date(error.timestamp).toLocaleString()}
                      </Text>
                    </View>

                    <Text className="text-sm font-medium text-foreground">
                      {getErrorDescription(error.errorCode)}
                    </Text>

                    {error.userDescription && (
                      <View className="bg-background rounded-lg p-3">
                        <Text className="text-xs text-muted mb-1">Your Note:</Text>
                        <Text className="text-sm text-foreground">
                          {error.userDescription}
                        </Text>
                      </View>
                    )}

                    <View className="flex-row gap-2 flex-wrap">
                      <View className="bg-background px-2 py-1 rounded">
                        <Text className="text-xs text-muted">
                          {error.deviceInfo.platform} {error.deviceInfo.osVersion}
                        </Text>
                      </View>
                      <View className="bg-background px-2 py-1 rounded">
                        <Text className="text-xs text-muted">
                          v{error.appVersion}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>

              {/* Clear History Button */}
              <TouchableOpacity
                onPress={handleClearHistory}
                className="border border-error py-3 rounded-lg active:opacity-60 mt-4"
              >
                <Text className="text-center font-medium text-error">
                  Clear Error History
                </Text>
              </TouchableOpacity>
            </>
          )}

          {/* Help Text */}
          <View className="bg-primary/10 rounded-lg p-4 gap-2">
            <Text className="text-sm font-semibold text-foreground">💡 About Error Codes</Text>
            <Text className="text-xs text-muted leading-relaxed">
              Error codes help our support team quickly identify and fix issues. When reporting a problem, please share the error code number (e.g., #101, #201) so we can assist you faster.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

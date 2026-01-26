import { useState } from "react";
import { View, Text, Pressable, Image, ScrollView, ActivityIndicator, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { readFileAsBase64 } from "@/lib/s3-upload";
import { addMeal } from "@/lib/nutrition-tracking";

export default function MealPhotoScreen() {
  const colors = useColors();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const analyzePhotoMutation = trpc.mealPhoto.analyzePhoto.useMutation();
  const getSuggestionsMutation = trpc.mealPhoto.getSuggestions.useMutation();

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Please grant photo library access to analyze meals.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setImageUri(result.assets[0].uri);
      setResult(null);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Please grant camera access to take meal photos.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setImageUri(result.assets[0].uri);
      setResult(null);
    }
  };

  const analyzeMeal = async () => {
    if (!imageUri) return;

    setAnalyzing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // Upload image to S3
      const base64Data = await readFileAsBase64(imageUri);
      const uploadMutation = trpc.upload.uploadFile.useMutation();
      const uploadResult = await uploadMutation.mutateAsync({
        fileData: base64Data,
        fileName: `meal-${Date.now()}.jpg`,
        mimeType: "image/jpeg",
      });
      const s3Url = uploadResult.url;

      // Analyze with AI
      const analysis = await analyzePhotoMutation.mutateAsync({
        imageUrl: s3Url,
      });

      // Get nutritional suggestions
      const suggestions = await getSuggestionsMutation.mutateAsync({
        foods: analysis.foods,
      });

      setResult({ ...analysis, ...suggestions });

      // Save to nutrition log
      await addMeal({
        date: new Date().toISOString().split("T")[0],
        time: new Date().toISOString(),
        type: "lunch",
        foods: analysis.foods.map((f: any) => ({
          name: f.name,
          calories: f.calories,
          protein: f.protein,
          carbs: f.carbs,
          fats: f.fats,
          category: "snacks" as const,
        })),
        totalCalories: analysis.totalCalories,
        totalProtein: analysis.totalProtein,
        totalCarbs: analysis.totalCarbs,
        totalFats: analysis.totalFats,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Error analyzing meal:", error);
      Alert.alert("Analysis Failed", "Could not analyze the meal photo. Please try again.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView className="flex-1 p-4">
        <Text className="text-2xl font-bold text-foreground mb-2">Meal Photo Recognition</Text>
        <Text className="text-sm text-muted mb-6">
          Take or upload a photo of your meal for automatic nutritional analysis
        </Text>

        {/* Photo Selection */}
        {!imageUri ? (
          <View className="gap-4">
            <Pressable
              onPress={takePhoto}
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
                transform: [{ scale: pressed ? 0.97 : 1 }],
              })}
              className="bg-primary p-4 rounded-xl items-center"
            >
              <Text className="text-background font-semibold text-lg">📷 Take Photo</Text>
            </Pressable>

            <Pressable
              onPress={pickImage}
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
                transform: [{ scale: pressed ? 0.97 : 1 }],
              })}
              className="bg-surface border border-border p-4 rounded-xl items-center"
            >
              <Text className="text-foreground font-semibold text-lg">🖼️ Choose from Library</Text>
            </Pressable>
          </View>
        ) : (
          <View className="gap-4">
            {/* Image Preview */}
            <View className="bg-surface rounded-xl overflow-hidden border border-border">
              <Image source={{ uri: imageUri }} className="w-full h-64" resizeMode="cover" />
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-3">
              <Pressable
                onPress={() => {
                  setImageUri(null);
                  setResult(null);
                }}
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                className="flex-1 bg-surface border border-border p-3 rounded-xl items-center"
              >
                <Text className="text-foreground font-semibold">Change Photo</Text>
              </Pressable>

              <Pressable
                onPress={analyzeMeal}
                disabled={analyzing}
                style={({ pressed }) => ({
                  opacity: pressed || analyzing ? 0.7 : 1,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                })}
                className="flex-1 bg-primary p-3 rounded-xl items-center"
              >
                {analyzing ? (
                  <ActivityIndicator color={colors.background} />
                ) : (
                  <Text className="text-background font-semibold">Analyze Meal</Text>
                )}
              </Pressable>
            </View>
          </View>
        )}

        {/* Analysis Results */}
        {result && (
          <View className="mt-6 gap-4">
            {/* Nutritional Summary */}
            <View className="bg-surface rounded-xl p-4 border border-border">
              <Text className="text-lg font-bold text-foreground mb-3">Nutritional Summary</Text>
              <View className="gap-2">
                <View className="flex-row justify-between">
                  <Text className="text-muted">Total Calories</Text>
                  <Text className="text-foreground font-semibold">{result.totalCalories} kcal</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-muted">Protein</Text>
                  <Text className="text-foreground font-semibold">{result.totalProtein}g</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-muted">Carbs</Text>
                  <Text className="text-foreground font-semibold">{result.totalCarbs}g</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-muted">Fats</Text>
                  <Text className="text-foreground font-semibold">{result.totalFats}g</Text>
                </View>
              </View>
            </View>

            {/* Food Items */}
            <View className="bg-surface rounded-xl p-4 border border-border">
              <Text className="text-lg font-bold text-foreground mb-3">Detected Foods</Text>
              {result.foods.map((food: any, index: number) => (
                <View key={index} className="mb-3 pb-3 border-b border-border last:border-b-0 last:mb-0 last:pb-0">
                  <Text className="text-foreground font-semibold">{food.name}</Text>
                  <Text className="text-sm text-muted">{food.portion}</Text>
                  <View className="flex-row gap-3 mt-1">
                    <Text className="text-xs text-muted">{food.calories} cal</Text>
                    <Text className="text-xs text-muted">P: {food.protein}g</Text>
                    <Text className="text-xs text-muted">C: {food.carbs}g</Text>
                    <Text className="text-xs text-muted">F: {food.fats}g</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* AI Suggestions */}
            {result.analysis && (
              <View className="bg-surface rounded-xl p-4 border border-border">
                <Text className="text-lg font-bold text-foreground mb-3">AI Insights</Text>
                <View className="flex-row gap-3 mb-3">
                  <View className="flex-1 bg-background rounded-lg p-3 items-center">
                    <Text className="text-xs text-muted mb-1">Meal Quality</Text>
                    <Text className="text-2xl font-bold text-foreground">{result.mealQuality}/10</Text>
                  </View>
                  <View className="flex-1 bg-background rounded-lg p-3 items-center">
                    <Text className="text-xs text-muted mb-1">Energy Impact</Text>
                    <Text className="text-lg font-semibold text-foreground capitalize">
                      {result.energyImpact === "boost" ? "⚡ Boost" : "➡️ Neutral"}
                    </Text>
                  </View>
                </View>
                <Text className="text-sm text-foreground leading-relaxed">{result.analysis}</Text>
              </View>
            )}

            {/* Success Message */}
            <View className="bg-success/10 border border-success rounded-xl p-4">
              <Text className="text-success font-semibold text-center">
                ✅ Meal logged successfully!
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

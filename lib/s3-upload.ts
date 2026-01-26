/**
 * S3 Upload Helper
 * 
 * Uploads files to S3 using the backend upload endpoint
 */

import { Platform } from "react-native";
import * as FileSystem from "expo-file-system/legacy";

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Upload a file to S3 and get a public URL
 * 
 * Note: This helper provides the upload logic, but should be called via tRPC in React components:
 * 
 * const uploadMutation = trpc.upload.uploadFile.useMutation();
 * const result = await uploadMutation.mutateAsync({
 *   fileData: base64Data,
 *   fileName: "recording.m4a",
 *   mimeType: "audio/m4a",
 * });
 * 
 * @param fileUri - Local file URI (file:// or content://)
 * @returns Upload result with public URL
 */
export async function readFileAsBase64(fileUri: string): Promise<string> {
  try {
    // On web, we can't easily read files
    if (Platform.OS === "web") {
      throw new Error("File reading not supported on web");
    }

    // Read file as base64
    const base64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: "base64",
    });

    return base64;
  } catch (error) {
    console.error("File read error:", error);
    throw error;
  }
}

/**
 * Get file size in MB
 */
export async function getFileSizeMB(fileUri: string): Promise<number> {
  try {
    const info = await FileSystem.getInfoAsync(fileUri);
    if (info.exists && "size" in info) {
      return info.size / (1024 * 1024);
    }
    return 0;
  } catch (error) {
    console.error("Error getting file size:", error);
    return 0;
  }
}

/**
 * Get file name from URI
 */
export function getFileNameFromUri(fileUri: string): string {
  const parts = fileUri.split("/");
  return parts[parts.length - 1] || `file-${Date.now()}`;
}

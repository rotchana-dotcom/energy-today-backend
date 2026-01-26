import * as Linking from "expo-linking";
import * as ReactNative from "react-native";

// Extract scheme from bundle ID (last segment timestamp, prefixed with "manus")
// e.g., "space.manus.my.app.t20240115103045" -> "manus20240115103045"
const bundleId = "space.manus.energy_today.t20251227002435";
const timestamp = bundleId.split(".").pop()?.replace(/^t/, "") ?? "";
const schemeFromBundleId = `manus${timestamp}`;

const env = {
  portal: process.env.EXPO_PUBLIC_OAUTH_PORTAL_URL ?? "",
  server: process.env.EXPO_PUBLIC_OAUTH_SERVER_URL ?? "",
  appId: process.env.EXPO_PUBLIC_APP_ID ?? "",
  ownerId: process.env.EXPO_PUBLIC_OWNER_OPEN_ID ?? "",
  ownerName: process.env.EXPO_PUBLIC_OWNER_NAME ?? "",
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? "",
  deepLinkScheme: schemeFromBundleId,
};

export const OAUTH_PORTAL_URL = env.portal;
export const OAUTH_SERVER_URL = env.server;
export const APP_ID = env.appId;
export const OWNER_OPEN_ID = env.ownerId;
export const OWNER_NAME = env.ownerName;
export const API_BASE_URL = env.apiBaseUrl;

/**
 * Get the API base URL, supporting both local development and production deployment.
 * 
 * Priority:
 * 1. EXPO_PUBLIC_API_BASE_URL environment variable (production backend)
 * 2. Auto-detect from current hostname (local development)
 * 3. Empty string fallback (relative URL)
 * 
 * Production Setup:
 * Set EXPO_PUBLIC_API_BASE_URL in .env or EAS Secrets:
 * - Example: https://api.kea.today
 * - Example: https://your-backend.herokuapp.com
 * 
 * Local Development:
 * - Metro runs on 8081, API server runs on 3000
 * - URL pattern: https://PORT-sandboxid.region.domain
 * 
 * This allows deploying backend independently without frontend code changes.
 */
export function getApiBaseUrl(): string {
  // Priority 1: Use explicitly set API_BASE_URL (production backend)
  if (API_BASE_URL) {
    const cleanUrl = API_BASE_URL.replace(/\/$/, "");
    console.log("[API] Using configured backend:", cleanUrl);
    return cleanUrl;
  }

  // Priority 2: On web, derive from current hostname (local development)
  if (ReactNative.Platform.OS === "web" && typeof window !== "undefined" && window.location) {
    const { protocol, hostname } = window.location;
    // Pattern: 8081-sandboxid.region.domain -> 3000-sandboxid.region.domain
    const apiHostname = hostname.replace(/^8081-/, "3000-");
    if (apiHostname !== hostname) {
      const derivedUrl = `${protocol}//${apiHostname}`;
      console.log("[API] Using derived local backend:", derivedUrl);
      return derivedUrl;
    }
  }

  // Priority 3: Fallback to relative URL (will use same host as app)
  console.log("[API] Using relative URL (same host as app)");
  return "";
}

export const SESSION_TOKEN_KEY = "app_session_token";
export const USER_INFO_KEY = "manus-runtime-user-info";

const encodeState = (value: string) => {
  if (typeof globalThis.btoa === "function") {
    return globalThis.btoa(value);
  }
  const BufferImpl = (globalThis as Record<string, any>).Buffer;
  if (BufferImpl) {
    return BufferImpl.from(value, "utf-8").toString("base64");
  }
  return value;
};

export const getLoginUrl = () => {
  let redirectUri: string;

  if (ReactNative.Platform.OS === "web") {
    // Web platform: redirect to API server callback (not Metro bundler)
    // The API server will then redirect back to the frontend with the session token
    redirectUri = `${getApiBaseUrl()}/api/oauth/callback`;
  } else {
    // Native platform: use deep link scheme for mobile OAuth callback
    // This allows the OS to redirect back to the app after authentication
    redirectUri = Linking.createURL("/oauth/callback", {
      scheme: env.deepLinkScheme,
    });
  }

  const state = encodeState(redirectUri);

  const url = new URL(`${OAUTH_PORTAL_URL}/app-auth`);
  url.searchParams.set("appId", APP_ID);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};

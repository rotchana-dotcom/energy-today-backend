import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Network from "expo-network";
import { useEffect, useState } from "react";

const OFFLINE_QUEUE_KEY = "offline_queue";
const OFFLINE_CACHE_KEY = "offline_cache";
const SYNC_STATUS_KEY = "sync_status";

export type OperationType = "create" | "update" | "delete";

export interface PendingOperation {
  id: string;
  type: OperationType;
  resource: string; // e.g., "energy_reading", "habit", "meal"
  data: any;
  timestamp: string;
  retryCount: number;
  lastError?: string;
}

export interface SyncStatus {
  lastSyncAt?: string;
  isSyncing: boolean;
  pendingOperations: number;
  failedOperations: number;
  lastError?: string;
}

export interface OfflineCache {
  [key: string]: {
    data: any;
    timestamp: string;
    expiresAt?: string;
  };
}

export interface ConflictResolution {
  strategy: "local_wins" | "remote_wins" | "latest_wins" | "manual";
  localData: any;
  remoteData: any;
  resolvedData?: any;
}

/**
 * Initialize offline manager
 */
export async function initializeOfflineManager(): Promise<void> {
  // Check initial network status
  const networkState = await Network.getNetworkStateAsync();
  if (networkState.isConnected) {
    // Sync pending operations if online
    await syncPendingOperations();
  }
}

/**
 * Handle network status change
 */
async function handleNetworkChange(state: Network.NetworkState): Promise<void> {
  if (state.isConnected) {
    console.log("Network connected, syncing pending operations...");
    await syncPendingOperations();
  } else {
    console.log("Network disconnected, entering offline mode");
  }
}

/**
 * Check if device is online
 */
export async function isOnline(): Promise<boolean> {
  const state = await Network.getNetworkStateAsync();
  return state.isConnected === true;
}

/**
 * Use network status hook
 */
export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState(true);
  const [isInternetReachable, setIsInternetReachable] = useState(true);

  useEffect(() => {
    // Check network status periodically
    const checkNetwork = async () => {
      const state = await Network.getNetworkStateAsync();
      setIsConnected(state.isConnected === true);
      setIsInternetReachable(state.isInternetReachable === true);
    };

    checkNetwork();
    const interval = setInterval(checkNetwork, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return { isConnected, isInternetReachable };
}

/**
 * Queue operation for offline sync
 */
export async function queueOperation(
  type: OperationType,
  resource: string,
  data: any
): Promise<void> {
  try {
    const operation: PendingOperation = {
      id: `${resource}_${Date.now()}_${Math.random()}`,
      type,
      resource,
      data,
      timestamp: new Date().toISOString(),
      retryCount: 0,
    };

    const queueData = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    const queue: PendingOperation[] = queueData ? JSON.parse(queueData) : [];

    queue.push(operation);
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));

    // Update sync status
    await updateSyncStatus({ pendingOperations: queue.length });

    console.log(`Queued ${type} operation for ${resource}`);
  } catch (error) {
    console.error("Failed to queue operation:", error);
    throw error;
  }
}

/**
 * Get pending operations
 */
export async function getPendingOperations(): Promise<PendingOperation[]> {
  try {
    const data = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to get pending operations:", error);
    return [];
  }
}

/**
 * Sync pending operations
 */
export async function syncPendingOperations(): Promise<{
  success: number;
  failed: number;
}> {
  const online = await isOnline();
  if (!online) {
    console.log("Device is offline, skipping sync");
    return { success: 0, failed: 0 };
  }

  try {
    await updateSyncStatus({ isSyncing: true });

    const queue = await getPendingOperations();
    if (queue.length === 0) {
      await updateSyncStatus({ isSyncing: false });
      return { success: 0, failed: 0 };
    }

    console.log(`Syncing ${queue.length} pending operations...`);

    let successCount = 0;
    let failedCount = 0;
    const remainingQueue: PendingOperation[] = [];

    for (const operation of queue) {
      try {
        await executeOperation(operation);
        successCount++;
        console.log(`Synced ${operation.type} ${operation.resource}`);
      } catch (error) {
        failedCount++;
        operation.retryCount++;
        operation.lastError = error instanceof Error ? error.message : String(error);

        // Retry with exponential backoff (max 5 retries)
        if (operation.retryCount < 5) {
          remainingQueue.push(operation);
        } else {
          console.error(`Failed to sync ${operation.resource} after 5 retries`);
        }
      }
    }

    // Update queue with remaining operations
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remainingQueue));

    await updateSyncStatus({
      isSyncing: false,
      lastSyncAt: new Date().toISOString(),
      pendingOperations: remainingQueue.length,
      failedOperations: failedCount,
    });

    return { success: successCount, failed: failedCount };
  } catch (error) {
    console.error("Sync failed:", error);
    await updateSyncStatus({
      isSyncing: false,
      lastError: error instanceof Error ? error.message : String(error),
    });
    return { success: 0, failed: 0 };
  }
}

/**
 * Execute operation (sync with server)
 */
async function executeOperation(operation: PendingOperation): Promise<void> {
  // In production, this would make API calls to sync data
  // For now, simulate API call with delay
  
  await new Promise((resolve) => setTimeout(resolve, 100));
  
  // Simulate occasional failures for retry logic
  if (Math.random() < 0.1 && operation.retryCount === 0) {
    throw new Error("Simulated network error");
  }
  
  console.log(`Executed ${operation.type} on ${operation.resource}`);
}

/**
 * Retry failed operations
 */
export async function retryFailedOperations(): Promise<void> {
  const queue = await getPendingOperations();
  const failedOps = queue.filter((op) => op.lastError);
  
  if (failedOps.length === 0) {
    console.log("No failed operations to retry");
    return;
  }
  
  console.log(`Retrying ${failedOps.length} failed operations...`);
  await syncPendingOperations();
}

/**
 * Clear pending operations
 */
export async function clearPendingOperations(): Promise<void> {
  await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify([]));
  await updateSyncStatus({ pendingOperations: 0, failedOperations: 0 });
}

/**
 * Cache data for offline access
 */
export async function cacheData(
  key: string,
  data: any,
  expiresIn?: number // seconds
): Promise<void> {
  try {
    const cacheData = await AsyncStorage.getItem(OFFLINE_CACHE_KEY);
    const cache: OfflineCache = cacheData ? JSON.parse(cacheData) : {};

    const expiresAt = expiresIn
      ? new Date(Date.now() + expiresIn * 1000).toISOString()
      : undefined;

    cache[key] = {
      data,
      timestamp: new Date().toISOString(),
      expiresAt,
    };

    await AsyncStorage.setItem(OFFLINE_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error("Failed to cache data:", error);
  }
}

/**
 * Get cached data
 */
export async function getCachedData<T = any>(key: string): Promise<T | null> {
  try {
    const cacheData = await AsyncStorage.getItem(OFFLINE_CACHE_KEY);
    const cache: OfflineCache = cacheData ? JSON.parse(cacheData) : {};

    const cached = cache[key];
    if (!cached) {
      return null;
    }

    // Check if expired
    if (cached.expiresAt && new Date(cached.expiresAt) < new Date()) {
      delete cache[key];
      await AsyncStorage.setItem(OFFLINE_CACHE_KEY, JSON.stringify(cache));
      return null;
    }

    return cached.data as T;
  } catch (error) {
    console.error("Failed to get cached data:", error);
    return null;
  }
}

/**
 * Clear cache
 */
export async function clearCache(key?: string): Promise<void> {
  try {
    if (key) {
      const cacheData = await AsyncStorage.getItem(OFFLINE_CACHE_KEY);
      const cache: OfflineCache = cacheData ? JSON.parse(cacheData) : {};
      delete cache[key];
      await AsyncStorage.setItem(OFFLINE_CACHE_KEY, JSON.stringify(cache));
    } else {
      await AsyncStorage.setItem(OFFLINE_CACHE_KEY, JSON.stringify({}));
    }
  } catch (error) {
    console.error("Failed to clear cache:", error);
  }
}

/**
 * Get cache size
 */
export async function getCacheSize(): Promise<number> {
  try {
    const cacheData = await AsyncStorage.getItem(OFFLINE_CACHE_KEY);
    return cacheData ? cacheData.length : 0;
  } catch (error) {
    console.error("Failed to get cache size:", error);
    return 0;
  }
}

/**
 * Resolve conflict
 */
export async function resolveConflict(
  conflict: ConflictResolution
): Promise<any> {
  switch (conflict.strategy) {
    case "local_wins":
      return conflict.localData;

    case "remote_wins":
      return conflict.remoteData;

    case "latest_wins": {
      const localTimestamp = new Date(conflict.localData.updatedAt || 0);
      const remoteTimestamp = new Date(conflict.remoteData.updatedAt || 0);
      return localTimestamp > remoteTimestamp
        ? conflict.localData
        : conflict.remoteData;
    }

    case "manual":
      // Return conflict for manual resolution
      return conflict.resolvedData || conflict.localData;

    default:
      return conflict.localData;
  }
}

/**
 * Get sync status
 */
export async function getSyncStatus(): Promise<SyncStatus> {
  try {
    const data = await AsyncStorage.getItem(SYNC_STATUS_KEY);
    
    if (data) {
      return JSON.parse(data);
    }
    
    return {
      isSyncing: false,
      pendingOperations: 0,
      failedOperations: 0,
    };
  } catch (error) {
    console.error("Failed to get sync status:", error);
    return {
      isSyncing: false,
      pendingOperations: 0,
      failedOperations: 0,
    };
  }
}

/**
 * Update sync status
 */
async function updateSyncStatus(updates: Partial<SyncStatus>): Promise<void> {
  try {
    const status = await getSyncStatus();
    const updated = { ...status, ...updates };
    await AsyncStorage.setItem(SYNC_STATUS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to update sync status:", error);
  }
}

/**
 * Use sync status hook
 */
export function useSyncStatus() {
  const [status, setStatus] = useState<SyncStatus>({
    isSyncing: false,
    pendingOperations: 0,
    failedOperations: 0,
  });

  useEffect(() => {
    // Load initial status
    getSyncStatus().then(setStatus);

    // Poll for status updates every 5 seconds
    const interval = setInterval(async () => {
      const newStatus = await getSyncStatus();
      setStatus(newStatus);
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return status;
}

/**
 * Exponential backoff for retries
 */
export function getRetryDelay(retryCount: number): number {
  // 1s, 2s, 4s, 8s, 16s
  return Math.min(1000 * Math.pow(2, retryCount), 16000);
}

/**
 * Retry operation with exponential backoff
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries = 5
): Promise<T> {
  let lastError: Error | undefined;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (i < maxRetries - 1) {
        const delay = getRetryDelay(i);
        console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error("Operation failed after retries");
}

/**
 * Partial sync for large datasets
 */
export async function partialSync(
  resource: string,
  batchSize = 10
): Promise<void> {
  const queue = await getPendingOperations();
  const resourceOps = queue.filter((op) => op.resource === resource);

  if (resourceOps.length === 0) {
    return;
  }

  console.log(`Partial sync: ${resourceOps.length} operations for ${resource}`);

  // Process in batches
  for (let i = 0; i < resourceOps.length; i += batchSize) {
    const batch = resourceOps.slice(i, i + batchSize);
    
    for (const op of batch) {
      try {
        await executeOperation(op);
        
        // Remove from queue
        const updatedQueue = queue.filter((q) => q.id !== op.id);
        await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(updatedQueue));
      } catch (error) {
        console.error(`Failed to sync ${op.id}:`, error);
      }
    }

    // Pause between batches
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}

/**
 * Check if resource is cached
 */
export async function isCached(key: string): Promise<boolean> {
  const cached = await getCachedData(key);
  return cached !== null;
}

/**
 * Get or fetch data (cache-first strategy)
 */
export async function getOrFetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  cacheExpiry?: number
): Promise<T> {
  // Try cache first
  const cached = await getCachedData<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Fetch from server
  const data = await fetchFn();
  
  // Cache for future use
  await cacheData(key, data, cacheExpiry);
  
  return data;
}

/**
 * Prefetch data for offline use
 */
export async function prefetchData(
  keys: string[],
  fetchFn: (key: string) => Promise<any>,
  cacheExpiry?: number
): Promise<void> {
  console.log(`Prefetching ${keys.length} items...`);
  
  for (const key of keys) {
    try {
      const data = await fetchFn(key);
      await cacheData(key, data, cacheExpiry);
    } catch (error) {
      console.error(`Failed to prefetch ${key}:`, error);
    }
  }
  
  console.log("Prefetch complete");
}

/**
 * Clear expired cache entries
 */
export async function clearExpiredCache(): Promise<number> {
  try {
    const cacheData = await AsyncStorage.getItem(OFFLINE_CACHE_KEY);
    const cache: OfflineCache = cacheData ? JSON.parse(cacheData) : {};

    let clearedCount = 0;
    const now = new Date();

    for (const [key, value] of Object.entries(cache)) {
      if (value.expiresAt && new Date(value.expiresAt) < now) {
        delete cache[key];
        clearedCount++;
      }
    }

    if (clearedCount > 0) {
      await AsyncStorage.setItem(OFFLINE_CACHE_KEY, JSON.stringify(cache));
      console.log(`Cleared ${clearedCount} expired cache entries`);
    }

    return clearedCount;
  } catch (error) {
    console.error("Failed to clear expired cache:", error);
    return 0;
  }
}

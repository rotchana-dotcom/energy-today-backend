/**
 * Performance Optimization
 * Tools and utilities for app performance monitoring and optimization
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { InteractionManager, Platform } from "react-native";

const STORAGE_KEY = "performance_metrics";

export interface PerformanceMetrics {
  screenLoadTimes: Record<string, number[]>;
  apiCallTimes: Record<string, number[]>;
  renderTimes: Record<string, number[]>;
  memoryUsage: number[];
  cacheHitRate: number;
  offlineQueueSize: number;
  lastUpdated: Date;
}

export interface CacheConfig {
  maxAge: number; // milliseconds
  maxSize: number; // number of items
  strategy: "lru" | "lfu" | "fifo";
}

export interface ImageCacheEntry {
  uri: string;
  localPath: string;
  size: number;
  cachedAt: Date;
  accessCount: number;
  lastAccessed: Date;
}

const DEFAULT_CACHE_CONFIG: CacheConfig = {
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  maxSize: 100,
  strategy: "lru", // Least Recently Used
};

/**
 * Measure execution time of a function
 */
export async function measurePerformance<T>(
  name: string,
  fn: () => Promise<T>
): Promise<{ result: T; duration: number }> {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;
  
  await recordMetric("execution", name, duration);
  
  return { result, duration };
}

/**
 * Measure screen load time
 */
export async function measureScreenLoad(
  screenName: string,
  loadFn: () => Promise<void>
): Promise<number> {
  const start = performance.now();
  await loadFn();
  const duration = performance.now() - start;
  
  await recordMetric("screenLoad", screenName, duration);
  
  return duration;
}

/**
 * Measure API call time
 */
export async function measureApiCall<T>(
  endpoint: string,
  apiFn: () => Promise<T>
): Promise<{ result: T; duration: number }> {
  const start = performance.now();
  const result = await apiFn();
  const duration = performance.now() - start;
  
  await recordMetric("apiCall", endpoint, duration);
  
  return { result, duration };
}

/**
 * Record performance metric
 */
async function recordMetric(
  type: "execution" | "screenLoad" | "apiCall" | "render",
  name: string,
  duration: number
): Promise<void> {
  const key = `${STORAGE_KEY}_${type}_${name}`;
  const data = await AsyncStorage.getItem(key);
  const metrics = data ? JSON.parse(data) : [];
  
  metrics.push({
    duration,
    timestamp: new Date().toISOString(),
  });
  
  // Keep last 50 measurements
  if (metrics.length > 50) {
    metrics.splice(0, metrics.length - 50);
  }
  
  await AsyncStorage.setItem(key, JSON.stringify(metrics));
}

/**
 * Get performance metrics
 */
export async function getPerformanceMetrics(): Promise<PerformanceMetrics> {
  const keys = await AsyncStorage.getAllKeys();
  const metricKeys = keys.filter(key => key.startsWith(STORAGE_KEY));
  
  const metrics: PerformanceMetrics = {
    screenLoadTimes: {},
    apiCallTimes: {},
    renderTimes: {},
    memoryUsage: [],
    cacheHitRate: 0,
    offlineQueueSize: 0,
    lastUpdated: new Date(),
  };
  
  for (const key of metricKeys) {
    const data = await AsyncStorage.getItem(key);
    if (!data) continue;
    
    const measurements = JSON.parse(data);
    const durations = measurements.map((m: any) => m.duration);
    
    if (key.includes("screenLoad")) {
      const screenName = key.replace(`${STORAGE_KEY}_screenLoad_`, "");
      metrics.screenLoadTimes[screenName] = durations;
    } else if (key.includes("apiCall")) {
      const endpoint = key.replace(`${STORAGE_KEY}_apiCall_`, "");
      metrics.apiCallTimes[endpoint] = durations;
    } else if (key.includes("render")) {
      const component = key.replace(`${STORAGE_KEY}_render_`, "");
      metrics.renderTimes[component] = durations;
    }
  }
  
  return metrics;
}

/**
 * Get average metric
 */
export function getAverageMetric(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

/**
 * Get performance summary
 */
export async function getPerformanceSummary(): Promise<{
  avgScreenLoadTime: number;
  avgApiCallTime: number;
  slowestScreens: Array<{ name: string; avgTime: number }>;
  slowestApis: Array<{ name: string; avgTime: number }>;
}> {
  const metrics = await getPerformanceMetrics();
  
  // Calculate averages
  const screenLoadAvgs = Object.entries(metrics.screenLoadTimes).map(([name, times]) => ({
    name,
    avgTime: getAverageMetric(times),
  }));
  
  const apiCallAvgs = Object.entries(metrics.apiCallTimes).map(([name, times]) => ({
    name,
    avgTime: getAverageMetric(times),
  }));
  
  // Sort by slowest
  const slowestScreens = screenLoadAvgs.sort((a, b) => b.avgTime - a.avgTime).slice(0, 5);
  const slowestApis = apiCallAvgs.sort((a, b) => b.avgTime - a.avgTime).slice(0, 5);
  
  // Overall averages
  const avgScreenLoadTime = screenLoadAvgs.length > 0
    ? screenLoadAvgs.reduce((sum, s) => sum + s.avgTime, 0) / screenLoadAvgs.length
    : 0;
  
  const avgApiCallTime = apiCallAvgs.length > 0
    ? apiCallAvgs.reduce((sum, a) => sum + a.avgTime, 0) / apiCallAvgs.length
    : 0;
  
  return {
    avgScreenLoadTime,
    avgApiCallTime,
    slowestScreens,
    slowestApis,
  };
}

/**
 * Clear performance metrics
 */
export async function clearPerformanceMetrics(): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  const metricKeys = keys.filter(key => key.startsWith(STORAGE_KEY));
  await AsyncStorage.multiRemove(metricKeys);
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Memoize function results
 */
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>) => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = func(...args);
    cache.set(key, result);
    
    return result;
  }) as T;
}

/**
 * Run after interactions complete
 */
export function runAfterInteractions(callback: () => void): void {
  if (Platform.OS === "web") {
    requestIdleCallback ? requestIdleCallback(callback) : setTimeout(callback, 0);
  } else {
    InteractionManager.runAfterInteractions(callback);
  }
}

/**
 * Lazy load component
 */
export function lazyLoad<T>(
  importFn: () => Promise<{ default: T }>
): () => Promise<T> {
  let cached: T | null = null;
  
  return async () => {
    if (cached) return cached;
    
    const module = await importFn();
    cached = module.default;
    return cached;
  };
}

/**
 * Batch updates
 */
export function batchUpdates<T>(
  updates: T[],
  batchSize: number,
  processFn: (batch: T[]) => Promise<void>
): Promise<void[]> {
  const batches: T[][] = [];
  
  for (let i = 0; i < updates.length; i += batchSize) {
    batches.push(updates.slice(i, i + batchSize));
  }
  
  return Promise.all(batches.map(batch => processFn(batch)));
}

/**
 * Image cache manager
 */
export class ImageCache {
  private cache: Map<string, ImageCacheEntry> = new Map();
  private config: CacheConfig;
  
  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CACHE_CONFIG, ...config };
  }
  
  /**
   * Get cached image
   */
  get(uri: string): ImageCacheEntry | null {
    const entry = this.cache.get(uri);
    
    if (!entry) return null;
    
    // Check if expired
    const age = Date.now() - entry.cachedAt.getTime();
    if (age > this.config.maxAge) {
      this.cache.delete(uri);
      return null;
    }
    
    // Update access info
    entry.accessCount++;
    entry.lastAccessed = new Date();
    
    return entry;
  }
  
  /**
   * Set cached image
   */
  set(uri: string, localPath: string, size: number): void {
    // Check if cache is full
    if (this.cache.size >= this.config.maxSize) {
      this.evict();
    }
    
    this.cache.set(uri, {
      uri,
      localPath,
      size,
      cachedAt: new Date(),
      accessCount: 1,
      lastAccessed: new Date(),
    });
  }
  
  /**
   * Evict entries based on strategy
   */
  private evict(): void {
    if (this.cache.size === 0) return;
    
    let entryToRemove: string | null = null;
    
    if (this.config.strategy === "lru") {
      // Remove least recently used
      let oldestAccess = Date.now();
      
      this.cache.forEach((entry, uri) => {
        if (entry.lastAccessed.getTime() < oldestAccess) {
          oldestAccess = entry.lastAccessed.getTime();
          entryToRemove = uri;
        }
      });
    } else if (this.config.strategy === "lfu") {
      // Remove least frequently used
      let lowestCount = Infinity;
      
      this.cache.forEach((entry, uri) => {
        if (entry.accessCount < lowestCount) {
          lowestCount = entry.accessCount;
          entryToRemove = uri;
        }
      });
    } else if (this.config.strategy === "fifo") {
      // Remove first in
      let oldestCache = Date.now();
      
      this.cache.forEach((entry, uri) => {
        if (entry.cachedAt.getTime() < oldestCache) {
          oldestCache = entry.cachedAt.getTime();
          entryToRemove = uri;
        }
      });
    }
    
    if (entryToRemove) {
      this.cache.delete(entryToRemove);
    }
  }
  
  /**
   * Clear cache
   */
  clear(): void {
    this.cache.clear();
  }
  
  /**
   * Get cache size
   */
  getSize(): number {
    return this.cache.size;
  }
  
  /**
   * Get total bytes cached
   */
  getTotalBytes(): number {
    let total = 0;
    this.cache.forEach(entry => {
      total += entry.size;
    });
    return total;
  }
  
  /**
   * Get cache hit rate
   */
  getHitRate(): number {
    let hits = 0;
    let total = 0;
    
    this.cache.forEach(entry => {
      total += entry.accessCount;
      if (entry.accessCount > 1) {
        hits += entry.accessCount - 1;
      }
    });
    
    return total > 0 ? hits / total : 0;
  }
}

/**
 * Data prefetcher
 */
export class DataPrefetcher {
  private prefetchQueue: Array<() => Promise<any>> = [];
  private prefetchedData: Map<string, any> = new Map();
  
  /**
   * Add to prefetch queue
   */
  add(key: string, fetchFn: () => Promise<any>): void {
    this.prefetchQueue.push(async () => {
      const data = await fetchFn();
      this.prefetchedData.set(key, data);
    });
  }
  
  /**
   * Execute prefetch queue
   */
  async execute(): Promise<void> {
    runAfterInteractions(async () => {
      await Promise.all(this.prefetchQueue.map(fn => fn()));
      this.prefetchQueue = [];
    });
  }
  
  /**
   * Get prefetched data
   */
  get(key: string): any | null {
    return this.prefetchedData.get(key) || null;
  }
  
  /**
   * Clear prefetched data
   */
  clear(): void {
    this.prefetchedData.clear();
  }
}

/**
 * Memory monitor
 */
export class MemoryMonitor {
  private measurements: number[] = [];
  private maxMeasurements: number = 100;
  
  /**
   * Record memory usage
   */
  record(): void {
    if (Platform.OS === "web" && (performance as any).memory) {
      const memory = (performance as any).memory;
      const usedMB = memory.usedJSHeapSize / 1024 / 1024;
      
      this.measurements.push(usedMB);
      
      if (this.measurements.length > this.maxMeasurements) {
        this.measurements.shift();
      }
    }
  }
  
  /**
   * Get average memory usage
   */
  getAverage(): number {
    if (this.measurements.length === 0) return 0;
    
    return this.measurements.reduce((sum, val) => sum + val, 0) / this.measurements.length;
  }
  
  /**
   * Get peak memory usage
   */
  getPeak(): number {
    if (this.measurements.length === 0) return 0;
    
    return Math.max(...this.measurements);
  }
  
  /**
   * Check if memory usage is high
   */
  isHigh(threshold: number = 100): boolean {
    return this.getAverage() > threshold;
  }
  
  /**
   * Clear measurements
   */
  clear(): void {
    this.measurements = [];
  }
}

/**
 * Bundle size analyzer
 */
export function analyzeBundleSize(): {
  estimated: string;
  recommendations: string[];
} {
  const recommendations: string[] = [
    "Use code splitting to load features on demand",
    "Lazy load images and heavy components",
    "Remove unused dependencies",
    "Use tree shaking to eliminate dead code",
    "Compress images and assets",
    "Minify JavaScript and CSS",
    "Use dynamic imports for large libraries",
  ];
  
  return {
    estimated: "~2-5 MB (typical React Native app)",
    recommendations,
  };
}

/**
 * Get performance recommendations
 */
export async function getPerformanceRecommendations(): Promise<string[]> {
  const summary = await getPerformanceSummary();
  const recommendations: string[] = [];
  
  if (summary.avgScreenLoadTime > 1000) {
    recommendations.push("Screen load times are high. Consider lazy loading components and optimizing data fetching.");
  }
  
  if (summary.avgApiCallTime > 500) {
    recommendations.push("API calls are slow. Consider caching responses and implementing request batching.");
  }
  
  if (summary.slowestScreens.length > 0) {
    const slowest = summary.slowestScreens[0];
    if (slowest.avgTime > 2000) {
      recommendations.push(`${slowest.name} screen is very slow (${Math.round(slowest.avgTime)}ms). Optimize rendering and data loading.`);
    }
  }
  
  recommendations.push("Enable image caching to reduce network requests");
  recommendations.push("Use memoization for expensive calculations");
  recommendations.push("Implement virtual lists for long scrollable content");
  recommendations.push("Prefetch data for upcoming screens");
  
  return recommendations;
}

/**
 * Global instances
 */
export const imageCache = new ImageCache();
export const dataPrefetcher = new DataPrefetcher();
export const memoryMonitor = new MemoryMonitor();

/**
 * Start performance monitoring
 */
export function startPerformanceMonitoring(): void {
  // Record memory usage every 10 seconds
  setInterval(() => {
    memoryMonitor.record();
  }, 10000);
}

/**
 * Stop performance monitoring
 */
export function stopPerformanceMonitoring(): void {
  memoryMonitor.clear();
}

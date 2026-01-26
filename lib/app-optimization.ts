import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Lazy load component with fallback
 */
export function lazyLoad<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = React.lazy(importFunc);
  
  return (props: React.ComponentProps<T>) =>
    React.createElement(
      React.Suspense,
      { fallback: fallback || React.createElement(LoadingPlaceholder) },
      React.createElement(LazyComponent, props)
    );
}

/**
 * Loading placeholder component
 */
const LoadingPlaceholder: React.FC = () => {
  return React.createElement(
    View,
    { style: { flex: 1, justifyContent: "center", alignItems: "center" } },
    React.createElement(ActivityIndicator, { size: "large" })
  );
};

/**
 * Debounce hook for expensive operations
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Throttle hook for rate-limiting
 */
export function useThrottle<T>(value: T, interval: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastUpdated = useRef<number>(Date.now());

  useEffect(() => {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdated.current;

    if (timeSinceLastUpdate >= interval) {
      setThrottledValue(value);
      lastUpdated.current = now;
    } else {
      const handler = setTimeout(() => {
        setThrottledValue(value);
        lastUpdated.current = Date.now();
      }, interval - timeSinceLastUpdate);

      return () => {
        clearTimeout(handler);
      };
    }
  }, [value, interval]);

  return throttledValue;
}

/**
 * Memoized selector hook
 */
export function useMemoizedSelector<T, R>(
  selector: (data: T) => R,
  data: T,
  deps: React.DependencyList = []
): R {
  return useMemo(() => selector(data), [data, ...deps]);
}

/**
 * Batched AsyncStorage operations
 */
export class AsyncStorageBatch {
  private operations: Array<{
    type: "set" | "remove";
    key: string;
    value?: string;
  }> = [];

  set(key: string, value: string) {
    this.operations.push({ type: "set", key, value });
    return this;
  }

  remove(key: string) {
    this.operations.push({ type: "remove", key });
    return this;
  }

  async commit(): Promise<void> {
    const setOps = this.operations.filter((op) => op.type === "set");
    const removeOps = this.operations.filter((op) => op.type === "remove");

    const promises: Promise<void>[] = [];

    if (setOps.length > 0) {
      promises.push(
        AsyncStorage.multiSet(setOps.map((op) => [op.key, op.value!]))
      );
    }

    if (removeOps.length > 0) {
      promises.push(AsyncStorage.multiRemove(removeOps.map((op) => op.key)));
    }

    await Promise.all(promises);
    this.operations = [];
  }
}

/**
 * Image cache manager
 */
export class ImageCacheManager {
  private static cache = new Map<string, string>();
  private static maxSize = 50; // Max cached images

  static async getCachedImage(url: string): Promise<string | null> {
    return this.cache.get(url) || null;
  }

  static cacheImage(url: string, localPath: string): void {
    if (this.cache.size >= this.maxSize) {
      // Remove oldest entry
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(url, localPath);
  }

  static clearCache(): void {
    this.cache.clear();
  }

  static getCacheSize(): number {
    return this.cache.size;
  }
}

/**
 * Virtual list hook for efficient rendering
 */
export function useVirtualList<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) {
  const [scrollOffset, setScrollOffset] = useState(0);

  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollOffset / itemHeight);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollOffset + containerHeight) / itemHeight)
    );

    return {
      startIndex: Math.max(0, startIndex - 2), // Buffer 2 items
      endIndex: Math.min(items.length - 1, endIndex + 2), // Buffer 2 items
    };
  }, [scrollOffset, itemHeight, containerHeight, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.startIndex * itemHeight;

  return {
    visibleItems,
    totalHeight,
    offsetY,
    setScrollOffset,
  };
}

/**
 * Component performance profiler
 */
export class PerformanceProfiler {
  private static measurements = new Map<string, number[]>();

  static startMeasure(componentName: string): () => void {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;

      const measurements = this.measurements.get(componentName) || [];
      measurements.push(duration);

      // Keep only last 100 measurements
      if (measurements.length > 100) {
        measurements.shift();
      }

      this.measurements.set(componentName, measurements);
    };
  }

  static getStats(componentName: string) {
    const measurements = this.measurements.get(componentName) || [];

    if (measurements.length === 0) {
      return null;
    }

    const sum = measurements.reduce((a, b) => a + b, 0);
    const avg = sum / measurements.length;
    const max = Math.max(...measurements);
    const min = Math.min(...measurements);

    return {
      count: measurements.length,
      avg: Math.round(avg * 100) / 100,
      max: Math.round(max * 100) / 100,
      min: Math.round(min * 100) / 100,
    };
  }

  static getAllStats() {
    const stats: Record<string, ReturnType<typeof this.getStats>> = {};

    for (const [componentName] of this.measurements) {
      stats[componentName] = this.getStats(componentName);
    }

    return stats;
  }

  static clearStats(componentName?: string) {
    if (componentName) {
      this.measurements.delete(componentName);
    } else {
      this.measurements.clear();
    }
  }
}

/**
 * Use performance profiler hook
 */
export function usePerformanceProfiler(componentName: string) {
  useEffect(() => {
    const endMeasure = PerformanceProfiler.startMeasure(componentName);
    return endMeasure;
  });
}

/**
 * Bundle size analyzer
 */
export interface BundleStats {
  totalSize: number; // bytes
  jsSize: number;
  assetsSize: number;
  breakdown: {
    category: string;
    size: number;
    percentage: number;
  }[];
}

export async function analyzeBundleSize(): Promise<BundleStats> {
  // In production, this would analyze actual bundle
  // For now, return estimated stats
  
  return {
    totalSize: 5242880, // 5 MB
    jsSize: 3145728, // 3 MB
    assetsSize: 2097152, // 2 MB
    breakdown: [
      { category: "App Code", size: 1048576, percentage: 20 },
      { category: "Libraries", size: 2097152, percentage: 40 },
      { category: "Images", size: 1572864, percentage: 30 },
      { category: "Fonts", size: 524288, percentage: 10 },
    ],
  };
}

/**
 * Code splitting helper
 */
export function splitByRoute(routes: Record<string, () => Promise<any>>) {
  const loadedChunks = new Set<string>();

  return {
    async preload(routeName: string) {
      if (!loadedChunks.has(routeName) && routes[routeName]) {
        await routes[routeName]();
        loadedChunks.add(routeName);
      }
    },

    async load(routeName: string) {
      if (routes[routeName]) {
        const module = await routes[routeName]();
        loadedChunks.add(routeName);
        return module;
      }
      throw new Error(`Route ${routeName} not found`);
    },

    isLoaded(routeName: string) {
      return loadedChunks.has(routeName);
    },

    getLoadedChunks() {
      return Array.from(loadedChunks);
    },
  };
}

/**
 * Optimize re-renders hook
 */
export function useOptimizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  return useCallback(callback, deps);
}

/**
 * Shallow compare for props
 */
export function shallowEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;

  if (
    typeof obj1 !== "object" ||
    obj1 === null ||
    typeof obj2 !== "object" ||
    obj2 === null
  ) {
    return false;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (obj1[key] !== obj2[key]) return false;
  }

  return true;
}

/**
 * Memoized component wrapper
 */
export function memo<P extends object>(
  Component: React.ComponentType<P>,
  propsAreEqual?: (prevProps: Readonly<P>, nextProps: Readonly<P>) => boolean
): React.MemoExoticComponent<React.ComponentType<P>> {
  return React.memo(Component, propsAreEqual || shallowEqual);
}

/**
 * Reduce AsyncStorage calls
 */
export class AsyncStorageOptimizer {
  private static cache = new Map<string, { value: string; timestamp: number }>();
  private static cacheTimeout = 5000; // 5 seconds

  static async getItem(key: string, useCache = true): Promise<string | null> {
    if (useCache) {
      const cached = this.cache.get(key);
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.value;
      }
    }

    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      this.cache.set(key, { value, timestamp: Date.now() });
    }

    return value;
  }

  static async setItem(key: string, value: string): Promise<void> {
    this.cache.set(key, { value, timestamp: Date.now() });
    await AsyncStorage.setItem(key, value);
  }

  static invalidate(key: string): void {
    this.cache.delete(key);
  }

  static clearCache(): void {
    this.cache.clear();
  }
}

/**
 * Performance monitoring
 */
export interface PerformanceMetrics {
  fps: number;
  memoryUsage: number; // MB
  bundleLoadTime: number; // ms
  apiResponseTime: number; // ms
  renderTime: number; // ms
}

export class PerformanceMonitor {
  private static metrics: PerformanceMetrics = {
    fps: 60,
    memoryUsage: 0,
    bundleLoadTime: 0,
    apiResponseTime: 0,
    renderTime: 0,
  };

  static updateMetrics(updates: Partial<PerformanceMetrics>) {
    this.metrics = { ...this.metrics, ...updates };
  }

  static getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  static isPerformanceGood(): boolean {
    return (
      this.metrics.fps >= 55 &&
      this.metrics.memoryUsage < 200 &&
      this.metrics.renderTime < 16 // 60fps = 16ms per frame
    );
  }

  static getRecommendations(): string[] {
    const recommendations: string[] = [];

    if (this.metrics.fps < 55) {
      recommendations.push("Reduce animations or use native driver");
    }

    if (this.metrics.memoryUsage > 200) {
      recommendations.push("Clear image cache or reduce cached data");
    }

    if (this.metrics.renderTime > 16) {
      recommendations.push("Optimize component re-renders with React.memo");
    }

    if (this.metrics.apiResponseTime > 1000) {
      recommendations.push("Implement request caching or optimize API calls");
    }

    return recommendations;
  }
}



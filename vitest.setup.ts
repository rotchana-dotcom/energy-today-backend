// Vitest setup file
import { vi } from 'vitest';

(global as any).__DEV__ = true;

// Mock AsyncStorage
const mockStorage: Record<string, string> = {};

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    setItem: vi.fn(async (key: string, value: string) => {
      mockStorage[key] = value;
    }),
    getItem: vi.fn(async (key: string) => {
      return mockStorage[key] || null;
    }),
    removeItem: vi.fn(async (key: string) => {
      delete mockStorage[key];
    }),
    clear: vi.fn(async () => {
      Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
    }),
    getAllKeys: vi.fn(async () => {
      return Object.keys(mockStorage);
    }),
  },
}));

import AsyncStorage from "@react-native-async-storage/async-storage";

const SECTION_ORDER_KEY = "section_order";

export interface SectionOrder {
  todayScreen: string[];
  aiInsightsDashboard: string[];
}

// Default section orders
export const DEFAULT_TODAY_SECTIONS = [
  "performance_score",
  "top_priority",
  "optimal_timing",
  "best_for_avoid",
  "key_opportunity_watch_out",
  "energy_type",
];

export const DEFAULT_AI_INSIGHTS_SECTIONS = [
  "prediction_accuracy",
  "life_path_profile",
  "what_affects_energy",
  "what_makes_successful",
];

export async function getSectionOrder(): Promise<SectionOrder> {
  try {
    const stored = await AsyncStorage.getItem(SECTION_ORDER_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Failed to load section order:", error);
  }

  // Return defaults
  return {
    todayScreen: DEFAULT_TODAY_SECTIONS,
    aiInsightsDashboard: DEFAULT_AI_INSIGHTS_SECTIONS,
  };
}

export async function saveSectionOrder(order: SectionOrder): Promise<void> {
  try {
    await AsyncStorage.setItem(SECTION_ORDER_KEY, JSON.stringify(order));
  } catch (error) {
    console.error("Failed to save section order:", error);
  }
}

export async function resetSectionOrder(): Promise<void> {
  try {
    await AsyncStorage.removeItem(SECTION_ORDER_KEY);
  } catch (error) {
    console.error("Failed to reset section order:", error);
  }
}

// Helper to sort sections based on custom order
export function sortSections<T extends { id: string }>(
  sections: T[],
  order: string[]
): T[] {
  return sections.sort((a, b) => {
    const indexA = order.indexOf(a.id);
    const indexB = order.indexOf(b.id);
    
    // If not in order array, put at end
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    
    return indexA - indexB;
  });
}

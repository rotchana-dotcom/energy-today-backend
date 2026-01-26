/**
 * Internationalization (i18n) System
 * 
 * Provides language switching between English and Thai
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

const LANGUAGE_KEY = "@energy_today_language";

export type Language = "en" | "th";

/**
 * Translation dictionary
 */
const translations = {
  en: {
    // App Name
    appName: "Energy Today",
    
    // Navigation
    today: "Today",
    calendar: "Calendar",
    log: "Log",
    settings: "Settings",
    
    // Today Screen
    yourEnergy: "YOUR ENERGY",
    todaysEnergy: "TODAY'S ENERGY",
    theConnection: "THE CONNECTION",
    quickActions: "Quick Actions",
    energyHistory: "30-Day Energy History",
    share: "Share",
    
    // Calendar Screen
    selectActivity: "What would you like to plan?",
    productLaunch: "Product Launch",
    importantMeeting: "Important Meeting",
    negotiation: "Negotiation",
    signing: "Contract Signing",
    presentation: "Presentation",
    networking: "Networking Event",
    
    // Log/Journal Screen
    journal: "Journal",
    addEntry: "Add Entry",
    mood: "Mood",
    notes: "Notes",
    voiceNote: "Voice Note",
    save: "Save",
    
    // Settings Screen
    profile: "PROFILE",
    name: "Name",
    dateOfBirth: "Date of Birth",
    placeOfBirth: "Place of Birth",
    subscription: "SUBSCRIPTION",
    freePlan: "Free Plan",
    proPlan: "Energy Today Pro",
    basicFeatures: "Basic features",
    allFeatures: "Access to all features",
    upgradeToPro: "Upgrade to Pro",
    manageSubscription: "Manage Subscription",
    preferences: "PREFERENCES",
    dailyEnergySummary: "Daily Energy Summary",
    morningEnergyUpdates: "Receive morning energy updates",
    contextualReminders: "Contextual Reminders",
    smartEnergyPeakAlerts: "Smart Energy Peak Alerts",
    darkMode: "Dark Mode",
    adhdFriendlyMode: "ADHD-Friendly Mode",
    highContrastEnabled: "High contrast colors enabled",
    enableHighContrast: "Enable high contrast colors for better focus",
    insights: "INSIGHTS",
    numerologyProfile: "Numerology Profile",
    numerologyDesc: "Day born, life path & karmic numbers",
    energyForecast: "Energy Forecast",
    forecastDesc: "7-day and 30-day predictions",
    help: "HELP",
    userGuide: "User Guide & Tutorial",
    userGuideDesc: "Learn how to use Energy Today",
    about: "ABOUT",
    privacyPolicy: "Privacy Policy",
    termsOfService: "Terms of Service",
    version: "Version",
    language: "Language",
    
    // Alignment
    strong: "Strong",
    moderate: "Moderate",
    challenging: "Challenging",
    
    // Lunar Phases
    newMoon: "New Moon",
    waxingCrescent: "Waxing Crescent",
    firstQuarter: "First Quarter",
    waxingGibbous: "Waxing Gibbous",
    fullMoon: "Full Moon",
    waningGibbous: "Waning Gibbous",
    lastQuarter: "Last Quarter",
    waningCrescent: "Waning Crescent",
    
    // Common
    loading: "Loading...",
    cancel: "Cancel",
    confirm: "Confirm",
    close: "Close",
    back: "Back",
    next: "Next",
    done: "Done",
    
    // Numerology
    dayBorn: "Day Born",
    lifePath: "Life Path",
    karmicAnalysis: "Karmic Analysis",
    characteristics: "Characteristics",
    strengths: "Strengths",
    challenges: "Challenges",
    luckyColors: "Lucky Colors",
    luckyNumbers: "Lucky Numbers",
    yourTalents: "Your Talents",
    lifeChallenges: "Life Challenges",
    careerPaths: "Career Paths",
    relationships: "Relationships",
    karmicDebt: "Karmic Debt",
    karmicLessons: "Karmic Lessons",
    
    // Forecast
    overallTrend: "Overall Trend",
    bestDays: "Best Days",
    challengingDays: "Challenging Days",
    significantDates: "Significant Dates",
    dailyBreakdown: "Daily Breakdown",
    sevenDays: "7 Days",
    thirtyDays: "30 Days",
    
    // Ratings
    excellent: "Excellent",
    good: "Good",
    
    // Buddhist Calendar
    buddhistEra: "BE (Buddhist Era)",
  },
  th: {
    // App Name
    appName: "พลังงานวันนี้",
    
    // Navigation
    today: "วันนี้",
    calendar: "ปฏิทิน",
    log: "บันทึก",
    settings: "ตั้งค่า",
    
    // Today Screen
    yourEnergy: "พลังงานของคุณ",
    todaysEnergy: "พลังงานวันนี้",
    theConnection: "การเชื่อมต่อ",
    quickActions: "การดำเนินการด่วน",
    energyHistory: "ประวัติพลังงาน 30 วัน",
    share: "แชร์",
    
    // Calendar Screen
    selectActivity: "คุณต้องการวางแผนอะไร?",
    productLaunch: "เปิดตัวผลิตภัณฑ์",
    importantMeeting: "ประชุมสำคัญ",
    negotiation: "เจรจาต่อรอง",
    signing: "ลงนามสัญญา",
    presentation: "นำเสนอ",
    networking: "กิจกรรมเครือข่าย",
    
    // Log/Journal Screen
    journal: "บันทึกประจำวัน",
    addEntry: "เพิ่มรายการ",
    mood: "อารมณ์",
    notes: "บันทึก",
    voiceNote: "บันทึกเสียง",
    save: "บันทึก",
    
    // Settings Screen
    profile: "โปรไฟล์",
    name: "ชื่อ",
    dateOfBirth: "วันเกิด",
    placeOfBirth: "สถานที่เกิด",
    subscription: "การสมัครสมาชิก",
    freePlan: "แผนฟรี",
    proPlan: "พลังงานวันนี้ โปร",
    basicFeatures: "ฟีเจอร์พื้นฐาน",
    allFeatures: "เข้าถึงฟีเจอร์ทั้งหมด",
    upgradeToPro: "อัปเกรดเป็นโปร",
    manageSubscription: "จัดการการสมัครสมาชิก",
    preferences: "การตั้งค่า",
    dailyEnergySummary: "สรุปพลังงานรายวัน",
    morningEnergyUpdates: "รับการอัปเดตพลังงานตอนเช้า",
    contextualReminders: "การแจ้งเตือนตามบริบท",
    smartEnergyPeakAlerts: "การแจ้งเตือนจุดสูงสุดของพลังงาน",
    darkMode: "โหมดมืด",
    adhdFriendlyMode: "โหมดเหมาะสำหรับ ADHD",
    highContrastEnabled: "เปิดใช้งานสีคอนทราสต์สูง",
    enableHighContrast: "เปิดใช้งานสีคอนทราสต์สูงเพื่อโฟกัสที่ดีขึ้น",
    insights: "ข้อมูลเชิงลึก",
    numerologyProfile: "โปรไฟล์เลขศาสตร์",
    numerologyDesc: "วันเกิด เส้นชีวิต และเลขกรรม",
    energyForecast: "พยากรณ์พลังงาน",
    forecastDesc: "การทำนาย 7 วันและ 30 วัน",
    help: "ความช่วยเหลือ",
    userGuide: "คู่มือผู้ใช้และบทช่วยสอน",
    userGuideDesc: "เรียนรู้วิธีใช้พลังงานวันนี้",
    about: "เกี่ยวกับ",
    privacyPolicy: "นโยบายความเป็นส่วนตัว",
    termsOfService: "ข้อกำหนดการให้บริการ",
    version: "เวอร์ชัน",
    language: "ภาษา",
    
    // Alignment
    strong: "แข็งแกร่ง",
    moderate: "ปานกลาง",
    challenging: "ท้าทาย",
    
    // Lunar Phases
    newMoon: "ข้างขึ้น",
    waxingCrescent: "ข้างขึ้นเสี้ยว",
    firstQuarter: "ข้างขึ้นครึ่งดวง",
    waxingGibbous: "ข้างขึ้นเกือบเต็มดวง",
    fullMoon: "เต็มดวง",
    waningGibbous: "ข้างแรมเกือบเต็มดวง",
    lastQuarter: "ข้างแรมครึ่งดวง",
    waningCrescent: "ข้างแรมเสี้ยว",
    
    // Common
    loading: "กำลังโหลด...",
    cancel: "ยกเลิก",
    confirm: "ยืนยัน",
    close: "ปิด",
    back: "กลับ",
    next: "ถัดไป",
    done: "เสร็จสิ้น",
    
    // Numerology
    dayBorn: "วันเกิด",
    lifePath: "เส้นทางชีวิต",
    karmicAnalysis: "การวิเคราะห์กรรม",
    characteristics: "ลักษณะเฉพาะ",
    strengths: "จุดแข็ง",
    challenges: "ความท้าทาย",
    luckyColors: "สีมงคล",
    luckyNumbers: "เลขมงคล",
    yourTalents: "พรสวรรค์ของคุณ",
    lifeChallenges: "ความท้าทายในชีวิต",
    careerPaths: "เส้นทางอาชีพ",
    relationships: "ความสัมพันธ์",
    karmicDebt: "หนี้กรรม",
    karmicLessons: "บทเรียนกรรม",
    
    // Forecast
    overallTrend: "แนวโน้มโดยรวม",
    bestDays: "วันที่ดีที่สุด",
    challengingDays: "วันที่ท้าทาย",
    significantDates: "วันสำคัญ",
    dailyBreakdown: "รายละเอียดรายวัน",
    sevenDays: "7 วัน",
    thirtyDays: "30 วัน",
    
    // Ratings
    excellent: "ยอดเยี่ยม",
    good: "ดี",
    
    // Buddhist Calendar
    buddhistEra: "พ.ศ. (พุทธศักราช)",
  },
};

/**
 * Get current language
 */
export async function getCurrentLanguage(): Promise<Language> {
  try {
    const lang = await AsyncStorage.getItem(LANGUAGE_KEY);
    return (lang as Language) || "en";
  } catch (error) {
    console.error("Error getting language:", error);
    return "en";
  }
}

/**
 * Set language
 */
export async function setLanguage(language: Language): Promise<void> {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, language);
  } catch (error) {
    console.error("Error setting language:", error);
  }
}

/**
 * Get translation for a key
 */
export function translate(key: keyof typeof translations.en, language: Language = "en"): string {
  return translations[language][key] || translations.en[key] || key;
}

/**
 * Hook to use translations
 */
export function useTranslation() {
  const [language, setLanguageState] = React.useState<Language>("en");

  React.useEffect(() => {
    getCurrentLanguage().then(setLanguageState);
  }, []);

  const t = (key: keyof typeof translations.en) => translate(key, language);

  const changeLanguage = async (newLanguage: Language) => {
    await setLanguage(newLanguage);
    setLanguageState(newLanguage);
  };

  return { t, language, changeLanguage };
}

// For non-hook contexts
export const i18n = {
  getCurrentLanguage,
  setLanguage,
  translate,
};

// Import React for the hook
import React from "react";

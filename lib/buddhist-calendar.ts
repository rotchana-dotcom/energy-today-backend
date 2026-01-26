/**
 * Buddhist Calendar Utilities
 * 
 * Handles conversion between Buddhist Era (BE) and Common Era (CE) dates.
 * Buddhist Era = Common Era + 543 years
 * 
 * Example: 2567 BE = 2024 CE
 */

/**
 * Detect if a year is in Buddhist Era (BE)
 * BE years are typically > 2100 (since current CE year is ~2024)
 */
export function isBuddhistEra(year: number): boolean {
  return year > 2100;
}

/**
 * Convert Buddhist Era year to Common Era year
 * BE to CE: subtract 543
 */
export function buddhistToCommonEra(buddhistYear: number): number {
  return buddhistYear - 543;
}

/**
 * Convert Common Era year to Buddhist Era year
 * CE to BE: add 543
 */
export function commonToBuddhistEra(commonYear: number): number {
  return commonYear + 543;
}

/**
 * Auto-detect and convert year to CE if it's in BE
 */
export function normalizeYear(year: number): number {
  if (isBuddhistEra(year)) {
    return buddhistToCommonEra(year);
  }
  return year;
}

/**
 * Parse date string and auto-convert BE years to CE
 * Supports formats: YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY
 */
export function parseDateWithBuddhistEra(dateString: string): Date {
  // Try ISO format first (YYYY-MM-DD)
  const isoMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const year = normalizeYear(parseInt(isoMatch[1]));
    const month = parseInt(isoMatch[2]) - 1; // JS months are 0-indexed
    const day = parseInt(isoMatch[3]);
    return new Date(year, month, day);
  }

  // Try DD/MM/YYYY format
  const ddmmyyyySlash = dateString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (ddmmyyyySlash) {
    const day = parseInt(ddmmyyyySlash[1]);
    const month = parseInt(ddmmyyyySlash[2]) - 1;
    const year = normalizeYear(parseInt(ddmmyyyySlash[3]));
    return new Date(year, month, day);
  }

  // Try DD-MM-YYYY format
  const ddmmyyyyDash = dateString.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (ddmmyyyyDash) {
    const day = parseInt(ddmmyyyyDash[1]);
    const month = parseInt(ddmmyyyyDash[2]) - 1;
    const year = normalizeYear(parseInt(ddmmyyyyDash[3]));
    return new Date(year, month, day);
  }

  // Fallback to standard Date parsing
  return new Date(dateString);
}

/**
 * Format date with both CE and BE years
 * Example: "15 January 2024 (2567 BE)"
 */
export function formatDateWithBothEras(date: Date, locale: string = 'en'): string {
  const ceYear = date.getFullYear();
  const beYear = commonToBuddhistEra(ceYear);
  
  if (locale === 'th') {
    const thaiMonths = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    const day = date.getDate();
    const month = thaiMonths[date.getMonth()];
    return `${day} ${month} ${beYear} (${ceYear} ค.ศ.)`;
  } else {
    const options: Intl.DateTimeFormatOptions = { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    };
    const ceFormatted = date.toLocaleDateString('en-US', options);
    return `${ceFormatted} (${beYear} BE)`;
  }
}

/**
 * Get current year in both CE and BE
 */
export function getCurrentYears(): { ce: number; be: number } {
  const ce = new Date().getFullYear();
  const be = commonToBuddhistEra(ce);
  return { ce, be };
}

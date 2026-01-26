/**
 * Date Utilities
 * 
 * Handles date normalization for both simple date strings and ISO timestamps
 */

/**
 * Normalize date string to YYYY-MM-DD format
 * Handles both:
 * - Simple date strings: "1969-03-24"
 * - ISO timestamps: "1969-03-24T04:23:00.000Z"
 * 
 * @param dateString - Date string in any format
 * @returns Normalized date string in YYYY-MM-DD format
 */
export function normalizeDateString(dateString: string): string {
  // If it contains 'T', it's an ISO timestamp - extract just the date part
  if (dateString.includes('T')) {
    return dateString.split('T')[0];
  }
  
  // Already a simple date string
  return dateString;
}

/**
 * Parse date string to Date object using UTC
 * Ensures consistent parsing regardless of timezone
 * 
 * @param dateString - Date string (YYYY-MM-DD or ISO timestamp)
 * @returns Date object
 */
export function parseDateUTC(dateString: string): Date {
  const normalized = normalizeDateString(dateString);
  const parts = normalized.split('-');
  
  return new Date(Date.UTC(
    parseInt(parts[0]),
    parseInt(parts[1]) - 1,
    parseInt(parts[2])
  ));
}

/**
 * Format Date object to YYYY-MM-DD string
 * 
 * @param date - Date object
 * @returns Date string in YYYY-MM-DD format
 */
export function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Exact EDATE equivalent matching Excel:
 * Adds `months` to a YYYY-MM-DD string, preserving the day of month.
 * If the target month has fewer days, clamps to the last day of that month.
 */
export function addMonths(dateStr: string, months: number): string {
  const parts = dateStr.split('T')[0].split('-').map(Number);
  const year = parts[0];
  const month = parts[1] - 1; // 0-indexed
  const day = parts[2];

  const targetDate = new Date(Date.UTC(year, month + months, 1));
  const targetYear = targetDate.getUTCFullYear();
  const targetMonth = targetDate.getUTCMonth();

  // Days in target month
  const daysInTargetMonth = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();
  const targetDay = Math.min(day, daysInTargetMonth);

  const finalDate = new Date(Date.UTC(targetYear, targetMonth, targetDay));
  return finalDate.toISOString().split('T')[0];
}

/**
 * Compare two YYYY-MM-DD date strings
 */
export function compareDates(dateA: string, dateB: string): number {
  return dateA.localeCompare(dateB);
}

/**
 * Returns true if dateA is strictly before dateB
 */
export function isBefore(dateA: string, dateB: string): boolean {
  return dateA < dateB;
}

/**
 * Formats a Date object to YYYY-MM-DD
 */
export function toISODateString(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Get current date as YYYY-MM-DD in local time
 */
export function getTodayISODate(): string {
  // Using today's application reference date (2026-10-10 or browser current)
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Calculate difference in months between two YYYY-MM-DD dates
 */
export function diffInMonths(dateA: string, dateB: string): number {
  const [y1, m1] = dateA.split('-').map(Number);
  const [y2, m2] = dateB.split('-').map(Number);
  return (y2 - y1) * 12 + (m2 - m1);
}

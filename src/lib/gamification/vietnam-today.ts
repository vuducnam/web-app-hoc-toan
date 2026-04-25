// Asia/Ho_Chi_Minh timezone date helpers.
// All streak comparisons use YYYY-MM-DD strings, never Date objects.

const TZ = "Asia/Ho_Chi_Minh";
const LOCALE = "en-CA"; // en-CA formats as YYYY-MM-DD natively

/**
 * Returns today's date in Vietnam timezone as YYYY-MM-DD string.
 * Pass a custom `now` for testing.
 */
export function vietnamToday(now: Date = new Date()): string {
  return new Intl.DateTimeFormat(LOCALE, { timeZone: TZ }).format(now);
}

/**
 * Returns the date before `today` (YYYY-MM-DD) as a YYYY-MM-DD string.
 * Pure — no timezone conversion needed since we're subtracting from a known date string.
 */
export function vietnamYesterday(today: string): string {
  // Parse as UTC midnight to avoid any local-tz shift when only doing date arithmetic
  const d = new Date(`${today}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

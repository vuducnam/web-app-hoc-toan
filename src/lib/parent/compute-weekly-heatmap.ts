// Pure function: aggregates Attempt records into 7-day heatmap data.
// Each day entry: { date: ISO date string, minutes: number }
// Last 7 days relative to `today` (inclusive).

export interface AttemptForHeatmap {
  createdAt: Date;
  elapsedMs: number;
}

export interface HeatmapDay {
  /** ISO date string e.g. "2025-04-25" */
  date: string;
  minutes: number;
}

/**
 * Returns exactly 7 entries (Mon..Sun of the last 7 days from today),
 * each with total practice minutes aggregated from elapsedMs.
 */
export function computeWeeklyHeatmap(
  attempts: AttemptForHeatmap[],
  today: Date,
): HeatmapDay[] {
  // Build the 7-day window: today and the 6 days before
  const days: HeatmapDay[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push({ date: toISODate(d), minutes: 0 });
  }

  const dateMap = new Map<string, number>(days.map((d) => [d.date, 0]));

  for (const attempt of attempts) {
    const key = toISODate(attempt.createdAt);
    if (dateMap.has(key)) {
      dateMap.set(key, (dateMap.get(key) ?? 0) + attempt.elapsedMs);
    }
  }

  return days.map((d) => ({
    date: d.date,
    // Convert ms → minutes, round to 1 decimal
    minutes: Math.round((dateMap.get(d.date) ?? 0) / 60_000 * 10) / 10,
  }));
}

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

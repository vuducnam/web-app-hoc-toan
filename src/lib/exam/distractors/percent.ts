// Percent distractors - mimic forgetting /100, sign confusion, raw-percent error.
import "server-only";
import type { DistractorFn } from "./types";

function parseNumber(s: string): number | null {
  const t = s.trim().replace(",", ".").replace("%", "");
  if (!/^-?\d+(\.\d+)?$/.test(t)) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

function detectPlaces(s: string): number {
  const t = s.trim().replace(",", ".").replace("%", "");
  const i = t.indexOf(".");
  return i === -1 ? 0 : t.length - i - 1;
}

function format(n: number, places: number, hasPercent: boolean): string {
  const base = places > 0 ? n.toFixed(places).replace(".", ",") : String(Math.round(n));
  return hasPercent ? `${base}%` : base;
}

export const percentDistractors: DistractorFn = (correct, _rng) => {
  const hasPercent = correct.trim().endsWith("%");
  const n = parseNumber(correct);
  const places = detectPlaces(correct);
  if (n === null) return ["0", "10", "100"];

  const out: string[] = [];
  const seen = new Set<string>([correct.trim()]);

  const push = (n2: number) => {
    if (!Number.isFinite(n2)) return;
    const s = format(n2, places, hasPercent);
    if (!seen.has(s)) {
      seen.add(s);
      out.push(s);
    }
  };

  // P1: forgot ÷100 - multiply by 100
  push(n * 100);
  // P2: forgot ×100 - divide by 100
  push(n / 100);
  // P3: off by 10 (decimal misplace)
  push(n * 10);
  push(n / 10);
  // P4: subtract from 100 (mistook complement)
  if (n < 100 && n > 0) push(100 - n);

  // Backup
  let bump = 1;
  while (out.length < 3) {
    push(n + bump);
    bump++;
    if (bump > 50) break;
  }
  return out.slice(0, 3);
};

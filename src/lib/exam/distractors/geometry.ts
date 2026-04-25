// Geometry distractors - mimic forgetting ÷2, mixing perimeter/area, diameter/radius.
import "server-only";
import type { DistractorFn } from "./types";

function parseNum(s: string): number | null {
  const t = s.trim().replace(",", ".");
  if (!/^-?\d+(\.\d+)?$/.test(t)) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

function detectPlaces(s: string): number {
  const t = s.trim().replace(",", ".");
  const i = t.indexOf(".");
  return i === -1 ? 0 : t.length - i - 1;
}

function fmt(n: number, places: number): string {
  return places > 0 ? n.toFixed(places).replace(".", ",") : String(Math.round(n));
}

export const geometryDistractors: DistractorFn = (correct, _rng) => {
  const n = parseNum(correct);
  const places = detectPlaces(correct);
  if (n === null) return ["0", "10", "100"];

  const out: string[] = [];
  const seen = new Set<string>([correct.trim()]);
  const push = (v: number) => {
    if (!Number.isFinite(v) || v < 0) return;
    const s = fmt(v, places);
    if (!seen.has(s)) {
      seen.add(s);
      out.push(s);
    }
  };

  // P1: forgot ÷2 (triangle/trapezoid area)
  push(n * 2);
  // P2: extra ÷2
  push(n / 2);
  // P3: used diameter instead of radius (×4 for area, ×2 for circumference)
  push(n * 4);
  // P4: off-by-π factor confusion (~3.14)
  push(Math.round(n * 3.14 * 10) / 10);
  // P5: subtract a sensible chunk
  push(n - Math.max(1, Math.round(n * 0.1)));

  // Backup
  let bump = 5;
  while (out.length < 3) {
    push(n + bump);
    bump += 5;
    if (bump > 500) break;
  }
  return out.slice(0, 3);
};

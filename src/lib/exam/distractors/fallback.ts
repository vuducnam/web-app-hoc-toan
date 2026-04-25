// Fallback distractor - generic ±N for any unmatched skill family.
import "server-only";
import type { DistractorFn } from "./types";

export const fallbackDistractors: DistractorFn = (correct, _rng) => {
  const trimmed = correct.trim();
  // Try to find a number
  const m = trimmed.match(/^(-?\d+(?:[.,]\d+)?)/);
  if (m) {
    const numStr = m[1].replace(",", ".");
    const places = numStr.includes(".") ? numStr.length - numStr.indexOf(".") - 1 : 0;
    const n = Number(numStr);
    const suffix = trimmed.slice(m[0].length);
    const fmt = (v: number) => {
      const base = places > 0 ? v.toFixed(places).replace(".", ",") : String(Math.round(v));
      return suffix ? `${base}${suffix}` : base;
    };
    const candidates = [n + 1, n - 1, n + 10, n + 2, n * 2];
    const seen = new Set<string>([trimmed]);
    const out: string[] = [];
    for (const c of candidates) {
      if (!Number.isFinite(c)) continue;
      const s = fmt(c);
      if (!seen.has(s)) {
        seen.add(s);
        out.push(s);
        if (out.length === 3) return out;
      }
    }
    let bump = 3;
    while (out.length < 3) {
      const s = fmt(n + bump);
      if (!seen.has(s)) { seen.add(s); out.push(s); }
      bump++;
      if (bump > 50) break;
    }
    return out;
  }
  // Non-numeric fallback - shouldn't happen for math exams, return safe defaults
  return [`${trimmed}_a`, `${trimmed}_b`, `${trimmed}_c`];
};

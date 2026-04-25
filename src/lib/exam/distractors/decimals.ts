// Decimal distractors - mimic common student errors with decimal arithmetic.
// Patterns: misplace decimal point, ignore decimal, wrong digit shift.
import "server-only";
import type { DistractorFn } from "./types";

const VN_DECIMAL_RE = /^-?\d+(?:[.,]\d+)?$/;

function parseDec(s: string): number | null {
  const t = s.trim().replace(",", ".");
  if (!VN_DECIMAL_RE.test(s.trim())) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

function toVn(n: number, places: number): string {
  return n.toFixed(places).replace(".", ",");
}

function detectPlaces(s: string): number {
  const t = s.trim().replace(",", ".");
  const i = t.indexOf(".");
  return i === -1 ? 0 : t.length - i - 1;
}

export const decimalDistractors: DistractorFn = (correct, rng) => {
  const n = parseDec(correct);
  const places = detectPlaces(correct);
  if (n === null) {
    return ["0", "1", "10"];
  }
  const variants: number[] = [];

  // P1: shift decimal point one place (multiply or divide by 10)
  if (rng.bool()) variants.push(n * 10);
  else variants.push(n / 10);

  // P2: drop decimal entirely (treat as integer)
  if (places > 0) {
    variants.push(Number(String(n).replace(/[-.]/g, "")));
  } else {
    variants.push(n + 1);
  }

  // P3: off by one in integer part
  variants.push(n + (rng.bool() ? 1 : -1));

  // P4 backup: shift other direction
  variants.push(n * 100);

  const seen = new Set<string>([correct.trim()]);
  const out: string[] = [];
  for (const v of variants) {
    if (!Number.isFinite(v)) continue;
    const formatted = places > 0 ? toVn(v, places) : String(Math.round(v));
    if (!seen.has(formatted)) {
      seen.add(formatted);
      out.push(formatted);
      if (out.length === 3) break;
    }
  }
  // Ensure 3 unique distractors
  let bump = 2;
  while (out.length < 3) {
    const f = places > 0 ? toVn(n + bump, places) : String(Math.round(n) + bump);
    if (!seen.has(f)) {
      seen.add(f);
      out.push(f);
    }
    bump++;
    if (bump > 50) break;
  }
  return out;
};

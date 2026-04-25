// Arithmetic distractors - mimic carry errors, off-by-power-10, digit swaps.
import "server-only";
import type { DistractorFn } from "./types";

function parseInt10(s: string): number | null {
  const t = s.trim().replace(/[\s,]/g, "");
  if (!/^-?\d+$/.test(t)) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

function swapLastTwoDigits(n: number): number {
  const s = String(Math.abs(n));
  if (s.length < 2) return n;
  const swapped = s.slice(0, -2) + s[s.length - 1] + s[s.length - 2];
  const v = Number(swapped);
  return n < 0 ? -v : v;
}

export const arithmeticDistractors: DistractorFn = (correct, rng) => {
  const n = parseInt10(correct);
  if (n === null) return ["0", "1", "10"];

  const out: string[] = [];
  const seen = new Set<string>([correct.trim()]);
  const push = (v: number) => {
    if (!Number.isFinite(v)) return;
    const s = String(Math.round(v));
    if (!seen.has(s)) {
      seen.add(s);
      out.push(s);
    }
  };

  // P1: off-by-one (carry mistake)
  push(n + (rng.bool() ? 1 : -1));

  // P2: ±10 or ±100 (power-of-10 error)
  push(n + 10);
  push(n - 10);
  if (Math.abs(n) > 100) push(n + 100);

  // P3: swap last two digits
  const swapped = swapLastTwoDigits(n);
  if (swapped !== n) push(swapped);

  // Backup
  let bump = 2;
  while (out.length < 3) {
    push(n + bump);
    push(n - bump);
    bump++;
    if (bump > 100) break;
  }
  return out.slice(0, 3);
};

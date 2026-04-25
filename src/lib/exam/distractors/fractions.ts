// Fraction distractors - mimic common errors: invert, add num+den, no simplify.
import "server-only";
import type { DistractorFn } from "./types";

interface Frac { num: number; den: number; whole?: number }

function parseFrac(s: string): Frac | null {
  const t = s.trim();
  // Mixed: "1 2/3" or "1.2/3" not handled - just plain fraction or integer
  const mixedMatch = t.match(/^(-?\d+)\s+(\d+)\/(\d+)$/);
  if (mixedMatch) {
    return { whole: Number(mixedMatch[1]), num: Number(mixedMatch[2]), den: Number(mixedMatch[3]) };
  }
  const fracMatch = t.match(/^(-?\d+)\/(\d+)$/);
  if (fracMatch) {
    return { num: Number(fracMatch[1]), den: Number(fracMatch[2]) };
  }
  const intMatch = t.match(/^-?\d+$/);
  if (intMatch) {
    return { num: Number(t), den: 1 };
  }
  return null;
}

function fmtFrac(f: Frac): string {
  if (f.den === 1) return String(f.num);
  if (f.whole !== undefined && f.whole !== 0) return `${f.whole} ${f.num}/${f.den}`;
  return `${f.num}/${f.den}`;
}

function gcd(a: number, b: number): number {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a || 1;
}

export const fractionDistractors: DistractorFn = (correct, rng) => {
  const f = parseFrac(correct);
  if (!f) return ["1/2", "2/3", "3/4"];
  const out: string[] = [];
  const seen = new Set<string>([correct.trim()]);

  const push = (s: string) => {
    if (!seen.has(s)) {
      seen.add(s);
      out.push(s);
    }
  };

  // P1: invert num/den
  if (f.den !== 0 && f.num !== 0) push(fmtFrac({ num: f.den, den: Math.abs(f.num) }));

  // P2: add 1 to numerator only
  push(fmtFrac({ num: f.num + 1, den: f.den }));

  // P3: don't simplify - multiply both by 2
  push(fmtFrac({ num: f.num * 2, den: f.den * 2 }));

  // P4: subtract 1 from denominator (off-by-one)
  if (f.den > 1) push(fmtFrac({ num: f.num, den: f.den - 1 }));

  // P5: add 1 to both
  push(fmtFrac({ num: f.num + 1, den: f.den + 1 }));

  // P6: swap with simplified-half
  const g = gcd(f.num, f.den);
  if (g > 1) push(fmtFrac({ num: f.num / g, den: f.den / g }));

  // Trim to 3 - prefer first 3 for determinism
  while (out.length < 3) {
    const bump = out.length + 2;
    push(fmtFrac({ num: f.num + bump, den: f.den }));
    if (out.length > 10) break;
  }
  // Mild shuffle hint via rng to avoid always same order
  if (out.length > 3 && rng.bool()) {
    [out[0], out[1]] = [out[1], out[0]];
  }
  return out.slice(0, 3);
};

// Word problem distractors - mimic intermediate-step results, swapped operands, wrong operator.
import "server-only";
import type { DistractorFn } from "./types";

function parseAny(s: string): number | null {
  const t = s.trim().replace(",", ".").replace(/[^\d.\-]/g, "");
  if (!/^-?\d+(\.\d+)?$/.test(t)) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

function detectPlaces(s: string): number {
  const t = s.trim().replace(",", ".");
  const i = t.indexOf(".");
  if (i === -1) return 0;
  // Only count digits after dot until non-digit
  let count = 0;
  for (let k = i + 1; k < t.length; k++) {
    if (/\d/.test(t[k])) count++;
    else break;
  }
  return count;
}

function detectUnit(s: string): string {
  const m = s.trim().match(/[a-zA-Zđơỗốộệặệủỉẫắứưặẵẳễọớợọờàáâãèéêìíòóôõùúüỳýỹốẽẻị²³]+$/i);
  return m ? m[0] : "";
}

function fmt(n: number, places: number, unit: string): string {
  const base = places > 0 ? n.toFixed(places).replace(".", ",") : String(Math.round(n));
  return unit ? `${base} ${unit}` : base;
}

export const wordProblemDistractors: DistractorFn = (correct, rng) => {
  const n = parseAny(correct);
  const places = detectPlaces(correct);
  const unit = detectUnit(correct);
  if (n === null) return ["0", "1", "10"];

  const out: string[] = [];
  const seen = new Set<string>([correct.trim().replace(/\s+/g, " ")]);
  const push = (v: number) => {
    if (!Number.isFinite(v) || v < 0) return;
    const s = fmt(v, places, unit);
    if (!seen.has(s)) {
      seen.add(s);
      out.push(s);
    }
  };

  // P1: intermediate-step result (half/double - skipped final step)
  push(n / 2);
  push(n * 2);
  // P2: off-by-magnitude (used wrong operator)
  push(n + 10);
  push(Math.max(0, n - 10));
  // P3: swap last digits
  const intPart = Math.round(Math.abs(n));
  if (intPart >= 10) {
    const s = String(intPart);
    const swapped = Number(s.slice(0, -2) + s[s.length - 1] + s[s.length - 2]);
    if (Number.isFinite(swapped)) push(n < 0 ? -swapped : swapped);
  }
  // P4: percent off
  push(Math.round(n * 1.1 * 100) / 100);
  push(Math.round(n * 0.9 * 100) / 100);

  // Backup
  let bump = 3;
  while (out.length < 3) {
    push(n + bump);
    bump++;
    if (bump > 100) break;
  }
  // Light shuffle
  if (rng.bool() && out.length > 1) {
    [out[0], out[1]] = [out[1], out[0]];
  }
  return out.slice(0, 3);
};

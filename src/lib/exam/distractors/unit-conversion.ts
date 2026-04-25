// Unit conversion distractors - mimic wrong power-of-10 shifts.
import "server-only";
import type { DistractorFn } from "./types";

function parseNum(s: string): { num: number; unit: string; places: number } | null {
  const t = s.trim().replace(",", ".");
  // Match: number + optional unit (m, cm, km, kg, g, l, ml, etc)
  const m = t.match(/^(-?\d+(?:\.\d+)?)\s*([a-zA-Z²³]*)$/);
  if (!m) return null;
  const n = Number(m[1]);
  if (!Number.isFinite(n)) return null;
  const places = m[1].includes(".") ? m[1].length - m[1].indexOf(".") - 1 : 0;
  return { num: n, unit: m[2] ?? "", places };
}

function fmt(n: number, places: number, unit: string): string {
  const base = places > 0 ? n.toFixed(places).replace(".", ",") : String(Math.round(n));
  return unit ? `${base} ${unit}` : base;
}

export const unitConversionDistractors: DistractorFn = (correct, _rng) => {
  const p = parseNum(correct);
  if (!p) return ["0", "1", "10"];

  const out: string[] = [];
  const seen = new Set<string>([correct.trim().replace(/\s+/g, " ")]);
  const push = (n: number) => {
    if (!Number.isFinite(n) || n < 0) return;
    const s = fmt(n, p.places, p.unit);
    if (!seen.has(s)) {
      seen.add(s);
      out.push(s);
    }
  };

  // P1: off by power of 10
  push(p.num * 10);
  push(p.num / 10);
  // P2: off by power of 100
  push(p.num * 100);
  push(p.num / 100);
  // P3: off by 1000
  push(p.num * 1000);

  // Backup
  let bump = 1;
  while (out.length < 3) {
    push(p.num + bump);
    bump++;
    if (bump > 50) break;
  }
  return out.slice(0, 3);
};

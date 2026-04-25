// Distractor orchestrator - resolve skill family + build 4-choice MC payload.
import "server-only";
import type { SeededRng } from "@/lib/generators/seeded-rng";
import type { BuildChoicesResult, DistractorFamily, DistractorFn, MCChoice } from "./types";
import { decimalDistractors } from "./decimals";
import { fractionDistractors } from "./fractions";
import { percentDistractors } from "./percent";
import { arithmeticDistractors } from "./arithmetic";
import { geometryDistractors } from "./geometry";
import { unitConversionDistractors } from "./unit-conversion";
import { wordProblemDistractors } from "./word-problems";
import { fallbackDistractors } from "./fallback";

const REGISTRY: Record<DistractorFamily, DistractorFn> = {
  decimals: decimalDistractors,
  fractions: fractionDistractors,
  percent: percentDistractors,
  arithmetic: arithmeticDistractors,
  geometry: geometryDistractors,
  "unit-conversion": unitConversionDistractors,
  "word-problems": wordProblemDistractors,
  fallback: fallbackDistractors,
};

/** Map a skillKey (registry id) to a distractor family. */
export function resolveFamily(skillKey: string): DistractorFamily {
  // word-* takes priority since word problems wrap any topic
  if (skillKey.startsWith("word-")) return "word-problems";
  if (skillKey.startsWith("decimal-") || skillKey.includes("-decimal")) return "decimals";
  if (skillKey.startsWith("fraction-") || skillKey.includes("-fraction")) return "fractions";
  if (skillKey.includes("percent")) return "percent";
  if (
    skillKey.includes("triangle") ||
    skillKey.includes("trapezoid") ||
    skillKey.includes("rectangle") ||
    skillKey.includes("circle") ||
    skillKey.includes("rectangular-prism") ||
    skillKey.includes("box") ||
    skillKey.includes("cylinder") ||
    skillKey === "geometry-review" ||
    skillKey.includes("rhombus") ||
    skillKey.includes("parallelogram")
  ) return "geometry";
  if (
    skillKey.includes("conversion") ||
    skillKey.includes("-units") ||
    skillKey === "time-measurement"
  ) return "unit-conversion";
  if (
    skillKey.startsWith("add-") ||
    skillKey.startsWith("sub-") ||
    skillKey.startsWith("multiply-") ||
    skillKey.startsWith("divide-") ||
    skillKey === "even-odd" ||
    skillKey === "rounding" ||
    skillKey === "place-value-6digit" ||
    skillKey === "6-digit-numbers" ||
    skillKey === "numbers-to-100k" ||
    skillKey.includes("review-arithmetic") ||
    skillKey === "natural-numbers-review"
  ) return "arithmetic";
  return "fallback";
}

/** Fisher-Yates shuffle using seeded RNG. */
function shuffleSeeded<T>(arr: T[], rng: SeededRng): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = rng.int(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Build 4-option MC payload (A/B/C/D) for a correct answer.
 * Deterministic: same (correct, skillKey, rng-seed) yields identical output.
 */
export function buildChoices(
  correctAnswer: string,
  skillKey: string,
  rng: SeededRng,
): BuildChoicesResult {
  const family = resolveFamily(skillKey);
  const fn = REGISTRY[family];
  let distractors = fn(correctAnswer, rng);

  // Defensive: ensure 3 unique distractors not equal to correct
  const seen = new Set<string>([correctAnswer.trim()]);
  const cleaned: string[] = [];
  for (const d of distractors) {
    const t = d.trim();
    if (!seen.has(t)) {
      seen.add(t);
      cleaned.push(t);
      if (cleaned.length === 3) break;
    }
  }
  // Pad with fallback if family produced too few uniques
  if (cleaned.length < 3) {
    const fallback = fallbackDistractors(correctAnswer, rng);
    for (const f of fallback) {
      const t = f.trim();
      if (!seen.has(t)) {
        seen.add(t);
        cleaned.push(t);
        if (cleaned.length === 3) break;
      }
    }
  }
  // Final guarantee: pad with synthetic strings if still short (rare)
  let synth = 1;
  while (cleaned.length < 3) {
    const candidate = `${correctAnswer}_${synth}`;
    if (!seen.has(candidate)) {
      seen.add(candidate);
      cleaned.push(candidate);
    }
    synth++;
  }

  const all = shuffleSeeded([correctAnswer, ...cleaned], rng);
  const correctIndex = all.indexOf(correctAnswer);
  const labels: MCChoice["label"][] = ["A", "B", "C", "D"];
  return {
    choices: all.map((value, i) => ({ label: labels[i], value })),
    correctIndex,
  };
}

export type { BuildChoicesResult, MCChoice, DistractorFn, DistractorFamily } from "./types";

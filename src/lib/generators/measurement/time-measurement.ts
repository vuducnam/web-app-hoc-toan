import "server-only";
// Time measurement generator for Vietnamese G5 curriculum.
// Three explicit templates (pinned to difficulty):
//   D1: simple unit conversion — giờ↔phút, phút↔giây (only divisible cases, answer integer)
//       e.g. "3 giờ = ? phút" → 180
//   D2: composite conversion — "H giờ M phút = ? phút" or "P phút S giây = ? giây"
//       e.g. "2 giờ 45 phút = ? phút" → 165
//   D3: time arithmetic — sum or difference of two times, answer in minutes or seconds
//       sum:  "1 giờ 45 phút + 2 giờ 30 phút = ? phút" → 255
//       diff: "3 giờ 20 phút - 1 giờ 50 phút = ? phút" → 90
// All answers are NUMERIC (integer, in the unit stated in the question).
import { makeRng } from "../seeded-rng";
import { parseNumeric } from "../normalize/numeric";
import type { Generator, GeneratorParams, Question } from "../types";

const TIME_SEC: Record<number, number> = { 1: 45, 2: 60, 3: 60 };

// ── D1 helpers ────────────────────────────────────────────────────────────────

function generateD1(rng: ReturnType<typeof makeRng>): {
  problemText: string;
  expectedAnswer: number;
} {
  // Randomly pick conversion type: giờ→phút, phút→giờ (divisible), phút→giây, giây→phút (divisible)
  const type = rng.int(0, 3);

  if (type === 0) {
    // giờ → phút
    const hours = rng.int(1, 9);
    return { problemText: `Đổi: ${hours} giờ = ? phút`, expectedAnswer: hours * 60 };
  } else if (type === 1) {
    // phút → giờ (only multiples of 60)
    const hours = rng.int(1, 9);
    const minutes = hours * 60;
    return { problemText: `Đổi: ${minutes} phút = ? giờ`, expectedAnswer: hours };
  } else if (type === 2) {
    // phút → giây
    const mins = rng.int(1, 9);
    return { problemText: `Đổi: ${mins} phút = ? giây`, expectedAnswer: mins * 60 };
  } else {
    // giây → phút (only multiples of 60)
    const mins = rng.int(1, 9);
    const secs = mins * 60;
    return { problemText: `Đổi: ${secs} giây = ? phút`, expectedAnswer: mins };
  }
}

// ── D2 helpers ────────────────────────────────────────────────────────────────

function generateD2(rng: ReturnType<typeof makeRng>): {
  problemText: string;
  expectedAnswer: number;
} {
  // Randomly pick composite type: H giờ M phút → phút, or P phút S giây → giây
  const useHourMinute = rng.bool();

  if (useHourMinute) {
    const hours = rng.int(1, 5);
    const mins = rng.int(1, 59);
    const totalMinutes = hours * 60 + mins;
    return {
      problemText: `Đổi: ${hours} giờ ${mins} phút = ? phút`,
      expectedAnswer: totalMinutes,
    };
  } else {
    const mins = rng.int(1, 9);
    const secs = rng.int(1, 59);
    const totalSeconds = mins * 60 + secs;
    return {
      problemText: `Đổi: ${mins} phút ${secs} giây = ? giây`,
      expectedAnswer: totalSeconds,
    };
  }
}

// ── D3 helpers ────────────────────────────────────────────────────────────────

function generateD3(rng: ReturnType<typeof makeRng>): {
  problemText: string;
  expectedAnswer: number;
} {
  // sum or diff of two times expressed in "H giờ M phút", answer in phút
  const isSum = rng.bool();

  if (isSum) {
    const h1 = rng.int(0, 5);
    const m1 = rng.int(0, 59);
    const h2 = rng.int(0, 5);
    const m2 = rng.int(0, 59);
    const total = (h1 * 60 + m1) + (h2 * 60 + m2);

    const part1 = formatHourMin(h1, m1);
    const part2 = formatHourMin(h2, m2);
    return {
      problemText: `${part1} + ${part2} = ? phút`,
      expectedAnswer: total,
    };
  } else {
    // Ensure positive result: pick larger first
    const h1 = rng.int(1, 8);
    const m1 = rng.int(0, 59);
    const h2 = rng.int(0, h1);
    // m2 must keep result >= 0; clamp to ensure minuend >= subtrahend
    const total1 = h1 * 60 + m1;
    const maxTotal2 = total1 - 1; // at least 1 minute result
    const rawTotal2 = rng.int(0, Math.min(maxTotal2, 8 * 60 + 59));
    const safeTotal2 = Math.min(rawTotal2, maxTotal2);
    const h2safe = Math.min(h2, Math.floor(safeTotal2 / 60));
    const m2 = safeTotal2 - h2safe * 60;
    const diff = total1 - (h2safe * 60 + m2);

    const part1 = formatHourMin(h1, m1);
    const part2 = formatHourMin(h2safe, m2);
    return {
      problemText: `${part1} - ${part2} = ? phút`,
      expectedAnswer: diff,
    };
  }
}

/** Format as "H giờ M phút" or "H giờ" or "M phút" depending on values. */
function formatHourMin(h: number, m: number): string {
  if (h === 0) return `${m} phút`;
  if (m === 0) return `${h} giờ`;
  return `${h} giờ ${m} phút`;
}

// ── Generator export ──────────────────────────────────────────────────────────

export const timeMeasurement: Generator<number> = {
  generate(p: GeneratorParams): Question<number> {
    const { seed, difficulty, skillKey } = p;
    const d = difficulty as 1 | 2 | 3;
    const rng = makeRng(seed);

    const { problemText, expectedAnswer } =
      d === 1 ? generateD1(rng) :
      d === 2 ? generateD2(rng) :
                generateD3(rng);

    return {
      id: `${skillKey}-${seed}`,
      skillKey,
      problemText,
      answerFormat: "numeric",
      expectedAnswer,
      metadata: { difficulty: d, seed, skillKey, timeEstimateSec: TIME_SEC[d] },
    };
  },

  validate(userAnswer: string, q: Question<number>): boolean {
    const n = parseNumeric(userAnswer);
    return n !== null && n === q.expectedAnswer;
  },
};

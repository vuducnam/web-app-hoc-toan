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
  explanation: string;
} {
  // Randomly pick conversion type: giờ→phút, phút→giờ (divisible), phút→giây, giây→phút (divisible)
  const type = rng.int(0, 3);

  if (type === 0) {
    // giờ → phút
    const hours = rng.int(1, 9);
    const ans = hours * 60;
    return {
      problemText: `Đổi: ${hours} giờ = ? phút`,
      expectedAnswer: ans,
      explanation: `$${hours}\\,\\text{giờ} = ${ans}\\,\\text{phút}$. Đổi: $1\\,\\text{giờ} = 60\\,\\text{phút}$, nên $${hours} \\times 60 = ${ans}$.`,
    };
  } else if (type === 1) {
    // phút → giờ (only multiples of 60)
    const hours = rng.int(1, 9);
    const minutes = hours * 60;
    return {
      problemText: `Đổi: ${minutes} phút = ? giờ`,
      expectedAnswer: hours,
      explanation: `$${minutes}\\,\\text{phút} = ${hours}\\,\\text{giờ}$. Đổi: $60\\,\\text{phút} = 1\\,\\text{giờ}$, nên $${minutes} \\div 60 = ${hours}$.`,
    };
  } else if (type === 2) {
    // phút → giây
    const mins = rng.int(1, 9);
    const ans = mins * 60;
    return {
      problemText: `Đổi: ${mins} phút = ? giây`,
      expectedAnswer: ans,
      explanation: `$${mins}\\,\\text{phút} = ${ans}\\,\\text{giây}$. Đổi: $1\\,\\text{phút} = 60\\,\\text{giây}$, nên $${mins} \\times 60 = ${ans}$.`,
    };
  } else {
    // giây → phút (only multiples of 60)
    const mins = rng.int(1, 9);
    const secs = mins * 60;
    return {
      problemText: `Đổi: ${secs} giây = ? phút`,
      expectedAnswer: mins,
      explanation: `$${secs}\\,\\text{giây} = ${mins}\\,\\text{phút}$. Đổi: $60\\,\\text{giây} = 1\\,\\text{phút}$, nên $${secs} \\div 60 = ${mins}$.`,
    };
  }
}

// ── D2 helpers ────────────────────────────────────────────────────────────────

function generateD2(rng: ReturnType<typeof makeRng>): {
  problemText: string;
  expectedAnswer: number;
  explanation: string;
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
      explanation:
        `$${hours}\\,\\text{giờ}\\;${mins}\\,\\text{phút} = ${totalMinutes}\\,\\text{phút}$.\n\n` +
        `$${hours} \\times 60 + ${mins} = ${hours * 60} + ${mins} = ${totalMinutes}$.`,
    };
  } else {
    const mins = rng.int(1, 9);
    const secs = rng.int(1, 59);
    const totalSeconds = mins * 60 + secs;
    return {
      problemText: `Đổi: ${mins} phút ${secs} giây = ? giây`,
      expectedAnswer: totalSeconds,
      explanation:
        `$${mins}\\,\\text{phút}\\;${secs}\\,\\text{giây} = ${totalSeconds}\\,\\text{giây}$.\n\n` +
        `$${mins} \\times 60 + ${secs} = ${mins * 60} + ${secs} = ${totalSeconds}$.`,
    };
  }
}

// ── D3 helpers ────────────────────────────────────────────────────────────────

function generateD3(rng: ReturnType<typeof makeRng>): {
  problemText: string;
  expectedAnswer: number;
  explanation: string;
} {
  // sum or diff of two times expressed in "H giờ M phút", answer in phút
  const isSum = rng.bool();

  if (isSum) {
    const h1 = rng.int(0, 5);
    const m1 = rng.int(0, 59);
    const h2 = rng.int(0, 5);
    const m2 = rng.int(0, 59);
    const t1 = h1 * 60 + m1;
    const t2 = h2 * 60 + m2;
    const total = t1 + t2;

    const part1 = formatHourMin(h1, m1);
    const part2 = formatHourMin(h2, m2);
    return {
      problemText: `${part1} + ${part2} = ? phút`,
      expectedAnswer: total,
      explanation:
        `Đổi về phút: $${part1} = ${t1}\\,\\text{phút}$; $${part2} = ${t2}\\,\\text{phút}$.\n\n` +
        `Tổng: $${t1} + ${t2} = ${total}\\,\\text{phút}$.`,
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
      explanation:
        `Đổi về phút: $${part1} = ${total1}\\,\\text{phút}$; $${part2} = ${safeTotal2}\\,\\text{phút}$.\n\n` +
        `Hiệu: $${total1} - ${safeTotal2} = ${diff}\\,\\text{phút}$.`,
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

    const { problemText, expectedAnswer, explanation } =
      d === 1 ? generateD1(rng) :
      d === 2 ? generateD2(rng) :
                generateD3(rng);

    return {
      id: `${skillKey}-${seed}`,
      skillKey,
      problemText,
      answerFormat: "numeric",
      expectedAnswer,
      explanation,
      metadata: { difficulty: d, seed, skillKey, timeEstimateSec: TIME_SEC[d] },
    };
  },

  validate(userAnswer: string, q: Question<number>): boolean {
    const n = parseNumeric(userAnswer);
    return n !== null && n === q.expectedAnswer;
  },
};

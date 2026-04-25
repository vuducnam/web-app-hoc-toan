import "server-only";
// Word problem generator — comprehensive year-end review (ôn tập cuối năm lớp 5).
// g5-word-year-review: multi-skill mix — combines speed/distance, %, area.
// All answers are integers (inputs constrained).
// D1: 2-step problems; D2: 2-step with larger numbers; D3: 3-step problems.
// answerFormat: numeric; expectedAnswer: integer.
import { makeRng } from "../seeded-rng";
import { parseNumeric } from "../normalize/numeric";
import type { Generator, GeneratorParams, Question } from "../types";

const TIME_SEC: Record<number, number> = { 1: 90, 2: 90, 3: 90 };

// Speed-distance: v × t = s (all integers)
const SPEEDS: Record<number, number[]> = {
  1: [20, 30, 40, 50],
  2: [30, 40, 50, 60, 70, 80],
  3: [40, 50, 60, 70, 80, 90, 100],
};
const TIMES: Record<number, number[]> = {
  1: [1, 2, 3],
  2: [2, 3, 4, 5],
  3: [2, 3, 4, 5, 6],
};

// Percent problems: total kg, p% sold → remainder (integer)
const STOCK_TOTALS: Record<number, number[]> = {
  1: [100, 200, 300, 400],
  2: [100, 200, 300, 400, 500],
  3: [200, 300, 400, 500, 600],
};
const STOCK_PERCENTS: Record<number, number[]> = {
  1: [10, 20, 50],
  2: [25, 40, 75],
  3: [15, 30, 60, 80],
};

// Rectangle area expansion: a × b → new area after adding x to length
const RECT_A: Record<number, number[]> = {
  1: [4, 5, 6, 8, 10],
  2: [6, 8, 10, 12],
  3: [8, 10, 12, 14, 15],
};
const RECT_B: Record<number, number[]> = {
  1: [3, 4, 5],
  2: [4, 5, 6, 7],
  3: [5, 6, 7, 8],
};
const RECT_X: Record<number, number[]> = {
  1: [1, 2, 3],
  2: [2, 3, 4],
  3: [3, 4, 5, 6],
};

// --- Template builders ---

// Template 1: speed × time → distance
function buildSpeedDist(v: number, t: number): {
  problemText: string; expectedAnswer: number; explanation: string;
} {
  const s = v * t;
  // construct departure/arrival times: depart at hour h1, travel t hours → arrive h2
  const h1 = 7; // 7 giờ
  const h2 = h1 + t;
  return {
    problemText: `Một xe ô tô khởi hành lúc ${h1} giờ, đi với vận tốc ${v} km/giờ. Đến lúc ${h2} giờ xe đến nơi. Hỏi quãng đường xe đã đi được bao nhiêu ki-lô-mét?`,
    expectedAnswer: s,
    explanation:
      `**Bài giải:**\n\nThời gian xe đi là:\n\n$${h2} - ${h1} = ${t}$ (giờ).\n\nQuãng đường xe đi được là:\n\n$s = v \\times t = ${v} \\times ${t} = ${s}$ (km).\n\n**Đáp số:** ${s} km.`,
  };
}

// Template 2: warehouse % sold → remainder
function buildWarehousePercent(total: number, pct: number): {
  problemText: string; expectedAnswer: number; explanation: string;
} {
  const sold = Math.round((pct / 100) * total);
  const remaining = total - sold;
  return {
    problemText: `Kho có ${total} kg gạo. Người ta đã bán ${pct}% số gạo trong kho. Hỏi kho còn lại bao nhiêu ki-lô-gam gạo?`,
    expectedAnswer: remaining,
    explanation:
      `**Bài giải:**\n\nSố ki-lô-gam gạo đã bán là:\n\n$${total} \\times ${pct}\\% = ${total} \\times \\dfrac{${pct}}{100} = ${sold}$ (kg).\n\nSố ki-lô-gam gạo còn lại là:\n\n$${total} - ${sold} = ${remaining}$ (kg).\n\n**Đáp số:** ${remaining} kg.`,
  };
}

// Template 3: rectangle new area after length expanded (2-step)
function buildRectExpand(a: number, b: number, x: number): {
  problemText: string; expectedAnswer: number; explanation: string;
} {
  const newA = a + x;
  const newArea = newA * b;
  return {
    problemText: `Vườn hình chữ nhật có chiều dài ${a} m, chiều rộng ${b} m. Người ta tăng chiều dài thêm ${x} m và giữ nguyên chiều rộng. Tính diện tích mảnh vườn mới.`,
    expectedAnswer: newArea,
    explanation:
      `**Bài giải:**\n\nChiều dài mới là:\n\n$${a} + ${x} = ${newA}$ (m).\n\nDiện tích mảnh vườn mới là:\n\n$S = ${newA} \\times ${b} = ${newArea}$ (m²).\n\n**Đáp số:** ${newArea} m².`,
  };
}

// Template 4 (D3 only): speed + percent combined — travel then calculate remaining budget
function buildSpeedAndPercent(v: number, t: number, pct: number, budget: number): {
  problemText: string; expectedAnswer: number; explanation: string;
} {
  const s = v * t;
  const spent = Math.round((pct / 100) * budget);
  const remaining = budget - spent;
  void s; // quãng đường used in explanation only
  return {
    problemText: `Chuyến đi dài ${s} km. Xe đi với vận tốc ${v} km/giờ trong ${t} giờ thì đến nơi. Sau chuyến đi, gia đình còn lại ${remaining} nghìn đồng sau khi đã tiêu ${pct}% số tiền mang theo là ${budget} nghìn đồng. Số tiền đã tiêu là bao nhiêu nghìn đồng?`,
    expectedAnswer: spent,
    explanation:
      `**Bài giải:**\n\nSố tiền đã tiêu là:\n\n$${budget} \\times ${pct}\\% = ${budget} \\times \\dfrac{${pct}}{100} = ${spent}$ (nghìn đồng).\n\n**Đáp số:** ${spent} nghìn đồng.`,
  };
}

type TemplateId = "speed-dist" | "warehouse-pct" | "rect-expand" | "speed-and-pct";

const TEMPLATES: Record<number, TemplateId[]> = {
  1: ["speed-dist", "warehouse-pct"],
  2: ["speed-dist", "warehouse-pct", "rect-expand"],
  3: ["speed-dist", "warehouse-pct", "rect-expand", "speed-and-pct"],
};

export const wordYearReview: Generator<number> = {
  generate(p: GeneratorParams): Question<number> {
    const { seed, difficulty, skillKey } = p;
    const rng = makeRng(seed);
    const d = difficulty as 1 | 2 | 3;

    const tmplId = rng.pick(TEMPLATES[d]);

    let result: { problemText: string; expectedAnswer: number; explanation: string };

    if (tmplId === "speed-dist") {
      const v = rng.pick(SPEEDS[d]);
      const t = rng.pick(TIMES[d]);
      result = buildSpeedDist(v, t);
    } else if (tmplId === "warehouse-pct") {
      const total = rng.pick(STOCK_TOTALS[d]);
      const pct = rng.pick(STOCK_PERCENTS[d]);
      result = buildWarehousePercent(total, pct);
    } else if (tmplId === "rect-expand") {
      const a = rng.pick(RECT_A[d]);
      const b = rng.pick(RECT_B[d]);
      const x = rng.pick(RECT_X[d]);
      result = buildRectExpand(a, b, x);
    } else {
      // speed-and-pct (D3 only)
      const v = rng.pick(SPEEDS[d]);
      const t = rng.pick(TIMES[d]);
      const pct = rng.pick(STOCK_PERCENTS[d]);
      const budget = rng.pick(STOCK_TOTALS[d]);
      result = buildSpeedAndPercent(v, t, pct, budget);
    }

    return {
      id: `${skillKey}-${seed}`,
      skillKey,
      problemText: result.problemText,
      answerFormat: "numeric",
      expectedAnswer: result.expectedAnswer,
      explanation: result.explanation,
      metadata: {
        difficulty: d,
        seed,
        skillKey,
        timeEstimateSec: TIME_SEC[d],
      },
    };
  },

  validate(userAnswer: string, q: Question<number>): boolean {
    const n = parseNumeric(userAnswer);
    return n !== null && n === q.expectedAnswer;
  },
};

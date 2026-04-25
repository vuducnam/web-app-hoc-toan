import "server-only";
// Word problem generator — percentage (tỉ số phần trăm) in real-life contexts.
// g5-word-percent: bài toán tính % (lớp 5).
// All answers constrained to integers by choosing compatible inputs.
// D1: 10/20/50% with round numbers; D2: 25/40/75%; D3: misc 15/30/60/80%.
// answerFormat: numeric; expectedAnswer: integer.
import { makeRng } from "../seeded-rng";
import { parseNumeric } from "../normalize/numeric";
import type { Generator, GeneratorParams, Question } from "../types";

const TIME_SEC: Record<number, number> = { 1: 90, 2: 90, 3: 90 };

// Percent values guaranteed to produce integer answers for chosen multipliers
const PERCENTS: Record<number, number[]> = {
  1: [10, 20, 50],
  2: [25, 40, 75],
  3: [15, 30, 60, 80],
};

// Base totals (multiples of 100) → p% × total always integer
const TOTALS: Record<number, number[]> = {
  1: [100, 200, 300, 400, 500],
  2: [100, 200, 400, 300],
  3: [100, 200, 300, 400, 500, 600],
};

// Prices for discount template (multiples of 100 for clean %)
const PRICES: Record<number, number[]> = {
  1: [100, 200, 300, 400, 500],
  2: [100, 200, 400, 300],
  3: [100, 200, 300, 500, 600],
};

// Areas for garden template
const AREAS: Record<number, number[]> = {
  1: [100, 200, 300, 400, 500],
  2: [100, 200, 400, 300],
  3: [100, 200, 300, 400, 500, 600],
};

// Template 1: discount — giảm p% trên giá price
function buildDiscount(p: number, price: number): {
  problemText: string; expectedAnswer: number; explanation: string;
} {
  const discount = Math.round((p / 100) * price);
  return {
    problemText: `Cửa hàng giảm giá ${p}% cho chiếc áo giá ${price} nghìn đồng. Hỏi được giảm bao nhiêu nghìn đồng?`,
    expectedAnswer: discount,
    explanation:
      `**Bài giải:**\n\nSố tiền được giảm là:\n\n$${price} \\times ${p}\\% = ${price} \\times \\dfrac{${p}}{100} = ${discount}$ (nghìn đồng).\n\n**Đáp số:** ${discount} nghìn đồng.`,
  };
}

// Template 2: students — tổng total hs, p% là nam → số nam
function buildStudents(p: number, total: number): {
  problemText: string; expectedAnswer: number; explanation: string;
} {
  const male = Math.round((p / 100) * total);
  return {
    problemText: `Lớp em có ${total} học sinh, trong đó ${p}% là học sinh nam. Hỏi lớp em có bao nhiêu học sinh nam?`,
    expectedAnswer: male,
    explanation:
      `**Bài giải:**\n\nSố học sinh nam trong lớp là:\n\n$${total} \\times ${p}\\% = ${total} \\times \\dfrac{${p}}{100} = ${male}$ (học sinh).\n\n**Đáp số:** ${male} học sinh.`,
  };
}

// Template 3: garden — diện tích area m², trồng hoa p% → diện tích trồng hoa
function buildGarden(p: number, area: number): {
  problemText: string; expectedAnswer: number; explanation: string;
} {
  const flowerArea = Math.round((p / 100) * area);
  return {
    problemText: `Mảnh vườn rộng ${area} m², trong đó ${p}% diện tích được trồng hoa. Hỏi diện tích trồng hoa là bao nhiêu m²?`,
    expectedAnswer: flowerArea,
    explanation:
      `**Bài giải:**\n\nDiện tích phần trồng hoa là:\n\n$${area} \\times ${p}\\% = ${area} \\times \\dfrac{${p}}{100} = ${flowerArea}$ (m²).\n\n**Đáp số:** ${flowerArea} m².`,
  };
}

// Template 4: warehouse — kho total kg, đã xuất p% → còn lại bao nhiêu kg
function buildWarehouse(p: number, total: number): {
  problemText: string; expectedAnswer: number; explanation: string;
} {
  const exported = Math.round((p / 100) * total);
  const remaining = total - exported;
  return {
    problemText: `Kho có ${total} kg gạo. Người ta đã xuất ${p}% số gạo đó. Hỏi trong kho còn lại bao nhiêu ki-lô-gam gạo?`,
    expectedAnswer: remaining,
    explanation:
      `**Bài giải:**\n\nSố ki-lô-gam gạo đã xuất kho là:\n\n$${total} \\times ${p}\\% = ${total} \\times \\dfrac{${p}}{100} = ${exported}$ (kg).\n\nSố ki-lô-gam gạo còn lại là:\n\n$${total} - ${exported} = ${remaining}$ (kg).\n\n**Đáp số:** ${remaining} kg.`,
  };
}

type TemplateId = "discount" | "students" | "garden" | "warehouse";

const TEMPLATE_IDS_D1: TemplateId[] = ["discount", "students", "garden"];
const TEMPLATE_IDS_D2: TemplateId[] = ["discount", "students", "garden", "warehouse"];
const TEMPLATE_IDS_D3: TemplateId[] = ["discount", "students", "warehouse", "garden"];

const TEMPLATE_IDS: Record<number, TemplateId[]> = {
  1: TEMPLATE_IDS_D1,
  2: TEMPLATE_IDS_D2,
  3: TEMPLATE_IDS_D3,
};

export const wordPercent: Generator<number> = {
  generate(p: GeneratorParams): Question<number> {
    const { seed, difficulty, skillKey } = p;
    const rng = makeRng(seed);
    const d = difficulty as 1 | 2 | 3;

    const pct = rng.pick(PERCENTS[d]);
    const tmplId = rng.pick(TEMPLATE_IDS[d]);

    let result: { problemText: string; expectedAnswer: number; explanation: string };

    if (tmplId === "discount") {
      const price = rng.pick(PRICES[d]);
      result = buildDiscount(pct, price);
    } else if (tmplId === "students") {
      const total = rng.pick(TOTALS[d]);
      result = buildStudents(pct, total);
    } else if (tmplId === "garden") {
      const area = rng.pick(AREAS[d]);
      result = buildGarden(pct, area);
    } else {
      // warehouse
      const total = rng.pick(TOTALS[d]);
      result = buildWarehouse(pct, total);
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

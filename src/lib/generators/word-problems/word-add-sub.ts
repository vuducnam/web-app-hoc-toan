import "server-only";
// G4 word problem generator — bài toán cộng/trừ có lời văn (g4-word-add-sub).
// 5 templates (T1–T5), varies subject/context, integer answers.
// D1: operands ≤ 100; D2: operands ≤ 10 000; D3: operands ≤ 100 000.
// answerFormat: numeric.
import { makeRng } from "../seeded-rng";
import { parseNumeric } from "../normalize/numeric";
import type { Generator, GeneratorParams, Question } from "../types";

const TIME_SEC: Record<number, number> = { 1: 60, 2: 75, 3: 90 };

// Number ranges per difficulty
const MAX_VAL: Record<number, number> = { 1: 100, 2: 10_000, 3: 100_000 };

/** Pick a random integer in [lo, hi] ensuring hi ≤ maxVal. */
function pickVal(rng: ReturnType<typeof makeRng>, lo: number, hi: number): number {
  return rng.int(lo, hi);
}

type TemplateId = "T1" | "T2" | "T3" | "T4" | "T5";
const ALL_TEMPLATES: TemplateId[] = ["T1", "T2", "T3", "T4", "T5"];

interface Built {
  problemText: string;
  expectedAnswer: number;
  explanation: string;
}

function buildTemplate(tpl: TemplateId, rng: ReturnType<typeof makeRng>, d: 1 | 2 | 3): Built {
  const max = MAX_VAL[d];
  // Ensure a > b for subtraction templates to avoid negative answers
  const a = rng.int(Math.floor(max * 0.5), max);
  const b = rng.int(1, Math.floor(max * 0.45));

  switch (tpl) {
    case "T1": {
      // Addition: em có a quả táo, mẹ cho thêm b quả
      const ans = a + b;
      return {
        problemText: `Em có $${a}$ quả táo. Mẹ cho thêm $${b}$ quả. Hỏi em có tất cả bao nhiêu quả táo?`,
        expectedAnswer: ans,
        explanation:
          `**Bài giải:**\n\nSố quả táo em có tất cả là:\n\n$${a} + ${b} = ${ans}$ (quả).\n\n**Đáp số:** ${ans} quả.`,
      };
    }
    case "T2": {
      // Subtraction: cửa hàng có a kg gạo, đã bán b kg
      const ans = a - b;
      return {
        problemText: `Cửa hàng có $${a}$ kg gạo. Đã bán $${b}$ kg. Hỏi cửa hàng còn lại bao nhiêu kg gạo?`,
        expectedAnswer: ans,
        explanation:
          `**Bài giải:**\n\nSố ki-lô-gam gạo còn lại là:\n\n$${a} - ${b} = ${ans}$ (kg).\n\n**Đáp số:** ${ans} kg.`,
      };
    }
    case "T3": {
      // Addition: lớp 4A có a, lớp 4B có b học sinh
      const ans = a + b;
      return {
        problemText: `Lớp 4A có $${a}$ học sinh, lớp 4B có $${b}$ học sinh. Hỏi cả hai lớp có bao nhiêu học sinh?`,
        expectedAnswer: ans,
        explanation:
          `**Bài giải:**\n\nSố học sinh cả hai lớp là:\n\n$${a} + ${b} = ${ans}$ (học sinh).\n\n**Đáp số:** ${ans} học sinh.`,
      };
    }
    case "T4": {
      // Subtraction: vườn có a cây, đã chặt b cây
      const ans = a - b;
      return {
        problemText: `Vườn nhà em có $${a}$ cây. Bố đã chặt đi $${b}$ cây. Hỏi vườn còn lại bao nhiêu cây?`,
        expectedAnswer: ans,
        explanation:
          `**Bài giải:**\n\nSố cây còn lại trong vườn là:\n\n$${a} - ${b} = ${ans}$ (cây).\n\n**Đáp số:** ${ans} cây.`,
      };
    }
    case "T5": {
      // Addition: nhà máy sản xuất a sản phẩm buổi sáng, b buổi chiều
      const ans = a + b;
      return {
        problemText: `Buổi sáng nhà máy sản xuất được $${a}$ sản phẩm, buổi chiều sản xuất được $${b}$ sản phẩm. Hỏi cả ngày nhà máy sản xuất được bao nhiêu sản phẩm?`,
        expectedAnswer: ans,
        explanation:
          `**Bài giải:**\n\nSố sản phẩm cả ngày nhà máy sản xuất được là:\n\n$${a} + ${b} = ${ans}$ (sản phẩm).\n\n**Đáp số:** ${ans} sản phẩm.`,
      };
    }
  }
}

export const wordAddSub: Generator<number> = {
  generate(p: GeneratorParams): Question<number> {
    const { seed, difficulty, skillKey } = p;
    const rng = makeRng(seed);
    const d = difficulty as 1 | 2 | 3;

    const tpl = rng.pick(ALL_TEMPLATES);
    const built = buildTemplate(tpl, rng, d);

    return {
      id: `${skillKey}-${seed}`,
      skillKey,
      problemText: built.problemText,
      answerFormat: "numeric",
      expectedAnswer: built.expectedAnswer,
      explanation: built.explanation,
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

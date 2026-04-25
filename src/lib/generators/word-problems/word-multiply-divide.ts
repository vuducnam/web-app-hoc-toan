import "server-only";
// G4 word problem generator — bài toán nhân/chia có lời văn (g4-word-multiply-divide).
// 5 templates: 3 multiplication, 2 division. Integer answers guaranteed by construction.
// D1: multiplier ≤ 9, product ≤ 81; D2: multiplier ≤ 9, multi-digit; D3: 2-digit multiplier.
// answerFormat: numeric.
import { makeRng } from "../seeded-rng";
import { parseNumeric } from "../normalize/numeric";
import type { Generator, GeneratorParams, Question } from "../types";

const TIME_SEC: Record<number, number> = { 1: 60, 2: 75, 3: 90 };

type TemplateId = "T1" | "T2" | "T3" | "T4" | "T5";
const ALL_TEMPLATES: TemplateId[] = ["T1", "T2", "T3", "T4", "T5"];

interface Built {
  problemText: string;
  expectedAnswer: number;
  explanation: string;
}

// Constraints per difficulty:
// D1: a ∈ [2,9], b ∈ [2,9]   → product ≤ 81; divisor ∈ [2,9], total = divisor × k, k ∈ [2,9]
// D2: a ∈ [2,9], b ∈ [10,99] → product ≤ 891; divisor ∈ [2,9], total large
// D3: a ∈ [10,25], b ∈ [10,99] → larger products; divisor ∈ [10,25]
function buildTemplate(tpl: TemplateId, rng: ReturnType<typeof makeRng>, d: 1 | 2 | 3): Built {
  switch (tpl) {
    case "T1": {
      // Multiplication: mỗi hộp có a viên kẹo, b hộp có bao nhiêu viên
      const a = d === 1 ? rng.int(2, 9) : d === 2 ? rng.int(5, 50) : rng.int(10, 99);
      const b = d === 1 ? rng.int(2, 9) : d === 2 ? rng.int(2, 9) : rng.int(10, 25);
      const ans = a * b;
      return {
        problemText: `Mỗi hộp có $${a}$ viên kẹo. Hỏi $${b}$ hộp có tất cả bao nhiêu viên kẹo?`,
        expectedAnswer: ans,
        explanation:
          `**Bài giải:**\n\nSố viên kẹo trong $${b}$ hộp là:\n\n$${a} \\times ${b} = ${ans}$ (viên).\n\n**Đáp số:** ${ans} viên.`,
      };
    }
    case "T2": {
      // Multiplication: mỗi bàn có a học sinh, b bàn có bao nhiêu học sinh
      const a = d === 1 ? rng.int(2, 8) : d === 2 ? rng.int(4, 40) : rng.int(10, 50);
      const b = d === 1 ? rng.int(2, 9) : d === 2 ? rng.int(2, 9) : rng.int(10, 20);
      const ans = a * b;
      return {
        problemText: `Mỗi bàn có $${a}$ học sinh. Hỏi $${b}$ bàn có tất cả bao nhiêu học sinh?`,
        expectedAnswer: ans,
        explanation:
          `**Bài giải:**\n\nSố học sinh trong $${b}$ bàn là:\n\n$${a} \\times ${b} = ${ans}$ (học sinh).\n\n**Đáp số:** ${ans} học sinh.`,
      };
    }
    case "T3": {
      // Multiplication: mỗi cây cho a quả, b cây cho bao nhiêu quả
      const a = d === 1 ? rng.int(5, 20) : d === 2 ? rng.int(10, 80) : rng.int(20, 150);
      const b = d === 1 ? rng.int(2, 9) : d === 2 ? rng.int(2, 9) : rng.int(10, 20);
      const ans = a * b;
      return {
        problemText: `Mỗi cây trong vườn cho $${a}$ quả. Hỏi $${b}$ cây cho tất cả bao nhiêu quả?`,
        expectedAnswer: ans,
        explanation:
          `**Bài giải:**\n\nSố quả từ $${b}$ cây là:\n\n$${a} \\times ${b} = ${ans}$ (quả).\n\n**Đáp số:** ${ans} quả.`,
      };
    }
    case "T4": {
      // Division: chia đều total cuốn vở cho n bạn, mỗi bạn được mấy cuốn
      // Build total = n × k to guarantee integer answer
      const n = d === 1 ? rng.int(2, 9) : d === 2 ? rng.int(2, 9) : rng.int(10, 20);
      const k = d === 1 ? rng.int(2, 9) : d === 2 ? rng.int(5, 40) : rng.int(10, 50);
      const total = n * k;
      return {
        problemText: `Có $${total}$ cuốn vở chia đều cho $${n}$ bạn. Hỏi mỗi bạn được bao nhiêu cuốn vở?`,
        expectedAnswer: k,
        explanation:
          `**Bài giải:**\n\nMỗi bạn được số cuốn vở là:\n\n$${total} \\div ${n} = ${k}$ (cuốn).\n\n**Đáp số:** ${k} cuốn.`,
      };
    }
    case "T5": {
      // Division: sách dày pages trang, đọc p trang/ngày, bao nhiêu ngày đọc xong
      const p = d === 1 ? rng.int(2, 9) : d === 2 ? rng.int(5, 20) : rng.int(10, 30);
      const days = d === 1 ? rng.int(2, 9) : d === 2 ? rng.int(5, 30) : rng.int(10, 50);
      const pages = p * days;
      return {
        problemText: `Một quyển sách dày $${pages}$ trang. Mỗi ngày em đọc $${p}$ trang. Hỏi bao nhiêu ngày em đọc hết quyển sách đó?`,
        expectedAnswer: days,
        explanation:
          `**Bài giải:**\n\nSố ngày đọc hết quyển sách là:\n\n$${pages} \\div ${p} = ${days}$ (ngày).\n\n**Đáp số:** ${days} ngày.`,
      };
    }
  }
}

export const wordMultiplyDivide: Generator<number> = {
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

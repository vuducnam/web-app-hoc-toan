import "server-only";
// G4 word problem generator — bài toán đổi đơn vị có lời văn (g4-word-unit-conversion).
// Blends unit conversion + arithmetic. Integer answers guaranteed by construction.
// D1: 1-step conversion + 1 arithmetic op; D2/D3: 2-step (multi-unit + arithmetic).
// Units: km/m, kg/g, lít/ml. answerFormat: numeric.
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

function buildTemplate(tpl: TemplateId, rng: ReturnType<typeof makeRng>, d: 1 | 2 | 3): Built {
  switch (tpl) {
    case "T1": {
      // km → m then subtract
      // quãng đường km km, đã đi m m, còn bao nhiêu mét?
      const km = d === 1 ? rng.int(1, 5) : d === 2 ? rng.int(2, 10) : rng.int(5, 20);
      const totalM = km * 1000;
      // walked m must be less than totalM and divisible to give clean number
      const walkedM = rng.int(100, totalM - 100) - (rng.int(100, totalM - 100) % 100);
      const remainM = totalM - walkedM;
      return {
        problemText:
          `Quãng đường từ nhà đến trường là $${km}$ km. Em đã đi được $${walkedM}$ m. Hỏi còn lại bao nhiêu mét nữa là đến trường?`,
        expectedAnswer: remainM,
        explanation:
          `**Bài giải:**\n\nĐổi quãng đường: $${km}\\,\\text{km} = ${km} \\times 1\\,000 = ${totalM}\\,\\text{m}$.\n\n` +
          `Quãng đường còn lại:\n\n$${totalM} - ${walkedM} = ${remainM}$ (m).\n\n**Đáp số:** ${remainM} m.`,
      };
    }
    case "T2": {
      // kg → g then subtract
      // bao gạo nặng kg kg, đã dùng g g, còn lại bao nhiêu gam?
      const kg = d === 1 ? rng.int(1, 5) : d === 2 ? rng.int(2, 10) : rng.int(5, 20);
      const totalG = kg * 1000;
      const usedG = rng.int(100, totalG - 100) - (rng.int(100, totalG - 100) % 100);
      const remainG = totalG - usedG;
      return {
        problemText:
          `Một bao gạo nặng $${kg}$ kg. Gia đình đã dùng $${usedG}$ g. Hỏi bao gạo còn lại bao nhiêu gam?`,
        expectedAnswer: remainG,
        explanation:
          `**Bài giải:**\n\nĐổi khối lượng: $${kg}\\,\\text{kg} = ${kg} \\times 1\\,000 = ${totalG}\\,\\text{g}$.\n\n` +
          `Khối lượng gạo còn lại:\n\n$${totalG} - ${usedG} = ${remainG}$ (g).\n\n**Đáp số:** ${remainG} g.`,
      };
    }
    case "T3": {
      // lít → ml then add
      // bình nước có lit lít, rót thêm ml ml, tất cả bao nhiêu ml?
      const lit = d === 1 ? rng.int(1, 3) : d === 2 ? rng.int(2, 5) : rng.int(3, 8);
      const totalMl = lit * 1000;
      const addMl = rng.int(100, 500) - (rng.int(100, 500) % 50);
      const ans = totalMl + addMl;
      return {
        problemText:
          `Bình nước có $${lit}$ lít nước. Mẹ rót thêm $${addMl}$ ml nữa. Hỏi bình nước có tất cả bao nhiêu ml?`,
        expectedAnswer: ans,
        explanation:
          `**Bài giải:**\n\nĐổi: $${lit}\\,\\text{lít} = ${lit} \\times 1\\,000 = ${totalMl}\\,\\text{ml}$.\n\n` +
          `Tổng lượng nước trong bình:\n\n$${totalMl} + ${addMl} = ${ans}$ (ml).\n\n**Đáp số:** ${ans} ml.`,
      };
    }
    case "T4": {
      // D3 2-step: km + m combined distance, find total in metres
      // xe đi kmA km và mB m, tổng quãng đường bao nhiêu mét?
      const kmA = d === 1 ? rng.int(1, 3) : d === 2 ? rng.int(2, 8) : rng.int(5, 15);
      const mB = rng.int(100, 900) - (rng.int(100, 900) % 100);
      const ans = kmA * 1000 + mB;
      return {
        problemText:
          `Xe ô tô đi được $${kmA}$ km và $${mB}$ m. Hỏi xe đó đi được tất cả bao nhiêu mét?`,
        expectedAnswer: ans,
        explanation:
          `**Bài giải:**\n\nĐổi: $${kmA}\\,\\text{km} = ${kmA} \\times 1\\,000 = ${kmA * 1000}\\,\\text{m}$.\n\n` +
          `Tổng quãng đường:\n\n$${kmA * 1000} + ${mB} = ${ans}$ (m).\n\n**Đáp số:** ${ans} m.`,
      };
    }
    case "T5": {
      // kg + g combined weight, find total in grams
      const kgA = d === 1 ? rng.int(1, 4) : d === 2 ? rng.int(2, 10) : rng.int(5, 20);
      const gB = rng.int(50, 900) - (rng.int(50, 900) % 50);
      const ans = kgA * 1000 + gB;
      return {
        problemText:
          `Một túi hoa quả nặng $${kgA}$ kg và $${gB}$ g. Hỏi túi hoa quả đó nặng tất cả bao nhiêu gam?`,
        expectedAnswer: ans,
        explanation:
          `**Bài giải:**\n\nĐổi: $${kgA}\\,\\text{kg} = ${kgA} \\times 1\\,000 = ${kgA * 1000}\\,\\text{g}$.\n\n` +
          `Tổng khối lượng:\n\n$${kgA * 1000} + ${gB} = ${ans}$ (g).\n\n**Đáp số:** ${ans} g.`,
      };
    }
  }
}

export const wordUnitConversion: Generator<number> = {
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

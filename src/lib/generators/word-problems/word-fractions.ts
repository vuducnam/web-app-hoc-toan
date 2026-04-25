import "server-only";
// G4 word problem generator — bài toán phân số có lời văn (g4-word-fractions).
// 5 templates covering fraction concepts. answerFormat: fraction.
// D1: simple unit fractions (small denominator ≤ 6); D2: medium (≤ 10); D3: larger (≤ 12).
// All answers are proper fractions in lowest terms.
import { makeRng } from "../seeded-rng";
import { parseFraction, equivalent } from "../normalize/fraction";
import type { Generator, GeneratorParams, Question, Fraction } from "../types";

const TIME_SEC: Record<number, number> = { 1: 60, 2: 75, 3: 90 };

type TemplateId = "T1" | "T2" | "T3" | "T4" | "T5";
const ALL_TEMPLATES: TemplateId[] = ["T1", "T2", "T3", "T4", "T5"];

// Denominator ranges per difficulty
const DEN_MAX: Record<number, number> = { 1: 6, 2: 10, 3: 12 };
const DEN_MIN = 2;

interface Built {
  problemText: string;
  expectedAnswer: Fraction;
  explanation: string;
}

function buildTemplate(tpl: TemplateId, rng: ReturnType<typeof makeRng>, d: 1 | 2 | 3): Built {
  const maxDen = DEN_MAX[d];

  switch (tpl) {
    case "T1": {
      // Mẹ chia bánh thành d phần, em ăn n phần → n/d
      const den = rng.int(DEN_MIN, maxDen);
      const num = rng.int(1, den - 1);
      return {
        problemText:
          `Mẹ chia chiếc bánh thành $${den}$ phần bằng nhau. Em ăn $${num}$ phần. ` +
          `Hỏi em đã ăn mấy phần chiếc bánh?`,
        expectedAnswer: { num, den },
        explanation:
          `**Bài giải:**\n\nChiếc bánh được chia thành $${den}$ phần bằng nhau, em ăn $${num}$ phần.\n\n` +
          `Em đã ăn $\\dfrac{${num}}{${den}}$ chiếc bánh.\n\n` +
          `**Đáp số:** $\\dfrac{${num}}{${den}}$ chiếc bánh.`,
      };
    }
    case "T2": {
      // Có a quả táo, chia cho b bạn → a/b (proper: ensure a < b)
      const den = rng.int(DEN_MIN + 1, maxDen); // b ≥ 3
      const num = rng.int(1, den - 1);           // a < b so fraction is proper
      return {
        problemText:
          `Có $${num}$ quả táo chia đều cho $${den}$ bạn. Hỏi mỗi bạn được mấy phần quả táo?`,
        expectedAnswer: { num, den },
        explanation:
          `**Bài giải:**\n\n$${num}$ quả táo chia đều cho $${den}$ bạn, mỗi bạn được:\n\n` +
          `$${num} \\div ${den} = \\dfrac{${num}}{${den}}$ (quả).\n\n` +
          `**Đáp số:** $\\dfrac{${num}}{${den}}$ quả.`,
      };
    }
    case "T3": {
      // Bể nước đầy full/d bể, đã dùng used/d bể, còn lại (full-used)/d
      const den = rng.int(DEN_MIN, maxDen);
      const full = rng.int(2, den);               // full ≤ den (at most a full tank)
      const used = rng.int(1, full - 1);           // used < full so remainder > 0
      const remNum = full - used;
      return {
        problemText:
          `Bể nước có $\\dfrac{${full}}{${den}}$ bể đầy. Gia đình đã dùng $\\dfrac{${used}}{${den}}$ bể. ` +
          `Hỏi bể còn lại bao nhiêu phần bể nước?`,
        expectedAnswer: { num: remNum, den },
        explanation:
          `**Bài giải:**\n\nLượng nước còn lại trong bể là:\n\n` +
          `$\\dfrac{${full}}{${den}} - \\dfrac{${used}}{${den}} = \\dfrac{${full} - ${used}}{${den}} = \\dfrac{${remNum}}{${den}}$ (bể).\n\n` +
          `**Đáp số:** $\\dfrac{${remNum}}{${den}}$ bể.`,
      };
    }
    case "T4": {
      // Tô màu n/d phần hình, hỏi phần chưa tô màu → (d-n)/d
      const den = rng.int(DEN_MIN, maxDen);
      const num = rng.int(1, den - 1);
      const uncoloredNum = den - num;
      return {
        problemText:
          `Em tô màu $\\dfrac{${num}}{${den}}$ phần của hình chữ nhật. ` +
          `Hỏi phần chưa được tô màu chiếm mấy phần của hình chữ nhật?`,
        expectedAnswer: { num: uncoloredNum, den },
        explanation:
          `**Bài giải:**\n\nPhần chưa tô màu của hình chữ nhật là:\n\n` +
          `$1 - \\dfrac{${num}}{${den}} = \\dfrac{${den}}{${den}} - \\dfrac{${num}}{${den}} = \\dfrac{${uncoloredNum}}{${den}}$ (phần).\n\n` +
          `**Đáp số:** $\\dfrac{${uncoloredNum}}{${den}}$ phần.`,
      };
    }
    case "T5": {
      // Đường đi tổng d km, đã đi n km → phân số n/d quãng đường
      const den = rng.int(DEN_MIN, maxDen);
      const num = rng.int(1, den - 1);
      return {
        problemText:
          `Quãng đường từ nhà đến trường dài $${den}$ km. Em đã đi được $${num}$ km. ` +
          `Hỏi em đã đi được mấy phần quãng đường?`,
        expectedAnswer: { num, den },
        explanation:
          `**Bài giải:**\n\nEm đã đi được phần quãng đường là:\n\n` +
          `$\\dfrac{${num}}{${den}}$ quãng đường.\n\n` +
          `**Đáp số:** $\\dfrac{${num}}{${den}}$ quãng đường.`,
      };
    }
  }
}

export const wordFractions: Generator<Fraction> = {
  generate(p: GeneratorParams): Question<Fraction> {
    const { seed, difficulty, skillKey } = p;
    const rng = makeRng(seed);
    const d = difficulty as 1 | 2 | 3;

    const tpl = rng.pick(ALL_TEMPLATES);
    const built = buildTemplate(tpl, rng, d);

    return {
      id: `${skillKey}-${seed}`,
      skillKey,
      problemText: built.problemText,
      answerFormat: "fraction",
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

  validate(userAnswer: string, q: Question<Fraction>): boolean {
    const f = parseFraction(userAnswer);
    if (f === null) return false;
    return equivalent(f, q.expectedAnswer);
  },
};

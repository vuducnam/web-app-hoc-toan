import "server-only";
// Word problem generator — 3D volume (thể tích) in real-life contexts.
// g5-word-3d-volume: bài toán thể tích hình hộp và hình lập phương (lớp 5).
// D1: cube (lập phương); D2: rectangular box (hộp chữ nhật);
// D3: mix — box + capacity unit conversion (1 dm³ = 1 lít).
// All answers are integers (dimensions constrained).
// answerFormat: numeric; expectedAnswer: integer.
import { makeRng } from "../seeded-rng";
import { parseNumeric } from "../normalize/numeric";
import type { Generator, GeneratorParams, Question, FigureSpec } from "../types";

interface Built {
  problemText: string;
  expectedAnswer: number;
  explanation: string;
  figure?: FigureSpec;
  solutionFigure?: FigureSpec;
}

const TIME_SEC: Record<number, number> = { 1: 90, 2: 90, 3: 90 };

// Cube side lengths (integer cube volumes)
const CUBE_SIDES: Record<number, number[]> = {
  1: [2, 3, 4, 5],
  2: [3, 4, 5, 6, 7],
  3: [4, 5, 6, 7, 8],
};

// Box dimensions [a, b, c] — all integer products
const BOX_A: Record<number, number[]> = {
  1: [2, 3, 4, 5],
  2: [3, 4, 5, 6, 7, 8],
  3: [4, 5, 6, 7, 8, 9, 10],
};
const BOX_B: Record<number, number[]> = {
  1: [2, 3, 4],
  2: [2, 3, 4, 5, 6],
  3: [3, 4, 5, 6, 7],
};
const BOX_C: Record<number, number[]> = {
  1: [2, 3],
  2: [2, 3, 4, 5],
  3: [2, 3, 4, 5, 6],
};

// Capacity volumes for conversion template (V dm³ → V lít)
const CAPACITIES: Record<number, number[]> = {
  3: [12, 15, 18, 20, 24, 30, 36, 40, 48, 60],
};

// --- Template builders ---

function buildCube(s: number): Built {
  const V = s * s * s;
  return {
    problemText: `Thùng cát hình lập phương có cạnh ${s} dm. Tính thể tích thùng cát đó.`,
    expectedAnswer: V,
    explanation:
      `**Bài giải:**\n\nThể tích hình lập phương là:\n\n$V = a^3 = ${s}^3 = ${s} \\times ${s} \\times ${s} = ${V}$ (dm³).\n\n**Đáp số:** ${V} dm³.`,
    figure: { kind: "rectPrism3d", a: s, b: s, c: s, unit: "dm" },
    solutionFigure: { kind: "rectPrism3d", a: s, b: s, c: s, unit: "dm", shaded: true },
  };
}

function buildBox(a: number, b: number, c: number): Built {
  const V = a * b * c;
  return {
    problemText: `Bể cá hình hộp chữ nhật có chiều dài ${a} dm, chiều rộng ${b} dm và chiều cao ${c} dm. Tính thể tích bể cá đó.`,
    expectedAnswer: V,
    explanation:
      `**Bài giải:**\n\nThể tích hình hộp chữ nhật là:\n\n$V = a \\times b \\times c = ${a} \\times ${b} \\times ${c} = ${V}$ (dm³).\n\n**Đáp số:** ${V} dm³.`,
    figure: { kind: "rectPrism3d", a, b, c, unit: "dm" },
    solutionFigure: { kind: "rectPrism3d", a, b, c, unit: "dm", shaded: true },
  };
}

function buildCapacity(V: number): Built {
  // V dm³ = V lít — pure unit conversion, no figure (volume given as a number).
  return {
    problemText: `Biết $1\\,\\text{dm}^3 = 1$ lít. Bể chứa nước có thể tích ${V} dm³. Hỏi bể chứa được bao nhiêu lít nước?`,
    expectedAnswer: V,
    explanation:
      `**Bài giải:**\n\nVì $1\\,\\text{dm}^3 = 1$ lít, nên bể chứa được:\n\n$${V}\\,\\text{dm}^3 = ${V}$ lít.\n\n**Đáp số:** ${V} lít.`,
  };
}

function buildBoxToLiters(a: number, b: number, c: number): Built {
  const V = a * b * c;
  return {
    problemText: `Bể nước hình hộp chữ nhật dài ${a} dm, rộng ${b} dm, cao ${c} dm. Biết $1\\,\\text{dm}^3 = 1$ lít. Bể chứa được bao nhiêu lít nước?`,
    expectedAnswer: V,
    explanation:
      `**Bài giải:**\n\nThể tích bể nước là:\n\n$V = ${a} \\times ${b} \\times ${c} = ${V}$ (dm³).\n\nVì $1\\,\\text{dm}^3 = 1$ lít, bể chứa được:\n\n$${V}$ lít nước.\n\n**Đáp số:** ${V} lít.`,
    figure: { kind: "rectPrism3d", a, b, c, unit: "dm" },
    solutionFigure: { kind: "rectPrism3d", a, b, c, unit: "dm", shaded: true },
  };
}

type TemplateId = "cube" | "box" | "capacity" | "box-to-liters";

const TEMPLATES: Record<number, TemplateId[]> = {
  1: ["cube"],
  2: ["cube", "box"],
  3: ["cube", "box", "capacity", "box-to-liters"],
};

export const word3dVolume: Generator<number> = {
  generate(p: GeneratorParams): Question<number> {
    const { seed, difficulty, skillKey } = p;
    const rng = makeRng(seed);
    const d = difficulty as 1 | 2 | 3;

    const tmplId = rng.pick(TEMPLATES[d]);

    let result: Built;

    if (tmplId === "cube") {
      const s = rng.pick(CUBE_SIDES[d]);
      result = buildCube(s);
    } else if (tmplId === "box") {
      const a = rng.pick(BOX_A[d]);
      const b = rng.pick(BOX_B[d]);
      const c = rng.pick(BOX_C[d]);
      result = buildBox(a, b, c);
    } else if (tmplId === "capacity") {
      const V = rng.pick(CAPACITIES[3]);
      result = buildCapacity(V);
    } else {
      // box-to-liters
      const a = rng.pick(BOX_A[d]);
      const b = rng.pick(BOX_B[d]);
      const c = rng.pick(BOX_C[d]);
      result = buildBoxToLiters(a, b, c);
    }

    return {
      id: `${skillKey}-${seed}`,
      skillKey,
      problemText: result.problemText,
      answerFormat: "numeric",
      expectedAnswer: result.expectedAnswer,
      explanation: result.explanation,
      figure: result.figure,
      solutionFigure: result.solutionFigure,
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

import "server-only";
// Word problem generator — decimal addition/subtraction in real-life contexts.
// g5-word-decimals: bài toán cộng/trừ số thập phân (lớp 5).
// D1: 1 chữ số thập phân (add); D2: 2 chữ số thập phân; D3: mixed sub/multiply contexts.
// answerFormat: decimal; expectedAnswer: JS number (dot separator internally).
// problemText: Vietnamese comma per convention.
import { makeRng } from "../seeded-rng";
import { parseVnDecimal, equalsWithTolerance, toVnFixed } from "../normalize/decimal";
import type { Generator, GeneratorParams, Question } from "../types";

const TIME_SEC: Record<number, number> = { 1: 90, 2: 90, 3: 90 };

/** Round to given decimal places to eliminate floating-point noise. */
function round(n: number, places: number): number {
  const factor = Math.pow(10, places);
  return Math.round(n * factor) / factor;
}

// Template builder type
interface Template {
  templateId: string;
  build(
    a: number, b: number, places: number
  ): { problemText: string; expectedAnswer: number; explanation: string };
}

// Sách template: mua quyển sách + bút → tổng tiền (add)
const templateBook: Template = {
  templateId: "book-add",
  build(a, b, places) {
    const total = round(a + b, places);
    const aStr = toVnFixed(a, places);
    const bStr = toVnFixed(b, places);
    const totalStr = toVnFixed(total, places);
    return {
      problemText: `Em mua quyển sách giá ${aStr} nghìn đồng và bút giá ${bStr} nghìn đồng. Em phải trả tổng cộng bao nhiêu nghìn đồng?`,
      expectedAnswer: total,
      explanation:
        `**Bài giải:**\n\nTổng số tiền em phải trả là:\n\n$${aStr} + ${bStr} = ${totalStr}$ (nghìn đồng).\n\n**Đáp số:** ${totalStr} nghìn đồng.`,
    };
  },
};

// Vải template: tổng vải − may áo → còn lại (subtract)
const templateCloth: Template = {
  templateId: "cloth-subtract",
  build(a, b, places) {
    // ensure a > b: swap if needed (caller ensures a > b by construction)
    const remaining = round(a - b, places);
    const aStr = toVnFixed(a, places);
    const bStr = toVnFixed(b, places);
    const remStr = toVnFixed(remaining, places);
    return {
      problemText: `Một mảnh vải dài ${aStr} m. Cô thợ may áo hết ${bStr} m. Hỏi còn lại bao nhiêu mét vải?`,
      expectedAnswer: remaining,
      explanation:
        `**Bài giải:**\n\nSố mét vải còn lại là:\n\n$${aStr} - ${bStr} = ${remStr}$ (m).\n\n**Đáp số:** ${remStr} m.`,
    };
  },
};

// Gạo template: bao gạo − đã dùng → còn lại (subtract)
const templateRice: Template = {
  templateId: "rice-subtract",
  build(a, b, places) {
    const remaining = round(a - b, places);
    const aStr = toVnFixed(a, places);
    const bStr = toVnFixed(b, places);
    const remStr = toVnFixed(remaining, places);
    return {
      problemText: `Bao gạo nặng ${aStr} kg. Gia đình đã dùng ${bStr} kg. Còn lại bao nhiêu ki-lô-gam gạo?`,
      expectedAnswer: remaining,
      explanation:
        `**Bài giải:**\n\nSố ki-lô-gam gạo còn lại là:\n\n$${aStr} - ${bStr} = ${remStr}$ (kg).\n\n**Đáp số:** ${remStr} kg.`,
    };
  },
};

// Đường đi template: đoạn đường 1 + đoạn đường 2 → tổng (add)
const templateRoad: Template = {
  templateId: "road-add",
  build(a, b, places) {
    const total = round(a + b, places);
    const aStr = toVnFixed(a, places);
    const bStr = toVnFixed(b, places);
    const totalStr = toVnFixed(total, places);
    return {
      problemText: `Buổi sáng em đi bộ ${aStr} km, buổi chiều em đi bộ thêm ${bStr} km. Hỏi cả ngày em đi bộ được bao nhiêu ki-lô-mét?`,
      expectedAnswer: total,
      explanation:
        `**Bài giải:**\n\nTổng quãng đường em đi bộ trong ngày là:\n\n$${aStr} + ${bStr} = ${totalStr}$ (km).\n\n**Đáp số:** ${totalStr} km.`,
    };
  },
};

// Nước template: bình nước − uống → còn lại (subtract)
const templateWater: Template = {
  templateId: "water-subtract",
  build(a, b, places) {
    const remaining = round(a - b, places);
    const aStr = toVnFixed(a, places);
    const bStr = toVnFixed(b, places);
    const remStr = toVnFixed(remaining, places);
    return {
      problemText: `Bình nước chứa ${aStr} lít. Em uống hết ${bStr} lít. Còn lại bao nhiêu lít nước?`,
      expectedAnswer: remaining,
      explanation:
        `**Bài giải:**\n\nSố lít nước còn lại là:\n\n$${aStr} - ${bStr} = ${remStr}$ (lít).\n\n**Đáp số:** ${remStr} lít.`,
    };
  },
};

// Templates per difficulty
const TEMPLATES_D1: Template[] = [templateBook, templateCloth, templateRice, templateRoad];
const TEMPLATES_D2: Template[] = [templateBook, templateCloth, templateRice, templateWater];
const TEMPLATES_D3: Template[] = [templateCloth, templateRice, templateWater, templateRoad];

const TEMPLATES: Record<number, Template[]> = {
  1: TEMPLATES_D1,
  2: TEMPLATES_D2,
  3: TEMPLATES_D3,
};

export const wordDecimals: Generator<number> = {
  generate(p: GeneratorParams): Question<number> {
    const { seed, difficulty, skillKey } = p;
    const rng = makeRng(seed);
    const d = difficulty as 1 | 2 | 3;
    const places = d; // D1=1dp, D2=2dp, D3=3dp (but we cap at 2 for D3 mix)
    // D3 uses 2 decimal places for readability (3dp too unwieldy in word problems)
    const actualPlaces = d === 3 ? 2 : places;
    const factor = Math.pow(10, actualPlaces);

    // Generate a > b to avoid negative remainders in subtract templates
    const rawA = rng.int(Math.ceil(factor * 0.6), factor * 10 - 1);
    const rawB = rng.int(1, Math.floor(rawA * 0.7));
    const a = round(rawA / factor, actualPlaces);
    const b = round(rawB / factor, actualPlaces);

    const tmpl = rng.pick(TEMPLATES[d]);
    const { problemText, expectedAnswer, explanation } = tmpl.build(a, b, actualPlaces);

    return {
      id: `${skillKey}-${seed}`,
      skillKey,
      problemText,
      answerFormat: "decimal",
      expectedAnswer,
      explanation,
      metadata: {
        difficulty: d,
        seed,
        skillKey,
        timeEstimateSec: TIME_SEC[d],
      },
    };
  },

  validate(userAnswer: string, q: Question<number>): boolean {
    const n = parseVnDecimal(userAnswer);
    if (n === null) return false;
    return equalsWithTolerance(n, q.expectedAnswer);
  },
};

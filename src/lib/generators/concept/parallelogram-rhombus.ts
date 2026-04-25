import "server-only";
// Parallelogram/rhombus shape identification MC generator.
// Asks which shape matches a given property description.
// answerFormat: multiple-choice; choices: ["hình bình hành", "hình thoi", "hình chữ nhật", "hình vuông"].
// Strategy: hard-coded (problemText, correctAnswer) tuples per difficulty tier; RNG picks one.
import { makeRng } from "../seeded-rng";
import type { Generator, GeneratorParams, Question } from "../types";

const CHOICES = ["hình bình hành", "hình thoi", "hình chữ nhật", "hình vuông"] as const;
const TIME: Record<number, number> = { 1: 45, 2: 45, 3: 45 };

type Template = { text: string; answer: (typeof CHOICES)[number]; explanation: string };

const D1_TEMPLATES: Template[] = [
  { text: "Tứ giác có 4 cạnh bằng nhau và 4 góc vuông là hình gì?", answer: "hình vuông", explanation: "**Hình vuông** là tứ giác có 4 cạnh bằng nhau và 4 góc vuông ($90°$) — đây là định nghĩa cơ bản." },
  { text: "Tứ giác có 4 góc vuông và các cặp cạnh đối bằng nhau là hình gì?", answer: "hình chữ nhật", explanation: "**Hình chữ nhật** có 4 góc vuông và hai cặp cạnh đối bằng nhau (nhưng các cạnh kề không nhất thiết bằng nhau)." },
  { text: "Tứ giác có 4 cạnh bằng nhau là hình gì?", answer: "hình thoi", explanation: "**Hình thoi** là tứ giác có 4 cạnh bằng nhau, nhưng các góc không nhất thiết là góc vuông." },
  { text: "Tứ giác có 2 cặp cạnh đối song song và bằng nhau là hình gì?", answer: "hình bình hành", explanation: "**Hình bình hành** có hai cặp cạnh đối song song và bằng nhau — đây là tính chất đặc trưng." },
];

const D2_TEMPLATES: Template[] = [
  { text: "Hình có 2 đường chéo vuông góc với nhau và bằng nhau là hình gì?", answer: "hình vuông", explanation: "**Hình vuông** là hình duy nhất có hai đường chéo vừa bằng nhau vừa vuông góc với nhau." },
  { text: "Hình có 2 đường chéo bằng nhau nhưng không vuông góc là hình gì?", answer: "hình chữ nhật", explanation: "**Hình chữ nhật** có hai đường chéo bằng nhau nhưng không vuông góc (trừ khi là hình vuông)." },
  { text: "Hình có 2 đường chéo vuông góc với nhau nhưng không bằng nhau là hình gì?", answer: "hình thoi", explanation: "**Hình thoi** có hai đường chéo vuông góc với nhau nhưng không bằng nhau (trừ khi là hình vuông)." },
  { text: "Hình có các góc đối bằng nhau nhưng không phải góc vuông, các cạnh đối song song là hình gì?", answer: "hình bình hành", explanation: "**Hình bình hành** có các góc đối bằng nhau và các cạnh đối song song, nhưng góc không nhất thiết là $90°$." },
  { text: "Hình chữ nhật có 4 cạnh bằng nhau là hình gì?", answer: "hình vuông", explanation: "Hình chữ nhật có 4 góc vuông; nếu thêm điều kiện 4 cạnh bằng nhau thì đó chính là **hình vuông**." },
  { text: "Hình thoi có 4 góc vuông là hình gì?", answer: "hình vuông", explanation: "Hình thoi có 4 cạnh bằng nhau; nếu thêm điều kiện 4 góc vuông thì đó chính là **hình vuông**." },
];

const D3_TEMPLATES: Template[] = [
  { text: "Hình thoi có phải là hình bình hành không? Hãy chọn tên gọi chính xác nhất cho hình có 4 cạnh bằng nhau và các cạnh đối song song.", answer: "hình thoi", explanation: "Hình có 4 cạnh bằng nhau và các cạnh đối song song là **hình thoi** — đây là tên gọi chính xác nhất (hình thoi là hình bình hành đặc biệt)." },
  { text: "Hình chữ nhật có phải là hình bình hành không? Chọn tên gọi tổng quát nhất cho hình có 4 góc vuông.", answer: "hình chữ nhật", explanation: "Hình có 4 góc vuông mà các cạnh kề không nhất thiết bằng nhau là **hình chữ nhật** (tổng quát hơn hình vuông)." },
  { text: "Tứ giác ABCD có AB // CD, BC // AD. Tất cả 4 cạnh bằng nhau. Đây là hình gì?", answer: "hình thoi", explanation: "Tứ giác có 2 cặp cạnh đối song song và cả 4 cạnh bằng nhau là **hình thoi**." },
  { text: "Tứ giác có tổng 2 góc kề bằng 180°, các cặp cạnh đối song song, nhưng các cạnh không nhất thiết bằng nhau là hình gì?", answer: "hình bình hành", explanation: "Tổng hai góc kề bằng $180°$ và các cặp cạnh đối song song là dấu hiệu nhận biết **hình bình hành**." },
  { text: "Hình vuông có phải là hình thoi không? Chọn hình tổng quát hơn có 4 cạnh bằng nhau nhưng không nhất thiết có góc vuông.", answer: "hình thoi", explanation: "**Hình thoi** là hình tổng quát hơn: có 4 cạnh bằng nhau nhưng góc không nhất thiết là $90°$ (hình vuông là hình thoi đặc biệt)." },
];

const TEMPLATES: Record<number, Template[]> = {
  1: D1_TEMPLATES,
  2: D2_TEMPLATES,
  3: D3_TEMPLATES,
};

export const parallelogramRhombus: Generator<string> = {
  generate(p: GeneratorParams): Question<string> {
    const { seed, difficulty, skillKey } = p;
    const rng = makeRng(seed);
    const d = difficulty as 1 | 2 | 3;

    const template = rng.pick(TEMPLATES[d]);

    return {
      id: `${skillKey}-${seed}`,
      skillKey,
      problemText: template.text,
      answerFormat: "multiple-choice",
      choices: [...CHOICES],
      expectedAnswer: template.answer,
      explanation: template.explanation,
      metadata: { difficulty: d, seed, skillKey, timeEstimateSec: TIME[d] },
    };
  },

  validate(userAnswer: string, q: Question<string>): boolean {
    if (!userAnswer || typeof userAnswer !== "string") return false;
    if (!q.choices?.includes(userAnswer.trim())) return false;
    return userAnswer.trim() === q.expectedAnswer;
  },
};

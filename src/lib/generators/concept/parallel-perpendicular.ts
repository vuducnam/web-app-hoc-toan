import "server-only";
// Parallel/perpendicular concept MC generator — identify line relationship from description.
// answerFormat: multiple-choice; choices: ["song song", "vuông góc", "cắt nhau"].
// Strategy: hard-coded (problemText, correctAnswer) tuples per difficulty tier;
// RNG picks one. Distractors = remaining choices from enum.
import { makeRng } from "../seeded-rng";
import type { Generator, GeneratorParams, Question } from "../types";

const CHOICES = ["song song", "vuông góc", "cắt nhau"] as const;
const TIME: Record<number, number> = { 1: 45, 2: 45, 3: 45 };

type Template = { text: string; answer: (typeof CHOICES)[number] };

const D1_TEMPLATES: Template[] = [
  { text: "Hai đường thẳng không bao giờ cắt nhau gọi là hai đường thẳng như thế nào?", answer: "song song" },
  { text: "Hai đường thẳng cắt nhau tạo thành góc vuông gọi là hai đường thẳng như thế nào?", answer: "vuông góc" },
  { text: "Hai đường thẳng có một điểm chung gọi là hai đường thẳng như thế nào?", answer: "cắt nhau" },
  { text: "Đường ray xe lửa thẳng là ví dụ về hai đường thẳng nào?", answer: "song song" },
  { text: "Hai cạnh liền nhau của hình vuông là hai đường thẳng như thế nào?", answer: "vuông góc" },
];

const D2_TEMPLATES: Template[] = [
  { text: "Hai cạnh đối diện của hình chữ nhật là hai đường thẳng như thế nào?", answer: "song song" },
  { text: "Chiều dài và chiều rộng của hình chữ nhật tạo thành hai đường thẳng như thế nào?", answer: "vuông góc" },
  { text: "Hai đường chéo của hình chữ nhật là hai đường thẳng như thế nào?", answer: "cắt nhau" },
  { text: "Hai cạnh bên của hình thang vuông tạo với đáy là hai đường thẳng như thế nào?", answer: "vuông góc" },
  { text: "Hai cạnh đáy của hình thang là hai đường thẳng như thế nào?", answer: "song song" },
  { text: "Hai đường thẳng cùng vuông góc với một đường thẳng thứ ba thì như thế nào với nhau?", answer: "song song" },
];

const D3_TEMPLATES: Template[] = [
  { text: "Đường thẳng a vuông góc với đường thẳng b. Đường thẳng b vuông góc với đường thẳng c. Đường thẳng a và c như thế nào với nhau?", answer: "song song" },
  { text: "Hai đường thẳng cùng song song với đường thẳng thứ ba thì như thế nào với nhau?", answer: "song song" },
  { text: "Trong hình bình hành, hai cặp cạnh đối là hai đường thẳng như thế nào?", answer: "song song" },
  { text: "Đường thẳng đi qua hai điểm (0,0) và (2,2) với đường thẳng đi qua (0,1) và (2,3) là hai đường thẳng như thế nào?", answer: "song song" },
  { text: "Đường thẳng nằm ngang và đường thẳng thẳng đứng là hai đường thẳng như thế nào?", answer: "vuông góc" },
  { text: "Hai đường thẳng tạo với nhau góc 45° là hai đường thẳng như thế nào?", answer: "cắt nhau" },
];

const TEMPLATES: Record<number, Template[]> = {
  1: D1_TEMPLATES,
  2: D2_TEMPLATES,
  3: D3_TEMPLATES,
};

export const parallelPerpendicular: Generator<string> = {
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
      metadata: { difficulty: d, seed, skillKey, timeEstimateSec: TIME[d] },
    };
  },

  validate(userAnswer: string, q: Question<string>): boolean {
    if (!userAnswer || typeof userAnswer !== "string") return false;
    if (!q.choices?.includes(userAnswer.trim())) return false;
    return userAnswer.trim() === q.expectedAnswer;
  },
};

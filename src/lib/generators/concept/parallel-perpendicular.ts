import "server-only";
// Parallel/perpendicular concept MC generator — identify line relationship from description.
// answerFormat: multiple-choice; choices: ["song song", "vuông góc", "cắt nhau"].
// Strategy: hard-coded (problemText, correctAnswer) tuples per difficulty tier;
// RNG picks one. Distractors = remaining choices from enum.
import { makeRng } from "../seeded-rng";
import type { Generator, GeneratorParams, Question } from "../types";

const CHOICES = ["song song", "vuông góc", "cắt nhau"] as const;
const TIME: Record<number, number> = { 1: 45, 2: 45, 3: 45 };

type Template = { text: string; answer: (typeof CHOICES)[number]; explanation: string };

const D1_TEMPLATES: Template[] = [
  { text: "Hai đường thẳng không bao giờ cắt nhau gọi là hai đường thẳng như thế nào?", answer: "song song", explanation: "Định nghĩa: hai đường thẳng **song song** là hai đường thẳng không bao giờ cắt nhau dù kéo dài vô tận." },
  { text: "Hai đường thẳng cắt nhau tạo thành góc vuông gọi là hai đường thẳng như thế nào?", answer: "vuông góc", explanation: "Định nghĩa: hai đường thẳng **vuông góc** là hai đường thẳng cắt nhau tạo thành bốn góc vuông ($90°$)." },
  { text: "Hai đường thẳng có một điểm chung gọi là hai đường thẳng như thế nào?", answer: "cắt nhau", explanation: "Hai đường thẳng có một điểm chung gọi là hai đường thẳng **cắt nhau** tại điểm đó." },
  { text: "Đường ray xe lửa thẳng là ví dụ về hai đường thẳng nào?", answer: "song song", explanation: "Hai đường ray xe lửa luôn cách đều nhau, không bao giờ gặp nhau — đây là ví dụ điển hình của hai đường thẳng **song song**." },
  { text: "Hai cạnh liền nhau của hình vuông là hai đường thẳng như thế nào?", answer: "vuông góc", explanation: "Hình vuông có bốn góc vuông ($90°$), nên hai cạnh liền nhau tạo với nhau góc $90°$ — tức là **vuông góc**." },
];

const D2_TEMPLATES: Template[] = [
  { text: "Hai cạnh đối diện của hình chữ nhật là hai đường thẳng như thế nào?", answer: "song song", explanation: "Trong hình chữ nhật, hai cạnh đối diện luôn cách đều nhau và không cắt nhau — chúng **song song** với nhau." },
  { text: "Chiều dài và chiều rộng của hình chữ nhật tạo thành hai đường thẳng như thế nào?", answer: "vuông góc", explanation: "Hình chữ nhật có bốn góc vuông, nên chiều dài và chiều rộng tạo với nhau góc $90°$ — tức là **vuông góc**." },
  { text: "Hai đường chéo của hình chữ nhật là hai đường thẳng như thế nào?", answer: "cắt nhau", explanation: "Hai đường chéo của hình chữ nhật cắt nhau tại trung điểm — đây là hai đường thẳng **cắt nhau** (nhưng không vuông góc)." },
  { text: "Hai cạnh bên của hình thang vuông tạo với đáy là hai đường thẳng như thế nào?", answer: "vuông góc", explanation: "Hình thang vuông có một cạnh bên vuông góc với hai đáy, tức cạnh đó và đáy là hai đường thẳng **vuông góc**." },
  { text: "Hai cạnh đáy của hình thang là hai đường thẳng như thế nào?", answer: "song song", explanation: "Định nghĩa hình thang: hình tứ giác có một cặp cạnh đối **song song** — đó chính là hai đáy." },
  { text: "Hai đường thẳng cùng vuông góc với một đường thẳng thứ ba thì như thế nào với nhau?", answer: "song song", explanation: "Nếu $a \\perp c$ và $b \\perp c$ thì $a \\parallel b$ — đây là định lý: hai đường thẳng cùng vuông góc với một đường thẳng thứ ba thì **song song** nhau." },
];

const D3_TEMPLATES: Template[] = [
  { text: "Đường thẳng a vuông góc với đường thẳng b. Đường thẳng b vuông góc với đường thẳng c. Đường thẳng a và c như thế nào với nhau?", answer: "song song", explanation: "$a \\perp b$ và $b \\perp c$ suy ra $a \\parallel c$ (hai đường thẳng cùng vuông góc với $b$ thì **song song** nhau)." },
  { text: "Hai đường thẳng cùng song song với đường thẳng thứ ba thì như thế nào với nhau?", answer: "song song", explanation: "Nếu $a \\parallel c$ và $b \\parallel c$ thì $a \\parallel b$ — tính chất bắc cầu của quan hệ **song song**." },
  { text: "Trong hình bình hành, hai cặp cạnh đối là hai đường thẳng như thế nào?", answer: "song song", explanation: "Định nghĩa hình bình hành: có hai cặp cạnh đối **song song** và bằng nhau." },
  { text: "Đường thẳng đi qua hai điểm (0,0) và (2,2) với đường thẳng đi qua (0,1) và (2,3) là hai đường thẳng như thế nào?", answer: "song song", explanation: "Cả hai đường đều có hệ số góc bằng $1$ nhưng tung độ gốc khác nhau, nên chúng **song song** nhau." },
  { text: "Đường thẳng nằm ngang và đường thẳng thẳng đứng là hai đường thẳng như thế nào?", answer: "vuông góc", explanation: "Đường nằm ngang (hệ số góc $0$) và đường thẳng đứng tạo với nhau góc $90°$ — chúng **vuông góc** nhau." },
  { text: "Hai đường thẳng tạo với nhau góc 45° là hai đường thẳng như thế nào?", answer: "cắt nhau", explanation: "Hai đường thẳng tạo góc $45° \\neq 90°$ nên chúng **cắt nhau** nhưng không vuông góc." },
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

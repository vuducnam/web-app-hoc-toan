import "server-only";
// Probability introduction MC generator — classify event likelihood.
// answerFormat: multiple-choice; choices: ["chắc chắn", "có thể", "không thể"].
// Strategy: hard-coded (problemText, correctAnswer) tuples per difficulty tier; RNG picks one.
// D1: clear-cut everyday scenarios.
// D2: more nuanced scenarios requiring reasoning.
// D3: ratio-based scenarios ("trong 10 quả có 9 đỏ 1 xanh…").
import { makeRng } from "../seeded-rng";
import type { Generator, GeneratorParams, Question } from "../types";

const CHOICES = ["chắc chắn", "có thể", "không thể"] as const;
const TIME: Record<number, number> = { 1: 30, 2: 45, 3: 45 };

type Template = { text: string; answer: (typeof CHOICES)[number] };

const D1_TEMPLATES: Template[] = [
  { text: "Mặt trời mọc ở phía đông. Điều này xảy ra là:", answer: "chắc chắn" },
  { text: "Tung một đồng xu thì được mặt sấp. Điều này xảy ra là:", answer: "có thể" },
  { text: "Lấy ra 1 quả bóng đỏ từ hộp chỉ chứa bóng xanh. Điều này xảy ra là:", answer: "không thể" },
  { text: "Ngày mai trời sẽ có mưa hoặc không mưa. Điều này xảy ra là:", answer: "chắc chắn" },
  { text: "Bạn An lăn xúc xắc và ra mặt số 7. Điều này xảy ra là:", answer: "không thể" },
  { text: "Lấy ngẫu nhiên 1 viên bi từ túi có cả bi đỏ và bi xanh. Lấy được bi đỏ là:", answer: "có thể" },
  { text: "Tháng 2 năm thường có 28 ngày. Điều này xảy ra là:", answer: "chắc chắn" },
  { text: "Một học sinh học giỏi sẽ đạt điểm 10 trong kỳ thi. Điều này xảy ra là:", answer: "có thể" },
];

const D2_TEMPLATES: Template[] = [
  { text: "Một hộp có 5 quả bóng đỏ và 5 quả bóng xanh. Lấy ngẫu nhiên 1 quả được bóng vàng là:", answer: "không thể" },
  { text: "Lớp học có 20 học sinh, trong đó có 10 nam và 10 nữ. Chọn ngẫu nhiên 1 học sinh là nữ:", answer: "có thể" },
  { text: "Số tự nhiên bất kỳ chia hết cho 1. Điều này xảy ra là:", answer: "chắc chắn" },
  { text: "Gieo một con xúc xắc 6 mặt ra mặt số lớn hơn 6. Điều này xảy ra là:", answer: "không thể" },
  { text: "Một túi có toàn bóng đỏ. Lấy ngẫu nhiên 1 quả được bóng đỏ là:", answer: "chắc chắn" },
  { text: "Trong ngăn bút có cả bút xanh và bút đỏ. Lấy ngẫu nhiên ra bút đen là:", answer: "không thể" },
  { text: "Bạn tung đồng xu 2 lần đều ra mặt ngửa. Lần thứ 3 ra mặt sấp là:", answer: "có thể" },
];

const D3_TEMPLATES: Template[] = [
  { text: "Trong hộp có 9 quả bóng đỏ và 1 quả bóng xanh. Lấy ngẫu nhiên 1 quả được bóng xanh là:", answer: "có thể" },
  { text: "Trong túi có 10 viên bi xanh. Lấy ngẫu nhiên 1 viên bi được màu xanh là:", answer: "chắc chắn" },
  { text: "Một hộp có 3 thẻ số: 2, 4, 6. Rút ngẫu nhiên 1 thẻ được số lẻ là:", answer: "không thể" },
  { text: "Một hộp có 4 thẻ số: 1, 2, 3, 4. Rút ngẫu nhiên 1 thẻ được số nhỏ hơn 5 là:", answer: "chắc chắn" },
  { text: "Trong lớp có 15 học sinh đạt loại giỏi trên tổng 30 học sinh. Chọn ngẫu nhiên 1 học sinh đạt loại giỏi là:", answer: "có thể" },
  { text: "Một hộp có 99 quả bóng đỏ và 1 quả bóng xanh. Lấy ngẫu nhiên 1 quả được bóng đỏ là:", answer: "có thể" },
  { text: "Bạn chọn ngẫu nhiên 1 số từ 1 đến 10. Số đó chia hết cho 11 là:", answer: "không thể" },
];

const TEMPLATES: Record<number, Template[]> = {
  1: D1_TEMPLATES,
  2: D2_TEMPLATES,
  3: D3_TEMPLATES,
};

export const probabilityIntro: Generator<string> = {
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

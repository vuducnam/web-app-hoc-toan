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

type Template = { text: string; answer: (typeof CHOICES)[number]; explanation: string };

const D1_TEMPLATES: Template[] = [
  { text: "Mặt trời mọc ở phía đông. Điều này xảy ra là:", answer: "chắc chắn", explanation: "Mặt trời luôn mọc ở phía đông — đây là hiện tượng tự nhiên không thay đổi, nên điều này xảy ra **chắc chắn**." },
  { text: "Tung một đồng xu thì được mặt sấp. Điều này xảy ra là:", answer: "có thể", explanation: "Khi tung đồng xu, có thể ra mặt ngửa hoặc mặt sấp — không chắc chắn, không không thể, nên điều này **có thể** xảy ra." },
  { text: "Lấy ra 1 quả bóng đỏ từ hộp chỉ chứa bóng xanh. Điều này xảy ra là:", answer: "không thể", explanation: "Hộp chỉ chứa bóng xanh, nên **không thể** lấy ra bóng đỏ." },
  { text: "Ngày mai trời sẽ có mưa hoặc không mưa. Điều này xảy ra là:", answer: "chắc chắn", explanation: "Ngày mai hoặc có mưa hoặc không có mưa — một trong hai phải xảy ra, nên điều này **chắc chắn** đúng." },
  { text: "Bạn An lăn xúc xắc và ra mặt số 7. Điều này xảy ra là:", answer: "không thể", explanation: "Xúc xắc 6 mặt chỉ có số 1 đến 6, không có số 7, nên **không thể** ra mặt số 7." },
  { text: "Lấy ngẫu nhiên 1 viên bi từ túi có cả bi đỏ và bi xanh. Lấy được bi đỏ là:", answer: "có thể", explanation: "Túi có cả bi đỏ và bi xanh, nên lấy được bi đỏ là điều **có thể** xảy ra." },
  { text: "Tháng 2 năm thường có 28 ngày. Điều này xảy ra là:", answer: "chắc chắn", explanation: "Theo lịch dương, tháng 2 năm thường luôn có 28 ngày — điều này **chắc chắn** đúng." },
  { text: "Một học sinh học giỏi sẽ đạt điểm 10 trong kỳ thi. Điều này xảy ra là:", answer: "có thể", explanation: "Học sinh giỏi có khả năng đạt điểm 10, nhưng không phải lúc nào cũng vậy — điều này **có thể** xảy ra." },
];

const D2_TEMPLATES: Template[] = [
  { text: "Một hộp có 5 quả bóng đỏ và 5 quả bóng xanh. Lấy ngẫu nhiên 1 quả được bóng vàng là:", answer: "không thể", explanation: "Hộp chỉ có bóng đỏ và bóng xanh, không có bóng vàng, nên **không thể** lấy được bóng vàng." },
  { text: "Lớp học có 20 học sinh, trong đó có 10 nam và 10 nữ. Chọn ngẫu nhiên 1 học sinh là nữ:", answer: "có thể", explanation: "Lớp có học sinh nữ, nên chọn ngẫu nhiên **có thể** được học sinh nữ (không chắc chắn vì cũng có thể chọn được nam)." },
  { text: "Số tự nhiên bất kỳ chia hết cho 1. Điều này xảy ra là:", answer: "chắc chắn", explanation: "Mọi số tự nhiên đều chia hết cho 1 — đây là tính chất luôn đúng, nên điều này **chắc chắn** xảy ra." },
  { text: "Gieo một con xúc xắc 6 mặt ra mặt số lớn hơn 6. Điều này xảy ra là:", answer: "không thể", explanation: "Xúc xắc 6 mặt có số từ 1 đến 6, không có số nào lớn hơn 6, nên **không thể** xảy ra." },
  { text: "Một túi có toàn bóng đỏ. Lấy ngẫu nhiên 1 quả được bóng đỏ là:", answer: "chắc chắn", explanation: "Túi chỉ chứa bóng đỏ, nên lấy ra quả nào cũng là bóng đỏ — điều này **chắc chắn** xảy ra." },
  { text: "Trong ngăn bút có cả bút xanh và bút đỏ. Lấy ngẫu nhiên ra bút đen là:", answer: "không thể", explanation: "Ngăn bút chỉ có bút xanh và bút đỏ, không có bút đen, nên **không thể** lấy được bút đen." },
  { text: "Bạn tung đồng xu 2 lần đều ra mặt ngửa. Lần thứ 3 ra mặt sấp là:", answer: "có thể", explanation: "Mỗi lần tung độc lập với nhau; lần thứ 3 vẫn **có thể** ra mặt sấp (xác suất 1/2), kết quả lần trước không ảnh hưởng." },
];

const D3_TEMPLATES: Template[] = [
  { text: "Trong hộp có 9 quả bóng đỏ và 1 quả bóng xanh. Lấy ngẫu nhiên 1 quả được bóng xanh là:", answer: "có thể", explanation: "Hộp có 1 bóng xanh trong 10 quả, nên **có thể** lấy được bóng xanh (dù xác suất thấp — $\\frac{1}{10}$)." },
  { text: "Trong túi có 10 viên bi xanh. Lấy ngẫu nhiên 1 viên bi được màu xanh là:", answer: "chắc chắn", explanation: "Túi chỉ có bi xanh, nên lấy ra viên nào cũng là màu xanh — điều này **chắc chắn** xảy ra." },
  { text: "Một hộp có 3 thẻ số: 2, 4, 6. Rút ngẫu nhiên 1 thẻ được số lẻ là:", answer: "không thể", explanation: "Cả ba thẻ đều là số chẵn (2, 4, 6), không có số lẻ nào, nên **không thể** rút được số lẻ." },
  { text: "Một hộp có 4 thẻ số: 1, 2, 3, 4. Rút ngẫu nhiên 1 thẻ được số nhỏ hơn 5 là:", answer: "chắc chắn", explanation: "Tất cả các thẻ (1, 2, 3, 4) đều nhỏ hơn 5, nên rút thẻ nào cũng nhỏ hơn 5 — **chắc chắn** xảy ra." },
  { text: "Trong lớp có 15 học sinh đạt loại giỏi trên tổng 30 học sinh. Chọn ngẫu nhiên 1 học sinh đạt loại giỏi là:", answer: "có thể", explanation: "Có $\\frac{15}{30} = \\frac{1}{2}$ số học sinh loại giỏi, nên chọn ngẫu nhiên **có thể** được học sinh loại giỏi." },
  { text: "Một hộp có 99 quả bóng đỏ và 1 quả bóng xanh. Lấy ngẫu nhiên 1 quả được bóng đỏ là:", answer: "có thể", explanation: "Dù xác suất rất cao ($\\frac{99}{100}$), vẫn **có thể** lấy được bóng xanh — do đó lấy được bóng đỏ chỉ là **có thể**, không phải chắc chắn." },
  { text: "Bạn chọn ngẫu nhiên 1 số từ 1 đến 10. Số đó chia hết cho 11 là:", answer: "không thể", explanation: "Các số từ 1 đến 10 đều nhỏ hơn 11, nên không số nào chia hết cho 11 — điều này **không thể** xảy ra." },
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

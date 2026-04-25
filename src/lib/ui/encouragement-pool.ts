/** Vietnamese encouragement phrase pools for gamified feedback */

const CORRECT_PHRASES = [
  "Tuyệt vời!",
  "Chính xác!",
  "Bạn giỏi quá!",
  "Thật xuất sắc!",
  "Chuẩn không cần chỉnh!",
  "Quá đỉnh!",
] as const;

const WRONG_PHRASES = [
  "Sắp đúng rồi!",
  "Cố gắng thêm chút nữa nhé!",
  "Không sao, thử lại nào!",
  "Bạn làm được mà!",
  "Suy nghĩ kỹ hơn nhé!",
] as const;

const GREETING_PHRASES = [
  "Chào bạn!",
  "Chào em trở lại!",
  "Hôm nay học gì nào?",
  "Sẵn sàng chinh phục chưa?",
] as const;

export type EncouragementKind = "correct" | "wrong" | "greeting";

const poolMap: Record<EncouragementKind, readonly string[]> = {
  correct: CORRECT_PHRASES,
  wrong: WRONG_PHRASES,
  greeting: GREETING_PHRASES,
};

/** Returns a random phrase from the given pool */
export function pickEncouragement(kind: EncouragementKind): string {
  const pool = poolMap[kind];
  return pool[Math.floor(Math.random() * pool.length)];
}

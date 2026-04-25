// Pure function: rule-based Vietnamese recommendation strings for parents.
// Returns up to 3 actionable strings.

import type { WeakSkill } from "./compute-weak-skills";

export interface RecommendationInput {
  weakSkills: WeakSkill[];
  uniqueActiveDays: number;
  /** sum of masteryLevel ints / (skillCount * 3) — ratio 0..1 */
  masteryRatio: number;
  skillCount: number;
}

/**
 * Returns 1–3 formal Vietnamese recommendation strings ("Anh/Chị...").
 * Rules applied in priority order; deduped.
 */
export function composeRecommendations(input: RecommendationInput): string[] {
  const { weakSkills, uniqueActiveDays, masteryRatio, skillCount } = input;
  const results: string[] = [];

  // Rule 1: top weak skill
  if (weakSkills.length > 0) {
    const top = weakSkills[0];
    results.push(`Anh/Chị nên gợi ý bé luyện tập thêm kỹ năng "${top.nameVi}".`);
  }

  // Rule 2: low activity (< 3 days out of 7)
  if (uniqueActiveDays < 3) {
    results.push("Anh/Chị nên khuyến khích bé duy trì luyện tập đều đặn hàng ngày.");
  }

  // Rule 3: mostly mastered → suggest harder content
  if (skillCount > 0 && masteryRatio >= 0.75) {
    results.push(
      "Bé đã thuần thục đa số kỹ năng, Anh/Chị có thể xem xét nội dung ở mức độ khó hơn.",
    );
  }

  // Rule 4: second weak skill (if still room and mastery not high)
  if (results.length < 3 && weakSkills.length >= 2 && masteryRatio < 0.75) {
    const second = weakSkills[1];
    results.push(`Kỹ năng "${second.nameVi}" cũng cần được ôn tập thêm.`);
  }

  // Rule 5: fallback encouragement if no issues found
  if (results.length === 0) {
    results.push("Bé đang học tốt. Anh/Chị hãy tiếp tục động viên bé mỗi ngày.");
  }

  return results.slice(0, 3);
}

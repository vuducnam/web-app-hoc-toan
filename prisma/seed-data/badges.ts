// Badge seed data — 16 badges from gamification research §3
// Tier values: "bronze" | "silver" | "gold"
// Category values: "mastery" | "streak" | "speed" | "variety" | "quality" | "consistency" | "special"
// criteria.type drives badge engine (Phase 11 will fully type these)

import type { SeedBadge } from "./types";

export const badges: SeedBadge[] = [
  // ---------------------------------------------------------------------------
  // Mastery — correct answer volume milestones
  // ---------------------------------------------------------------------------
  {
    key: "mastery-bronze",
    nameVi: "Khởi Đầu",
    descVi: "Trả lời đúng 5 câu hỏi",
    tier: "bronze",
    category: "mastery",
    criteria: { type: "correct_count", value: 5 },
  },
  {
    key: "mastery-silver",
    nameVi: "Thợ Giỏi",
    descVi: "Trả lời đúng 50 câu hỏi",
    tier: "silver",
    category: "mastery",
    criteria: { type: "correct_count", value: 50 },
  },
  {
    key: "mastery-gold",
    nameVi: "Bậc Thầy",
    descVi: "Trả lời đúng 200 câu hỏi",
    tier: "gold",
    category: "mastery",
    criteria: { type: "correct_count", value: 200 },
  },

  // ---------------------------------------------------------------------------
  // Streak — consecutive days of practice
  // ---------------------------------------------------------------------------
  {
    key: "streak-bronze",
    nameVi: "Ngày Đầu",
    descVi: "Hoàn thành luyện tập 1 ngày",
    tier: "bronze",
    category: "streak",
    criteria: { type: "streak_days", value: 1 },
  },
  {
    key: "streak-silver",
    nameVi: "Một Tuần",
    descVi: "Luyện tập 7 ngày liên tiếp",
    tier: "silver",
    category: "streak",
    criteria: { type: "streak_days", value: 7 },
  },
  {
    key: "streak-gold",
    nameVi: "Tháng Vàng",
    descVi: "Luyện tập 30 ngày liên tiếp",
    tier: "gold",
    category: "streak",
    criteria: { type: "streak_days", value: 30 },
  },

  // ---------------------------------------------------------------------------
  // Speed — fast correct answers (under 20 seconds each)
  // ---------------------------------------------------------------------------
  {
    key: "speed-bronze",
    nameVi: "Tính Toán Nhanh",
    descVi: "Trả lời đúng 5 câu dưới 20 giây mỗi câu",
    tier: "bronze",
    category: "speed",
    criteria: { type: "fast_correct_count", value: 5, thresholdMs: 20000 },
  },
  {
    key: "speed-silver",
    nameVi: "Siêu Tính",
    descVi: "Trả lời đúng 20 câu dưới 20 giây mỗi câu",
    tier: "silver",
    category: "speed",
    criteria: { type: "fast_correct_count", value: 20, thresholdMs: 20000 },
  },
  {
    key: "speed-gold",
    nameVi: "Lightning",
    descVi: "Trả lời đúng 50 câu dưới 20 giây mỗi câu",
    tier: "gold",
    category: "speed",
    criteria: { type: "fast_correct_count", value: 50, thresholdMs: 20000 },
  },

  // ---------------------------------------------------------------------------
  // Variety — number of distinct skill types attempted
  // ---------------------------------------------------------------------------
  {
    key: "variety-bronze",
    nameVi: "Khám Phá",
    descVi: "Giải quyết 5 dạng bài khác nhau",
    tier: "bronze",
    category: "variety",
    criteria: { type: "distinct_skills_attempted", value: 5 },
  },
  {
    key: "variety-silver",
    nameVi: "Linh Hoạt",
    descVi: "Giải quyết 15 dạng bài khác nhau",
    tier: "silver",
    category: "variety",
    criteria: { type: "distinct_skills_attempted", value: 15 },
  },
  {
    key: "variety-gold",
    nameVi: "Toàn Năng",
    descVi: "Giải quyết 25 dạng bài khác nhau",
    tier: "gold",
    category: "variety",
    criteria: { type: "distinct_skills_attempted", value: 25 },
  },

  // ---------------------------------------------------------------------------
  // Quality — high accuracy
  // ---------------------------------------------------------------------------
  {
    key: "quality-bronze",
    nameVi: "Tự Tin",
    descVi: "Đạt độ chính xác 90% trở lên trong 10 câu liên tiếp",
    tier: "bronze",
    category: "quality",
    criteria: { type: "accuracy_streak", minAccuracy: 0.9, windowSize: 10 },
  },
  {
    key: "quality-silver",
    nameVi: "Hoàn Hảo",
    descVi: "Đạt 100% chính xác trong 10 câu liên tiếp 3 lần",
    tier: "silver",
    category: "quality",
    criteria: {
      type: "perfect_window_count",
      windowSize: 10,
      requiredCount: 3,
    },
  },

  // ---------------------------------------------------------------------------
  // Consistency — sustained daily goal completion
  // ---------------------------------------------------------------------------
  {
    key: "consistency-gold",
    nameVi: "Siêu Sao",
    descVi: "Hoàn thành mục tiêu ngày 5 ngày liên tiếp",
    tier: "gold",
    category: "consistency",
    criteria: { type: "daily_goal_streak", value: 5 },
  },

  // ---------------------------------------------------------------------------
  // Special — milestone unlock
  // ---------------------------------------------------------------------------
  {
    key: "special-topic-unlock",
    nameVi: "Bước Ngoặt",
    descVi: "Hoàn thành thành thạo một chủ đề mới",
    tier: "bronze",
    category: "special",
    criteria: { type: "topic_mastered", value: 1 },
  },
];

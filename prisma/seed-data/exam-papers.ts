// Exam paper seed definitions - 8 standardized papers (G4+G5 × 4 exam types).
// Each paper.structure is a JSON ExamSlot[] (see src/lib/exam/types.ts).
// skillPool entries are GENERATOR keys (matching src/lib/generators/registry.ts LIVE_GENERATOR_KEYS).
// Matrix per TT 27/2020: M1=40% / M2=30% / M3=20% / M4=10% of point total (10).
// 6-question mid-semester: 3 M1×1đ + 2 M2×1.5đ + 1 M3×4đ = 10 (3/2/1/0 matrix).
// 8-question end-of-semester: 4 M1×1đ + 2 M2×1.5đ + 1 M3×2đ + 1 M4×1đ = 10 (4/2/1/1).
// 10-question end-of-year G5: 4 M1×1đ + 3 M2×1đ + 2 M3×1đ + 1 M4×1đ = 10 (4/3/2/1).

export interface ExamSlotSeed {
  slotNo: number;
  difficulty: "M1" | "M2" | "M3" | "M4";
  questionType: "MC" | "NUMERIC";
  pointWeight: number;
  skillPool: string[];
}

export interface ExamPaperSeed {
  key: string;
  gradeKey: "g4" | "g5";
  examType: "MID_SEM_1" | "END_SEM_1" | "MID_SEM_2" | "END_OF_YEAR";
  nameVi: string;
  durationMinutes: number;
  totalQuestions: number;
  totalPoints: number;
  structure: ExamSlotSeed[];
}

// 6-question mid-semester points: 3×1 + 2×1.5 + 1×4 = 10
const POINTS_6Q = { M1: 1.0, M2: 1.5, M3: 4.0 } as const;
// 8-question end-of-semester points: 4×1 + 2×1.5 + 1×2 + 1×1 = 10
const POINTS_8Q = { M1: 1.0, M2: 1.5, M3: 2.0, M4: 1.0 } as const;
// 10-question end-of-year points: 4×1 + 3×1 + 2×1 + 1×1 = 10
const POINTS_10Q = { M1: 1.0, M2: 1.0, M3: 1.0, M4: 1.0 } as const;

// =============================================================================
// G4 - Lớp 4
// =============================================================================

const g4MidSem1: ExamPaperSeed = {
  key: "g4-giua-ky-1",
  gradeKey: "g4",
  examType: "MID_SEM_1",
  nameVi: "Giữa học kỳ 1 - Lớp 4",
  durationMinutes: 30,
  totalQuestions: 6,
  totalPoints: 10,
  structure: [
    { slotNo: 1, difficulty: "M1", questionType: "MC", pointWeight: POINTS_6Q.M1,
      skillPool: ["numbers-to-100k", "even-odd", "place-value-6digit"] },
    { slotNo: 2, difficulty: "M1", questionType: "MC", pointWeight: POINTS_6Q.M1,
      skillPool: ["numbers-to-100k", "even-odd", "6-digit-numbers"] },
    { slotNo: 3, difficulty: "M1", questionType: "MC", pointWeight: POINTS_6Q.M1,
      skillPool: ["place-value-6digit", "even-odd", "rounding"] },
    { slotNo: 4, difficulty: "M2", questionType: "MC", pointWeight: POINTS_6Q.M2,
      skillPool: ["add-sub-100k-carry", "6-digit-numbers", "rounding"] },
    { slotNo: 5, difficulty: "M2", questionType: "MC", pointWeight: POINTS_6Q.M2,
      skillPool: ["add-sub-100k-carry", "rounding", "length-conversion"] },
    { slotNo: 6, difficulty: "M3", questionType: "NUMERIC", pointWeight: POINTS_6Q.M3,
      skillPool: ["word-add-sub", "length-conversion", "mass-conversion"] },
  ],
};

const g4EndSem1: ExamPaperSeed = {
  key: "g4-cuoi-ky-1",
  gradeKey: "g4",
  examType: "END_SEM_1",
  nameVi: "Cuối học kỳ 1 - Lớp 4",
  durationMinutes: 40,
  totalQuestions: 8,
  totalPoints: 10,
  structure: [
    { slotNo: 1, difficulty: "M1", questionType: "MC", pointWeight: POINTS_8Q.M1,
      skillPool: ["numbers-to-100k", "even-odd", "place-value-6digit"] },
    { slotNo: 2, difficulty: "M1", questionType: "MC", pointWeight: POINTS_8Q.M1,
      skillPool: ["6-digit-numbers", "place-value-6digit", "rounding"] },
    { slotNo: 3, difficulty: "M1", questionType: "MC", pointWeight: POINTS_8Q.M1,
      skillPool: ["angle-classify", "parallel-perpendicular", "parallelogram-rhombus"] },
    { slotNo: 4, difficulty: "M1", questionType: "MC", pointWeight: POINTS_8Q.M1,
      skillPool: ["even-odd", "numbers-to-100k", "angle-classify"] },
    { slotNo: 5, difficulty: "M2", questionType: "MC", pointWeight: POINTS_8Q.M2,
      skillPool: ["add-sub-100k-carry", "add-large-numbers", "sub-large-numbers"] },
    { slotNo: 6, difficulty: "M2", questionType: "MC", pointWeight: POINTS_8Q.M2,
      skillPool: ["length-conversion", "mass-conversion", "capacity-conversion"] },
    { slotNo: 7, difficulty: "M3", questionType: "NUMERIC", pointWeight: POINTS_8Q.M3,
      skillPool: ["word-add-sub", "word-rectangle-area", "word-unit-conversion"] },
    { slotNo: 8, difficulty: "M4", questionType: "NUMERIC", pointWeight: POINTS_8Q.M4,
      skillPool: ["semester1-review-arithmetic", "word-unit-conversion"] },
  ],
};

const g4MidSem2: ExamPaperSeed = {
  key: "g4-giua-ky-2",
  gradeKey: "g4",
  examType: "MID_SEM_2",
  nameVi: "Giữa học kỳ 2 - Lớp 4",
  durationMinutes: 30,
  totalQuestions: 6,
  totalPoints: 10,
  structure: [
    { slotNo: 1, difficulty: "M1", questionType: "MC", pointWeight: POINTS_6Q.M1,
      skillPool: ["multiply-1-digit", "divide-1-digit", "fraction-concept"] },
    { slotNo: 2, difficulty: "M1", questionType: "MC", pointWeight: POINTS_6Q.M1,
      skillPool: ["fraction-concept", "probability-intro", "multiply-1-digit"] },
    { slotNo: 3, difficulty: "M1", questionType: "MC", pointWeight: POINTS_6Q.M1,
      skillPool: ["divide-1-digit", "simplify-fraction", "probability-intro"] },
    { slotNo: 4, difficulty: "M2", questionType: "MC", pointWeight: POINTS_6Q.M2,
      skillPool: ["multiply-2-digit", "divide-2-digit", "multiply-divide-powers-10"] },
    { slotNo: 5, difficulty: "M2", questionType: "MC", pointWeight: POINTS_6Q.M2,
      skillPool: ["simplify-fraction", "fraction-compare", "fraction-common-denominator"] },
    { slotNo: 6, difficulty: "M3", questionType: "NUMERIC", pointWeight: POINTS_6Q.M3,
      skillPool: ["word-multiply-divide", "word-fractions"] },
  ],
};

const g4EndOfYear: ExamPaperSeed = {
  key: "g4-cuoi-nam",
  gradeKey: "g4",
  examType: "END_OF_YEAR",
  nameVi: "Cuối năm - Lớp 4",
  durationMinutes: 40,
  totalQuestions: 8,
  totalPoints: 10,
  structure: [
    { slotNo: 1, difficulty: "M1", questionType: "MC", pointWeight: POINTS_8Q.M1,
      skillPool: ["numbers-to-100k", "even-odd", "fraction-concept"] },
    { slotNo: 2, difficulty: "M1", questionType: "MC", pointWeight: POINTS_8Q.M1,
      skillPool: ["multiply-1-digit", "divide-1-digit", "place-value-6digit"] },
    { slotNo: 3, difficulty: "M1", questionType: "MC", pointWeight: POINTS_8Q.M1,
      skillPool: ["simplify-fraction", "fraction-compare", "fraction-concept"] },
    { slotNo: 4, difficulty: "M1", questionType: "MC", pointWeight: POINTS_8Q.M1,
      skillPool: ["angle-classify", "parallel-perpendicular", "parallelogram-rhombus"] },
    { slotNo: 5, difficulty: "M2", questionType: "MC", pointWeight: POINTS_8Q.M2,
      skillPool: ["fraction-add", "fraction-subtract", "multiply-2-digit"] },
    { slotNo: 6, difficulty: "M2", questionType: "MC", pointWeight: POINTS_8Q.M2,
      skillPool: ["fraction-multiply", "fraction-divide", "divide-2-digit"] },
    { slotNo: 7, difficulty: "M3", questionType: "NUMERIC", pointWeight: POINTS_8Q.M3,
      skillPool: ["word-add-sub", "word-multiply-divide", "word-fractions", "word-rectangle-area"] },
    { slotNo: 8, difficulty: "M4", questionType: "NUMERIC", pointWeight: POINTS_8Q.M4,
      skillPool: ["year-review-arithmetic", "year-review-fractions"] },
  ],
};

// =============================================================================
// G5 - Lớp 5
// =============================================================================

const g5MidSem1: ExamPaperSeed = {
  key: "g5-giua-ky-1",
  gradeKey: "g5",
  examType: "MID_SEM_1",
  nameVi: "Giữa học kỳ 1 - Lớp 5",
  durationMinutes: 30,
  totalQuestions: 6,
  totalPoints: 10,
  structure: [
    { slotNo: 1, difficulty: "M1", questionType: "MC", pointWeight: POINTS_6Q.M1,
      skillPool: ["decimal-concept", "decimal-compare", "natural-numbers-review"] },
    { slotNo: 2, difficulty: "M1", questionType: "MC", pointWeight: POINTS_6Q.M1,
      skillPool: ["decimal-concept", "fractions-review", "natural-numbers-review"] },
    { slotNo: 3, difficulty: "M1", questionType: "MC", pointWeight: POINTS_6Q.M1,
      skillPool: ["decimal-compare", "decimal-rounding", "fractions-review"] },
    { slotNo: 4, difficulty: "M2", questionType: "MC", pointWeight: POINTS_6Q.M2,
      skillPool: ["decimal-rounding", "area-unit-conversion", "fractions-review"] },
    { slotNo: 5, difficulty: "M2", questionType: "MC", pointWeight: POINTS_6Q.M2,
      skillPool: ["area-unit-conversion", "decimal-compare", "decimal-rounding"] },
    { slotNo: 6, difficulty: "M3", questionType: "NUMERIC", pointWeight: POINTS_6Q.M3,
      skillPool: ["geometry-review", "fractions-review"] },
  ],
};

const g5EndSem1: ExamPaperSeed = {
  key: "g5-cuoi-ky-1",
  gradeKey: "g5",
  examType: "END_SEM_1",
  nameVi: "Cuối học kỳ 1 - Lớp 5",
  durationMinutes: 40,
  totalQuestions: 8,
  totalPoints: 10,
  structure: [
    { slotNo: 1, difficulty: "M1", questionType: "MC", pointWeight: POINTS_8Q.M1,
      skillPool: ["decimal-concept", "decimal-compare", "fractions-review"] },
    { slotNo: 2, difficulty: "M1", questionType: "MC", pointWeight: POINTS_8Q.M1,
      skillPool: ["decimal-add", "decimal-subtract", "natural-numbers-review"] },
    { slotNo: 3, difficulty: "M1", questionType: "MC", pointWeight: POINTS_8Q.M1,
      skillPool: ["decimal-rounding", "decimal-compare", "decimal-concept"] },
    { slotNo: 4, difficulty: "M1", questionType: "MC", pointWeight: POINTS_8Q.M1,
      skillPool: ["fractions-review", "decimal-add", "decimal-subtract"] },
    { slotNo: 5, difficulty: "M2", questionType: "MC", pointWeight: POINTS_8Q.M2,
      skillPool: ["decimal-multiply", "decimal-divide", "decimal-powers-10"] },
    { slotNo: 6, difficulty: "M2", questionType: "MC", pointWeight: POINTS_8Q.M2,
      skillPool: ["area-unit-conversion", "decimal-multiply", "decimal-divide"] },
    { slotNo: 7, difficulty: "M3", questionType: "NUMERIC", pointWeight: POINTS_8Q.M3,
      skillPool: ["triangle-area", "trapezoid-area", "circle-circumference-area"] },
    { slotNo: 8, difficulty: "M4", questionType: "NUMERIC", pointWeight: POINTS_8Q.M4,
      skillPool: ["word-decimals", "word-circle-triangle-area", "semester1-review-decimals"] },
  ],
};

const g5MidSem2: ExamPaperSeed = {
  key: "g5-giua-ky-2",
  gradeKey: "g5",
  examType: "MID_SEM_2",
  nameVi: "Giữa học kỳ 2 - Lớp 5",
  durationMinutes: 30,
  totalQuestions: 6,
  totalPoints: 10,
  structure: [
    { slotNo: 1, difficulty: "M1", questionType: "MC", pointWeight: POINTS_6Q.M1,
      skillPool: ["ratio-concept", "percent-of-whole", "volume-units"] },
    { slotNo: 2, difficulty: "M1", questionType: "MC", pointWeight: POINTS_6Q.M1,
      skillPool: ["percent-of-whole", "ratio-concept", "volume-units"] },
    { slotNo: 3, difficulty: "M1", questionType: "MC", pointWeight: POINTS_6Q.M1,
      skillPool: ["volume-units", "percent-of-whole", "ratio-concept"] },
    { slotNo: 4, difficulty: "M2", questionType: "MC", pointWeight: POINTS_6Q.M2,
      skillPool: ["rectangular-prism-volume", "box-surface-area", "cylinder-volume"] },
    { slotNo: 5, difficulty: "M2", questionType: "MC", pointWeight: POINTS_6Q.M2,
      skillPool: ["box-surface-area", "cylinder-volume", "rectangular-prism-volume"] },
    { slotNo: 6, difficulty: "M3", questionType: "NUMERIC", pointWeight: POINTS_6Q.M3,
      skillPool: ["word-percent", "word-3d-volume", "ratio-word-problems"] },
  ],
};

const g5EndOfYear: ExamPaperSeed = {
  key: "g5-cuoi-nam",
  gradeKey: "g5",
  examType: "END_OF_YEAR",
  nameVi: "Cuối năm - Lớp 5",
  durationMinutes: 40,
  totalQuestions: 10,
  totalPoints: 10,
  structure: [
    { slotNo: 1, difficulty: "M1", questionType: "MC", pointWeight: POINTS_10Q.M1,
      skillPool: ["decimal-concept", "fractions-review", "natural-numbers-review"] },
    { slotNo: 2, difficulty: "M1", questionType: "MC", pointWeight: POINTS_10Q.M1,
      skillPool: ["decimal-add", "decimal-subtract", "ratio-concept"] },
    { slotNo: 3, difficulty: "M1", questionType: "MC", pointWeight: POINTS_10Q.M1,
      skillPool: ["percent-of-whole", "volume-units", "decimal-rounding"] },
    { slotNo: 4, difficulty: "M1", questionType: "MC", pointWeight: POINTS_10Q.M1,
      skillPool: ["time-measurement", "area-unit-conversion", "decimal-compare"] },
    { slotNo: 5, difficulty: "M2", questionType: "MC", pointWeight: POINTS_10Q.M2,
      skillPool: ["decimal-multiply", "decimal-divide", "rectangular-prism-volume"] },
    { slotNo: 6, difficulty: "M2", questionType: "MC", pointWeight: POINTS_10Q.M2,
      skillPool: ["area-unit-conversion", "decimal-rounding", "box-surface-area"] },
    { slotNo: 7, difficulty: "M2", questionType: "MC", pointWeight: POINTS_10Q.M2,
      skillPool: ["cylinder-volume", "decimal-divide", "decimal-multiply"] },
    { slotNo: 8, difficulty: "M3", questionType: "NUMERIC", pointWeight: POINTS_10Q.M3,
      skillPool: ["triangle-area", "trapezoid-area", "circle-circumference-area"] },
    { slotNo: 9, difficulty: "M3", questionType: "NUMERIC", pointWeight: POINTS_10Q.M3,
      skillPool: ["speed-distance-time", "ratio-word-problems", "word-percent"] },
    { slotNo: 10, difficulty: "M4", questionType: "NUMERIC", pointWeight: POINTS_10Q.M4,
      skillPool: ["word-year-review", "year-review-comprehensive"] },
  ],
};

export const examPaperSeeds: ExamPaperSeed[] = [
  g4MidSem1, g4EndSem1, g4MidSem2, g4EndOfYear,
  g5MidSem1, g5EndSem1, g5MidSem2, g5EndOfYear,
];

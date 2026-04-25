import { describe, it, expect } from "vitest";
import { generateAttempt, mapMtoDifficulty } from "@/lib/exam/generate-attempt";
import type { ExamSlot } from "@/lib/exam/types";
import { addSub100kCarry } from "@/lib/generators/arithmetic/add-sub-100k-carry";
import { wordAddSub } from "@/lib/generators/word-problems/word-add-sub";

const registry = {
  "add-sub-100k-carry": addSub100kCarry,
  "word-add-sub": wordAddSub,
};

const baseStructure: ExamSlot[] = [
  { slotNo: 1, difficulty: "M1", questionType: "MC", pointWeight: 1, skillPool: ["add-sub-100k-carry"] },
  { slotNo: 2, difficulty: "M2", questionType: "MC", pointWeight: 1.5, skillPool: ["add-sub-100k-carry"] },
  { slotNo: 3, difficulty: "M3", questionType: "NUMERIC", pointWeight: 4, skillPool: ["word-add-sub"] },
];

describe("generateAttempt", () => {
  it("is deterministic for same seed", () => {
    const a = generateAttempt({ examPaperId: "p", structure: baseStructure, seed: "abc", registry });
    const b = generateAttempt({ examPaperId: "p", structure: baseStructure, seed: "abc", registry });
    expect(a.length).toBe(3);
    for (let i = 0; i < a.length; i++) {
      expect(a[i].questionText).toBe(b[i].questionText);
      expect(a[i].expectedAnswer).toBe(b[i].expectedAnswer);
      if (a[i].choices) {
        expect(a[i].choices).toEqual(b[i].choices);
      }
    }
  });

  it("produces different output for different seed", () => {
    const a = generateAttempt({ examPaperId: "p", structure: baseStructure, seed: "x", registry });
    const b = generateAttempt({ examPaperId: "p", structure: baseStructure, seed: "y", registry });
    const same = a.every((x, i) => x.questionText === b[i].questionText);
    expect(same).toBe(false);
  });

  it("MC slots produce 4 unique choices including correct", () => {
    const r = generateAttempt({ examPaperId: "p", structure: baseStructure, seed: "abc", registry });
    for (const q of r) {
      if (q.questionType === "MC") {
        expect(q.choices).toBeTruthy();
        expect(q.choices!.length).toBe(4);
        const labels = q.choices!.map((c) => c.label);
        expect(labels).toEqual(["A", "B", "C", "D"]);
        const values = q.choices!.map((c) => c.value);
        expect(new Set(values).size).toBe(4);
        // Correct answer must be one of choices
        expect(values).toContain(q.expectedAnswer);
        expect(q.correctIndex).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("NUMERIC slots have null choices", () => {
    const r = generateAttempt({ examPaperId: "p", structure: baseStructure, seed: "abc", registry });
    const numeric = r.filter((q) => q.questionType === "NUMERIC");
    expect(numeric.length).toBeGreaterThan(0);
    for (const q of numeric) expect(q.choices).toBeNull();
  });

  it("throws if pool has no live generator", () => {
    expect(() =>
      generateAttempt({
        examPaperId: "p",
        structure: [
          { slotNo: 1, difficulty: "M1", questionType: "MC", pointWeight: 1, skillPool: ["unknown-skill"] },
        ],
        seed: "abc",
        registry,
      }),
    ).toThrow();
  });

  it("mapMtoDifficulty returns correct generator difficulty", () => {
    expect(mapMtoDifficulty("M1")).toBe(1);
    expect(mapMtoDifficulty("M2")).toBe(1);
    expect(mapMtoDifficulty("M3")).toBe(2);
    expect(mapMtoDifficulty("M4")).toBe(3);
  });
});

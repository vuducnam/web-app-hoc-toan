import { describe, it, expect } from "vitest";
import { addSub100kCarry } from "@/lib/generators/arithmetic/add-sub-100k-carry";

describe("add-sub-100k-carry generator", () => {
  describe("determinism", () => {
    it.each([1, 2, 3])("generates identical question for same seed at difficulty %s", (difficulty) => {
      const params = { seed: "test-seed-abc", difficulty: difficulty as 1 | 2 | 3, skillKey: "add-sub-100k-carry" };

      const q1 = addSub100kCarry.generate(params);
      const q2 = addSub100kCarry.generate(params);

      expect(q1.expectedAnswer).toBe(q2.expectedAnswer);
      expect(q1.problemText).toBe(q2.problemText);
      expect(q1.answerFormat).toBe(q2.answerFormat);
    });

    it("produces different questions for different seeds", () => {
      const baseParams = { difficulty: 2 as const, skillKey: "add-sub-100k-carry" };

      const q1 = addSub100kCarry.generate({ ...baseParams, seed: "seed-1" });
      const q2 = addSub100kCarry.generate({ ...baseParams, seed: "seed-2" });

      // At least one of problemText or expectedAnswer should differ
      expect(q1.problemText === q2.problemText && q1.expectedAnswer === q2.expectedAnswer).toBe(false);
    });
  });

  describe("validation correctness", () => {
    it("accepts correct answer", () => {
      const params = { seed: "correct-test", difficulty: 1 as const, skillKey: "add-sub-100k-carry" };
      const q = addSub100kCarry.generate(params);

      const result = addSub100kCarry.validate(q.expectedAnswer.toString(), q);
      expect(result).toBe(true);
    });

    it("rejects incorrect answer", () => {
      const params = { seed: "reject-test", difficulty: 2 as const, skillKey: "add-sub-100k-carry" };
      const q = addSub100kCarry.generate(params);

      const wrongAnswer = (q.expectedAnswer + 1).toString();
      const result = addSub100kCarry.validate(wrongAnswer, q);
      expect(result).toBe(false);
    });

    it("rejects non-numeric answer", () => {
      const params = { seed: "invalid-test", difficulty: 1 as const, skillKey: "add-sub-100k-carry" };
      const q = addSub100kCarry.generate(params);

      expect(addSub100kCarry.validate("abc", q)).toBe(false);
      expect(addSub100kCarry.validate("", q)).toBe(false);
    });
  });

  describe("difficulty constraints", () => {
    it("difficulty 1 produces operands in [10, 999]", () => {
      for (let i = 0; i < 20; i++) {
        const params = { seed: `d1-${i}`, difficulty: 1 as const, skillKey: "add-sub-100k-carry" };
        const q = addSub100kCarry.generate(params);

        // Parse operands from problemText: "a op b = ?"
        const match = q.problemText.match(/(\d+)\s*[+\-]\s*(\d+)/);
        expect(match).toBeTruthy();
        const [, aStr, bStr] = match!;
        const a = parseInt(aStr, 10);
        const b = parseInt(bStr, 10);

        expect(a).toBeGreaterThanOrEqual(10);
        expect(a).toBeLessThanOrEqual(999);
        expect(b).toBeGreaterThanOrEqual(10);
        expect(b).toBeLessThanOrEqual(999);
      }
    });

    it("difficulty 2 produces operands in [100, 9999]", () => {
      for (let i = 0; i < 20; i++) {
        const params = { seed: `d2-${i}`, difficulty: 2 as const, skillKey: "add-sub-100k-carry" };
        const q = addSub100kCarry.generate(params);

        const match = q.problemText.match(/(\d+)\s*[+\-]\s*(\d+)/);
        expect(match).toBeTruthy();
        const [, aStr, bStr] = match!;
        const a = parseInt(aStr, 10);
        const b = parseInt(bStr, 10);

        expect(a).toBeGreaterThanOrEqual(100);
        expect(a).toBeLessThanOrEqual(9999);
        expect(b).toBeGreaterThanOrEqual(100);
        expect(b).toBeLessThanOrEqual(9999);
      }
    });

    it("difficulty 3 produces operands in [1000, 99999]", () => {
      for (let i = 0; i < 20; i++) {
        const params = { seed: `d3-${i}`, difficulty: 3 as const, skillKey: "add-sub-100k-carry" };
        const q = addSub100kCarry.generate(params);

        const match = q.problemText.match(/(\d+)\s*[+\-]\s*(\d+)/);
        expect(match).toBeTruthy();
        const [, aStr, bStr] = match!;
        const a = parseInt(aStr, 10);
        const b = parseInt(bStr, 10);

        expect(a).toBeGreaterThanOrEqual(1000);
        expect(a).toBeLessThanOrEqual(99999);
        expect(b).toBeGreaterThanOrEqual(1000);
        expect(b).toBeLessThanOrEqual(99999);
      }
    });
  });

  describe("answer format", () => {
    it("returns numeric format", () => {
      const q = addSub100kCarry.generate({ seed: "format-test", difficulty: 1, skillKey: "add-sub-100k-carry" });
      expect(q.answerFormat).toBe("numeric");
      expect(typeof q.expectedAnswer).toBe("number");
    });

    it("includes metadata", () => {
      const q = addSub100kCarry.generate({ seed: "meta-test", difficulty: 2, skillKey: "add-sub-100k-carry" });
      expect(q.metadata).toBeDefined();
      expect(q.metadata.difficulty).toBe(2);
      expect(q.metadata.seed).toBe("meta-test");
      expect(q.metadata.skillKey).toBe("add-sub-100k-carry");
      expect(q.metadata.timeEstimateSec).toBeGreaterThan(0);
    });
  });
});

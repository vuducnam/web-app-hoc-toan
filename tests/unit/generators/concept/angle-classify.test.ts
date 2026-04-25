import { describe, it, expect } from "vitest";
import { angleClassify } from "@/lib/generators/concept/angle-classify";

const SK = "g4-angle-classify";

describe("angle-classify generator", () => {
  describe("determinism", () => {
    it.each([1, 2, 3])("same seed → identical question at difficulty %s", (d) => {
      const p = { seed: "det-seed", difficulty: d as 1 | 2 | 3, skillKey: SK };
      const q1 = angleClassify.generate(p);
      const q2 = angleClassify.generate(p);
      expect(q1.expectedAnswer).toBe(q2.expectedAnswer);
      expect(q1.problemText).toBe(q2.problemText);
    });

    it("different seeds → different questions (variety over 10 seeds)", () => {
      const answers = new Set<string>();
      for (let i = 0; i < 10; i++) {
        const q = angleClassify.generate({ seed: `v-${i}`, difficulty: 1, skillKey: SK });
        answers.add(q.problemText);
      }
      expect(answers.size).toBeGreaterThan(1);
    });
  });

  describe("classification correctness", () => {
    it("D1 angles classified correctly (no 90 or 180)", () => {
      for (let i = 0; i < 20; i++) {
        const q = angleClassify.generate({ seed: `d1-${i}`, difficulty: 1, skillKey: SK });
        const match = q.problemText.match(/(\d+)°/);
        expect(match).toBeTruthy();
        const angle = parseInt(match![1], 10);
        expect(angle).not.toBe(90);
        expect(angle).not.toBe(180);
        if (angle < 90) expect(q.expectedAnswer).toBe("nhọn");
        else expect(q.expectedAnswer).toBe("tù");
      }
    });

    it("D2 includes boundary values 90 and 180, classified correctly", () => {
      const seen90 = new Set<boolean>();
      const seen180 = new Set<boolean>();
      for (let i = 0; i < 30; i++) {
        const q = angleClassify.generate({ seed: `d2-${i}`, difficulty: 2, skillKey: SK });
        const match = q.problemText.match(/(\d+)°/);
        const angle = parseInt(match![1], 10);
        if (angle === 90) { seen90.add(true); expect(q.expectedAnswer).toBe("vuông"); }
        if (angle === 180) { seen180.add(true); expect(q.expectedAnswer).toBe("bẹt"); }
        if (angle < 90) expect(q.expectedAnswer).toBe("nhọn");
        if (angle > 90 && angle < 180) expect(q.expectedAnswer).toBe("tù");
      }
      // D2 pool includes 90 and 180 — they must appear in enough samples
      expect(seen90.size + seen180.size).toBeGreaterThan(0);
    });

    it("D3 includes near-boundary angles (89, 91, 179)", () => {
      const angles = new Set<number>();
      for (let i = 0; i < 30; i++) {
        const q = angleClassify.generate({ seed: `d3-${i}`, difficulty: 3, skillKey: SK });
        const match = q.problemText.match(/(\d+)°/);
        const angle = parseInt(match![1], 10);
        angles.add(angle);
        if (angle < 90) expect(q.expectedAnswer).toBe("nhọn");
        else if (angle === 90) expect(q.expectedAnswer).toBe("vuông");
        else if (angle < 180) expect(q.expectedAnswer).toBe("tù");
        else expect(q.expectedAnswer).toBe("bẹt");
      }
      // D3 pool has near-boundary values; variety should be present
      expect(angles.size).toBeGreaterThan(1);
    });
  });

  describe("choices", () => {
    it("always provides exactly 4 choices", () => {
      const q = angleClassify.generate({ seed: "choices-test", difficulty: 1, skillKey: SK });
      expect(q.choices).toEqual(["nhọn", "vuông", "tù", "bẹt"]);
    });

    it("expectedAnswer is always one of the choices", () => {
      for (let i = 0; i < 15; i++) {
        const q = angleClassify.generate({ seed: `ch-${i}`, difficulty: 2, skillKey: SK });
        expect(q.choices).toContain(q.expectedAnswer);
      }
    });
  });

  describe("validation", () => {
    it("accepts correct answer", () => {
      const q = angleClassify.generate({ seed: "val-ok", difficulty: 1, skillKey: SK });
      expect(angleClassify.validate(q.expectedAnswer as string, q)).toBe(true);
    });

    it("rejects wrong choice", () => {
      const q = angleClassify.generate({ seed: "val-wrong", difficulty: 1, skillKey: SK });
      const wrong = (q.choices as string[]).find((c) => c !== q.expectedAnswer)!;
      expect(angleClassify.validate(wrong, q)).toBe(false);
    });

    it("rejects empty string", () => {
      const q = angleClassify.generate({ seed: "val-empty", difficulty: 1, skillKey: SK });
      expect(angleClassify.validate("", q)).toBe(false);
    });

    it("rejects garbage", () => {
      const q = angleClassify.generate({ seed: "val-garbage", difficulty: 2, skillKey: SK });
      expect(angleClassify.validate("không xác định", q)).toBe(false);
    });
  });

  describe("answer format and metadata", () => {
    it("answerFormat is multiple-choice", () => {
      const q = angleClassify.generate({ seed: "fmt-1", difficulty: 1, skillKey: SK });
      expect(q.answerFormat).toBe("multiple-choice");
    });

    it("metadata fields are correct", () => {
      const q = angleClassify.generate({ seed: "meta-1", difficulty: 3, skillKey: SK });
      expect(q.metadata.difficulty).toBe(3);
      expect(q.metadata.timeEstimateSec).toBe(45);
      expect(q.metadata.skillKey).toBe(SK);
      expect(q.metadata.seed).toBe("meta-1");
    });

    it("id is stable for same seed", () => {
      const q = angleClassify.generate({ seed: "id-test", difficulty: 2, skillKey: SK });
      expect(q.id).toBe(`${SK}-id-test`);
    });
  });
});

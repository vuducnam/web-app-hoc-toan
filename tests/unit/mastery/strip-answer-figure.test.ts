import { describe, it, expect } from "vitest";
import { stripAnswer } from "@/lib/mastery/strip-answer";
import type { Question } from "@/lib/generators/types";

describe("stripAnswer — figure handling", () => {
  it("drops solutionFigure but keeps figure", () => {
    const q: Question<number> = {
      id: "x",
      skillKey: "test",
      problemText: "P",
      answerFormat: "numeric",
      expectedAnswer: 12,
      explanation: "E",
      figure: { kind: "triangle", base: 5, height: 4, unit: "cm" },
      solutionFigure: { kind: "triangle", base: 5, height: 4, unit: "cm", shaded: true },
      metadata: { difficulty: 1, seed: "s", skillKey: "test", timeEstimateSec: 60 },
    };

    const safe = stripAnswer(q);

    expect(safe.figure).toEqual({ kind: "triangle", base: 5, height: 4, unit: "cm" });
    expect((safe as Record<string, unknown>).solutionFigure).toBeUndefined();
    expect((safe as Record<string, unknown>).expectedAnswer).toBeUndefined();
    expect((safe as Record<string, unknown>).explanation).toBeUndefined();
  });

  it("preserves Question without any figure fields", () => {
    const q: Question<number> = {
      id: "x",
      skillKey: "test",
      problemText: "P",
      answerFormat: "numeric",
      expectedAnswer: 1,
      metadata: { difficulty: 1, seed: "s", skillKey: "test", timeEstimateSec: 60 },
    };
    const safe = stripAnswer(q);
    expect(safe.figure).toBeUndefined();
    expect(safe.problemText).toBe("P");
  });
});

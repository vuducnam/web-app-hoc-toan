import { describe, it, expect } from "vitest";
import { buildChoices, resolveFamily } from "@/lib/exam/distractors";
import { makeRng } from "@/lib/generators/seeded-rng";

describe("resolveFamily", () => {
  it.each([
    ["decimal-add", "decimals"],
    ["decimal-multiply", "decimals"],
    ["fraction-add", "fractions"],
    ["fraction-divide", "fractions"],
    ["percent-of-whole", "percent"],
    ["word-percent", "word-problems"],
    ["triangle-area", "geometry"],
    ["circle-circumference-area", "geometry"],
    ["length-conversion", "unit-conversion"],
    ["area-unit-conversion", "unit-conversion"],
    ["add-sub-100k-carry", "arithmetic"],
    ["multiply-2-digit", "arithmetic"],
    ["even-odd", "arithmetic"],
    ["unknown-skill-xyz", "fallback"],
  ])("%s → %s", (skill, expected) => {
    expect(resolveFamily(skill)).toBe(expected);
  });
});

describe("buildChoices", () => {
  it("returns 4 unique labeled choices", () => {
    const rng = makeRng("seed-1");
    const r = buildChoices("12.5", "decimal-add", rng);
    expect(r.choices).toHaveLength(4);
    const labels = r.choices.map((c) => c.label);
    expect(labels).toEqual(["A", "B", "C", "D"]);
    const values = r.choices.map((c) => c.value);
    expect(new Set(values).size).toBe(4);
  });

  it("includes correct answer at correctIndex", () => {
    const rng = makeRng("seed-1");
    const r = buildChoices("12.5", "decimal-add", rng);
    expect(r.choices[r.correctIndex].value).toBe("12.5");
  });

  it("is deterministic for same seed", () => {
    const r1 = buildChoices("12.5", "decimal-add", makeRng("xyz"));
    const r2 = buildChoices("12.5", "decimal-add", makeRng("xyz"));
    expect(r1.choices).toEqual(r2.choices);
    expect(r1.correctIndex).toBe(r2.correctIndex);
  });

  it("differs across seeds for at least some pair", () => {
    const seeds = ["a", "b", "c", "d", "e"];
    const results = seeds.map((s) => buildChoices("12.5", "decimal-add", makeRng(s)));
    const allSame = results.every(
      (r) => r.correctIndex === results[0].correctIndex
        && r.choices.every((c, i) => c.value === results[0].choices[i].value),
    );
    expect(allSame).toBe(false);
  });

  it("handles fraction format", () => {
    const r = buildChoices("3/4", "fraction-add", makeRng("frac"));
    expect(r.choices).toHaveLength(4);
    const values = r.choices.map((c) => c.value);
    expect(values).toContain("3/4");
    expect(new Set(values).size).toBe(4);
  });

  it("handles arithmetic integer", () => {
    const r = buildChoices("12345", "add-sub-100k-carry", makeRng("arith"));
    expect(r.choices).toHaveLength(4);
    const values = r.choices.map((c) => c.value);
    expect(values).toContain("12345");
    expect(new Set(values).size).toBe(4);
  });

  it("handles geometry decimal answer", () => {
    const r = buildChoices("18.5", "triangle-area", makeRng("geo"));
    expect(r.choices).toHaveLength(4);
    expect(r.choices.map((c) => c.value)).toContain("18.5");
  });

  it("handles percent answer", () => {
    const r = buildChoices("12", "percent-of-whole", makeRng("pc"));
    expect(r.choices).toHaveLength(4);
    expect(r.choices.map((c) => c.value)).toContain("12");
  });
});

import { describe, it, expect } from "vitest";
import { compareAnswer } from "@/lib/exam/compare-answer";
import type { MCChoice } from "@/lib/exam/distractors/types";

describe("compareAnswer - NUMERIC", () => {
  it("accepts identical decimal", () => {
    expect(compareAnswer("12.5", "12.5", "NUMERIC")).toBe(true);
  });

  it("accepts comma-as-decimal", () => {
    expect(compareAnswer("12,5", "12.5", "NUMERIC")).toBe(true);
  });

  it("accepts trailing zero", () => {
    expect(compareAnswer("12.50", "12.5", "NUMERIC")).toBe(true);
  });

  it("accepts whitespace", () => {
    expect(compareAnswer("  12.5  ", "12.5", "NUMERIC")).toBe(true);
  });

  it("rejects different number", () => {
    expect(compareAnswer("12.4", "12.5", "NUMERIC")).toBe(false);
  });

  it("rejects empty answer", () => {
    expect(compareAnswer("", "12", "NUMERIC")).toBe(false);
    expect(compareAnswer(null, "12", "NUMERIC")).toBe(false);
    expect(compareAnswer(undefined, "12", "NUMERIC")).toBe(false);
  });

  it("falls back to string compare for non-numeric strings", () => {
    expect(compareAnswer("12 dư 3", "12 dư 3", "NUMERIC")).toBe(true);
    expect(compareAnswer("12 dư 4", "12 dư 3", "NUMERIC")).toBe(false);
  });

  it("tolerates tiny floating-point differences", () => {
    expect(compareAnswer("3.140", "3.14", "NUMERIC")).toBe(true);
    expect(compareAnswer("3.14", "3.20", "NUMERIC")).toBe(false);
  });
});

describe("compareAnswer - MC", () => {
  const choices: MCChoice[] = [
    { label: "A", value: "12.5" },
    { label: "B", value: "1.25" },
    { label: "C", value: "125" },
    { label: "D", value: "0.125" },
  ];

  it("accepts label that resolves to expected value", () => {
    expect(compareAnswer("A", "12.5", "MC", choices)).toBe(true);
  });

  it("accepts lowercase label", () => {
    expect(compareAnswer("a", "12.5", "MC", choices)).toBe(true);
  });

  it("rejects wrong label", () => {
    expect(compareAnswer("B", "12.5", "MC", choices)).toBe(false);
  });

  it("accepts direct value match", () => {
    expect(compareAnswer("12.5", "12.5", "MC", choices)).toBe(true);
  });

  it("rejects empty MC answer", () => {
    expect(compareAnswer("", "12.5", "MC", choices)).toBe(false);
  });
});

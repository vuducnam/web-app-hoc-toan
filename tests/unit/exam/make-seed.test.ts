import { describe, it, expect } from "vitest";
import { makeSeed } from "@/lib/exam/make-seed";

describe("makeSeed", () => {
  it("is deterministic for same inputs", () => {
    const a = makeSeed("student1", "paper1", 1);
    const b = makeSeed("student1", "paper1", 1);
    expect(a).toBe(b);
    expect(a).toHaveLength(16);
  });

  it("differs for different student", () => {
    expect(makeSeed("a", "p", 1)).not.toBe(makeSeed("b", "p", 1));
  });

  it("differs for different paper", () => {
    expect(makeSeed("a", "p1", 1)).not.toBe(makeSeed("a", "p2", 1));
  });

  it("differs for different attempt number", () => {
    expect(makeSeed("a", "p", 1)).not.toBe(makeSeed("a", "p", 2));
  });

  it("returns hex characters only", () => {
    const s = makeSeed("xyz", "abc", 5);
    expect(s).toMatch(/^[0-9a-f]{16}$/);
  });
});

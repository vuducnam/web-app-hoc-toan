// Regression test for Phase 12.5 bugfix:
//   * Bug #1 — practice actions used Skill.key instead of Skill.generatorKey for registry lookup
//   * Bug #2 — many seed generatorKey values were missing from STUB_KEYS, causing
//     getGenerator to throw "Unknown generator" instead of returning a stub
// This test walks the seed data tree, collects every distinct generatorKey,
// and asserts each one resolves through getGenerator() without throwing
// at LOOKUP time. (Stub generators legitimately throw at GENERATE time;
// that is verified separately.)

import { describe, it, expect } from "vitest";
import { grade4 } from "../../../prisma/seed-data/grade-4";
import { grade5 } from "../../../prisma/seed-data/grade-5";
import { GENERATORS, getGenerator } from "@/lib/generators/registry";
import type { SeedGrade, SeedSkill } from "../../../prisma/seed-data/types";

function collectGeneratorKeys(grade: SeedGrade): string[] {
  const keys: string[] = [];
  for (const v of grade.volumes) {
    for (const t of v.topics) {
      for (const l of t.lessons) {
        for (const s of l.skills as SeedSkill[]) {
          if ("generatorKey" in s && s.generatorKey != null) {
            keys.push(s.generatorKey);
          }
        }
      }
    }
  }
  return keys;
}

describe("registry matches seed data", () => {
  const seedKeys = Array.from(
    new Set([...collectGeneratorKeys(grade4), ...collectGeneratorKeys(grade5)]),
  ).sort();

  it("collects at least 40 distinct seed generatorKeys", () => {
    expect(seedKeys.length).toBeGreaterThanOrEqual(40);
  });

  it.each(seedKeys)("registry resolves seed generatorKey %s", (key) => {
    expect(() => getGenerator(key)).not.toThrow();
    expect(GENERATORS[key]).toBeDefined();
  });

  it("every registered generator key is unique", () => {
    const keys = Object.keys(GENERATORS);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

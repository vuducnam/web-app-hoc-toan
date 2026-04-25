import { describe, it } from "vitest";

describe.skip("registry-matches-seed integration test", () => {
  // TODO: Phase 12 integration test — requires:
  // 1. Set up test database via DATABASE_URL_TEST env var
  // 2. Run prisma migrate reset --force against test DB
  // 3. Load all skills from DB via prisma.skill.findMany()
  // 4. For each skill with generatorKey != null:
  //    - Call getGenerator(skill.generatorKey) from registry
  //    - Assert: lookup succeeds (no throw), returns a Generator instance
  // 5. Assert: all skills in seed data are in GENERATORS registry
  //
  // Motivation: Ensure no generator mismatch between seed data + registry code
  //
  // Blockers: Same as submit-answer test — Vitest + Prisma ESM client wiring
  // Status: Placeholder for MVP. Full test in Phase 13.

  it("skipped — wiring incomplete", () => {
    // Placeholder test
  });
});

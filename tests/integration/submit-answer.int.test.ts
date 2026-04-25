import { describe, it } from "vitest";

describe.skip("submitAnswerCore integration test", () => {
  // TODO: Phase 12 integration test — requires:
  // 1. Set up test database via DATABASE_URL_TEST env var (use schema=test suffix)
  // 2. Run prisma migrate reset --force against test DB
  // 3. Load test data (minimal seed)
  // 4. Create test user + find skill with generatorKey="add-sub-100k-carry"
  // 5. Call submitAnswerCore(userId, {skillKey, seed, difficulty, userAnswer, elapsedMs})
  // 6. Assert: Attempt row created, SkillProgress upserted, no expectedAnswer in response
  //
  // Blockers: Vitest + Prisma 7 ESM client + server-only imports require careful wiring
  // Mitigation: For MVP, accept this placeholder with clear TODO. Full integration test
  // can be completed in Phase 13 when patterns are established.

  it("skipped — wiring incomplete", () => {
    // Placeholder test
  });
});

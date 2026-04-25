// Smoke test: generate a sample attempt for each of the 8 papers and verify no throw.
import "dotenv/config";

// Mock 'server-only' before any other imports
import Module from "node:module";
const origResolve = Module.prototype.require;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(Module.prototype as any).require = function (id: string) {
  if (id === "server-only") return {};
  // eslint-disable-next-line prefer-rest-params
  return origResolve.apply(this, arguments as never);
};

async function main() {
  const { prisma } = await import("../src/lib/prisma");
  const { generateAttempt } = await import("../src/lib/exam/generate-attempt");
  const { makeSeed } = await import("../src/lib/exam/make-seed");
  const { GENERATORS, LIVE_GENERATOR_KEYS } = await import("../src/lib/generators/registry");

  const liveRegistry: Record<string, (typeof GENERATORS)[string]> = {};
  for (const k of LIVE_GENERATOR_KEYS) liveRegistry[k] = GENERATORS[k];

  const papers = await prisma.examPaper.findMany();
  console.log(`Loaded ${papers.length} papers`);

  let totalQ = 0;
  let totalErr = 0;
  for (const paper of papers) {
    const seed = makeSeed("smoke-student", paper.id, 1);
    try {
      const qs = generateAttempt({
        examPaperId: paper.id,
        // structure stored as JSON; cast for engine
        structure: paper.structure as never,
        seed,
        registry: liveRegistry,
      });
      totalQ += qs.length;
      console.log(`OK ${paper.key} (${qs.length} questions)`);
      // Verify each question has a non-empty text and expectedAnswer
      for (const q of qs) {
        if (!q.questionText || !q.expectedAnswer) {
          throw new Error(`Empty fields in slot ${q.slotNo}`);
        }
        if (q.questionType === "MC" && (!q.choices || q.choices.length !== 4)) {
          throw new Error(`MC slot ${q.slotNo} has wrong choice count`);
        }
      }
    } catch (e) {
      console.error(`FAIL ${paper.key}:`, (e as Error).message);
      totalErr++;
    }
  }
  console.log(`Total Qs generated: ${totalQ}, errors: ${totalErr}`);
  await prisma.$disconnect();
  process.exit(totalErr > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error("FATAL:", e);
  process.exit(2);
});

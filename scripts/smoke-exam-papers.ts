// Smoke test: verify all examPaper skillPools contain live generator keys.
// Reads registry.ts as text to avoid pulling in 'server-only'.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { examPaperSeeds } from "../prisma/seed-data/exam-papers";

const registrySrc = readFileSync(
  join(process.cwd(), "src/lib/generators/registry.ts"),
  "utf-8",
);
const liveBlock = registrySrc.match(/const liveGenerators: Record<string, Generator> = \{([\s\S]*?)^\};/m);
if (!liveBlock) {
  console.error("Could not parse liveGenerators block");
  process.exit(2);
}
const liveKeys = new Set<string>();
for (const m of liveBlock[1].matchAll(/"([\w-]+)":/g)) {
  liveKeys.add(m[1]);
}
console.log("Live generator keys:", liveKeys.size);

let bad = 0;
for (const p of examPaperSeeds) {
  for (const s of p.structure) {
    for (const k of s.skillPool) {
      if (!liveKeys.has(k)) {
        console.log("MISSING:", p.key, "slot", s.slotNo, k);
        bad++;
      }
    }
  }
  const sum = p.structure.reduce((acc, x) => acc + x.pointWeight, 0);
  console.log(`${p.key}: ${p.structure.length} slots, points=${sum.toFixed(2)}`);
}
console.log("Total missing skillPool entries:", bad);
process.exit(bad > 0 ? 1 : 0);

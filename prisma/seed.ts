// Idempotent curriculum seed — runs via `npm run db:seed`
// Strategy: upsert by natural key for Grade/Skill/Badge;
//           find-or-create by (parentId + order) for Volume/Topic/Lesson
// Safe to re-run: second run produces zero new rows.

// Load .env before prisma client initializes (tsx runs outside Next.js env loader)
import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { Prisma } from "../src/generated/prisma/client";
import { grade4 } from "./seed-data/grade-4";
import { grade5 } from "./seed-data/grade-5";
import { badges } from "./seed-data/badges";
import { examPaperSeeds } from "./seed-data/exam-papers";
import type { SeedGrade, SeedVolume, SeedTopic, SeedLesson, SeedSkill } from "./seed-data/types";

// ---------------------------------------------------------------------------
// Upsert helpers — Volume/Topic/Lesson use find-or-create by positional key
// ---------------------------------------------------------------------------

async function upsertVolume(gradeId: string, v: SeedVolume) {
  const existing = await prisma.volume.findFirst({
    where: { gradeId, order: v.order },
  });
  if (existing) {
    return prisma.volume.update({
      where: { id: existing.id },
      data: { name: v.name },
    });
  }
  return prisma.volume.create({
    data: { gradeId, order: v.order, name: v.name },
  });
}

async function upsertTopic(volumeId: string, t: SeedTopic) {
  const existing = await prisma.topic.findFirst({
    where: { volumeId, order: t.order },
  });
  if (existing) {
    return prisma.topic.update({
      where: { id: existing.id },
      data: { nameVi: t.nameVi },
    });
  }
  return prisma.topic.create({
    data: { volumeId, order: t.order, nameVi: t.nameVi },
  });
}

async function upsertLesson(topicId: string, l: SeedLesson) {
  const existing = await prisma.lesson.findFirst({
    where: { topicId, order: l.order },
  });
  const noteData = {
    knowledgeNoteRemember:  l.knowledgeNoteRemember  ?? null,
    knowledgeNoteCaution:   l.knowledgeNoteCaution   ?? null,
    knowledgeNoteExtension: l.knowledgeNoteExtension ?? null,
  };
  if (existing) {
    return prisma.lesson.update({
      where: { id: existing.id },
      data: { nameVi: l.nameVi, ...noteData },
    });
  }
  return prisma.lesson.create({
    data: { topicId, order: l.order, nameVi: l.nameVi, ...noteData },
  });
}

// Runtime assertion: every skill must have exactly one of generatorKey/poolKey
function assertSkillKeyXor(skill: SeedSkill): void {
  const hasGen = "generatorKey" in skill && skill.generatorKey != null;
  const hasPool = "poolKey" in skill && skill.poolKey != null;
  if (hasGen === hasPool) {
    throw new Error(
      `Skill "${skill.key}" must have exactly one of generatorKey or poolKey (XOR). ` +
        `Got generatorKey=${String((skill as Record<string, unknown>).generatorKey)}, ` +
        `poolKey=${String((skill as Record<string, unknown>).poolKey)}`
    );
  }
}

async function upsertSkill(lessonId: string, s: SeedSkill) {
  assertSkillKeyXor(s);

  const data = {
    lessonId,
    nameVi: s.nameVi,
    answerFormat: s.answerFormat,
    timeEstimateSec: s.timeEstimateSec,
    generatorKey: "generatorKey" in s ? (s.generatorKey ?? null) : null,
    poolKey: "poolKey" in s ? (s.poolKey ?? null) : null,
  };

  return prisma.skill.upsert({
    where: { key: s.key },
    create: { key: s.key, ...data },
    update: data,
  });
}

// ---------------------------------------------------------------------------
// Grade seeder — orchestrates Volume → Topic → Lesson → Skill
// ---------------------------------------------------------------------------

async function seedGrade(g: SeedGrade): Promise<{ skills: number }> {
  const grade = await prisma.grade.upsert({
    where: { key: g.key },
    create: { key: g.key, name: g.name },
    update: { name: g.name },
  });

  let skillCount = 0;

  for (const v of g.volumes) {
    const volume = await upsertVolume(grade.id, v);

    for (const t of v.topics) {
      const topic = await upsertTopic(volume.id, t);

      for (const l of t.lessons) {
        const lesson = await upsertLesson(topic.id, l);

        for (const s of l.skills) {
          await upsertSkill(lesson.id, s);
          skillCount++;
        }
      }
    }
  }

  return { skills: skillCount };
}

// ---------------------------------------------------------------------------
// Exam paper seeder - 8 standardized papers for G4+G5
// ---------------------------------------------------------------------------

async function seedExamPapers(): Promise<number> {
  let count = 0;
  for (const paper of examPaperSeeds) {
    const grade = await prisma.grade.findUnique({ where: { key: paper.gradeKey } });
    if (!grade) {
      throw new Error(`Grade not found for key=${paper.gradeKey}`);
    }
    // Validate every skillPool entry has a Skill row with a generatorKey
    for (const slot of paper.structure) {
      const skills = await prisma.skill.findMany({
        where: { generatorKey: { in: slot.skillPool } },
        select: { generatorKey: true },
      });
      const found = new Set(skills.map((s) => s.generatorKey));
      const missing = slot.skillPool.filter((k) => !found.has(k));
      if (missing.length > 0) {
        throw new Error(
          `ExamPaper "${paper.key}" slot ${slot.slotNo}: skills not in DB: ${missing.join(", ")}`,
        );
      }
    }
    // Verify pointWeight sum equals totalPoints (allow 0.01 rounding tolerance)
    const sum = paper.structure.reduce((s, x) => s + x.pointWeight, 0);
    if (Math.abs(sum - paper.totalPoints) > 0.01) {
      throw new Error(
        `ExamPaper "${paper.key}" pointWeight sum=${sum} != totalPoints=${paper.totalPoints}`,
      );
    }
    const data = {
      key: paper.key,
      gradeId: grade.id,
      examType: paper.examType,
      nameVi: paper.nameVi,
      durationMinutes: paper.durationMinutes,
      totalQuestions: paper.totalQuestions,
      totalPoints: paper.totalPoints,
      structure: paper.structure as unknown as Prisma.InputJsonValue,
      isActive: true,
    };
    await prisma.examPaper.upsert({
      where: { key: paper.key },
      create: data,
      update: data,
    });
    count++;
  }
  return count;
}

// ---------------------------------------------------------------------------
// Badge seeder
// ---------------------------------------------------------------------------

async function seedBadges(): Promise<number> {
  let count = 0;
  for (const b of badges) {
    await prisma.badge.upsert({
      where: { key: b.key },
      create: {
        key: b.key,
        nameVi: b.nameVi,
        descVi: b.descVi,
        tier: b.tier,
        category: b.category,
        // Cast: SeedBadge.criteria is Record<string,unknown>; Prisma Json accepts this at runtime
        criteria: b.criteria as Prisma.InputJsonValue,
      },
      update: {
        nameVi: b.nameVi,
        descVi: b.descVi,
        tier: b.tier,
        category: b.category,
        criteria: b.criteria as Prisma.InputJsonValue,
      },
    });
    count++;
  }
  return count;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("Seeding curriculum...");

  const g4Result = await seedGrade(grade4);
  console.log(`  Grade 4: ${g4Result.skills} skills seeded`);

  const g5Result = await seedGrade(grade5);
  console.log(`  Grade 5: ${g5Result.skills} skills seeded`);

  const totalSkills = g4Result.skills + g5Result.skills;
  console.log(`  Total skills: ${totalSkills}`);

  const badgeCount = await seedBadges();
  console.log(`  Badges: ${badgeCount} seeded`);

  const examPaperCount = await seedExamPapers();
  console.log(`  Exam papers: ${examPaperCount} seeded`);

  // Verify counts from DB
  const dbSkillCount = await prisma.skill.count();
  const dbBadgeCount = await prisma.badge.count();
  const dbExamCount = await prisma.examPaper.count();
  console.log(`\nDB verification:`);
  console.log(`  Skills in DB: ${dbSkillCount}`);
  console.log(`  Badges in DB: ${dbBadgeCount}`);
  console.log(`  Exam papers in DB: ${dbExamCount}`);

  if (dbBadgeCount !== 16) {
    throw new Error(`Expected 16 badges, got ${dbBadgeCount}`);
  }
  if (dbSkillCount < 50 || dbSkillCount > 100) {
    throw new Error(
      `Expected 50-100 skills, got ${dbSkillCount}. Check seed data.`
    );
  }
  if (dbExamCount !== 8) {
    throw new Error(`Expected 8 exam papers, got ${dbExamCount}`);
  }

  console.log("\nSeed complete.");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

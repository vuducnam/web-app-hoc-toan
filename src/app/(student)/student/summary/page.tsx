// Summary page — RSC. Shown after a 10-question practice session.
// Session boundary: last 10 attempts for (userId, skillKey) ordered desc by createdAt.
// No sessionId column added to schema (KISS — MVP sessions are always 10 questions).
import { redirect } from "next/navigation";
import Link from "next/link";
import { verifyStudent } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { SummaryHeader } from "@/components/summary/summary-header";
import { XpEarnedCard } from "@/components/summary/xp-earned-card";
import { MasteryDiffList } from "@/components/summary/mastery-diff-list";
import { BadgesEarnedList } from "@/components/summary/badges-earned-list";
import type { MasteryLevel } from "@/components/ui/mastery-pill";

interface Props {
  searchParams: Promise<{ skillKey?: string; sessionId?: string }>;
}

export const metadata = { title: "Kết quả — Toán SGK" };

export default async function SummaryPage({ searchParams }: Props) {
  const { skillKey } = await searchParams;

  // Guard: must have a skillKey
  if (!skillKey) redirect("/student");

  const user = await verifyStudent();

  // Load skill name + last 10 attempts in parallel
  const [skill, attempts, skillProgress] = await Promise.all([
    prisma.skill.findUnique({
      where: { key: skillKey },
      select: { nameVi: true },
    }),
    prisma.attempt.findMany({
      where: { userId: user.id, skillKey },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { correct: true },
    }),
    prisma.skillProgress.findUnique({
      where: { userId_skillKey: { userId: user.id, skillKey } },
      select: { masteryLevel: true },
    }),
  ]);

  // Skill not found in curriculum → back to dashboard
  if (!skill) redirect("/student");

  const total = attempts.length;
  const correct = attempts.filter((a) => a.correct).length;
  const masteryLevel = (skillProgress?.masteryLevel ?? "NOT_STARTED") as MasteryLevel;

  return (
    <div className="max-w-md mx-auto space-y-6 py-6">
      {/* Page heading */}
      <h2 className="text-center font-display font-bold text-2xl text-ink-900">
        Kết quả
      </h2>

      {/* Score */}
      <SummaryHeader correct={correct} total={total} skillName={skill.nameVi} />

      {/* XP earned today */}
      <XpEarnedCard userId={user.id} />

      {/* Mastery level */}
      <MasteryDiffList skillName={skill.nameVi} masteryLevel={masteryLevel} />

      {/* Badges earned this session (last hour heuristic) */}
      <BadgesEarnedList userId={user.id} />

      {/* CTA */}
      <div className="flex justify-center pt-2">
        <Link
          href="/student"
          className="inline-flex items-center px-8 py-3 rounded-xl bg-brand-500 text-white font-display font-semibold shadow-chunky-brand hover:bg-brand-700 transition-colors active:translate-y-[3px] active:shadow-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sun-500"
        >
          Tiếp tục học
        </Link>
      </div>
    </div>
  );
}

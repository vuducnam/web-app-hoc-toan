// Student route group layout — persistent shell with header.
// verifyStudent() handles the auth redirect; layout itself does not redirect
// (per Next.js authentication docs: layouts should not gate access themselves).
import { prisma } from "@/lib/prisma";
import { verifyStudent } from "@/lib/dal";
import { StudentHeader } from "@/components/student/student-header";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await verifyStudent();

  // Load XP and streak in parallel — non-blocking if either is missing
  const [xpResult, streak] = await Promise.all([
    prisma.dailyGoal.aggregate({
      _sum: { xpEarned: true },
      where: { userId: user.id },
    }),
    prisma.streak.findUnique({ where: { userId: user.id } }),
  ]);

  const totalXp = xpResult._sum.xpEarned ?? 0;
  const streakDays = streak?.currentDays ?? 0;

  return (
    <div className="theme-student min-h-screen">
      <StudentHeader
        totalXp={totalXp}
        streakDays={streakDays}
      />
      <main className="max-w-5xl mx-auto px-4 py-6 pb-20">
        {children}
      </main>
    </div>
  );
}

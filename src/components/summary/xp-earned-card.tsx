// xp-earned-card.tsx — server component.
// Reads today's DailyGoal xpEarned for the user and displays it.
// Falls back to computing XP from attempt count when no DailyGoal row exists (MVP).
import { prisma } from "@/lib/prisma";

interface XpEarnedCardProps {
  userId: string;
}

/** Displays "Điểm kinh nghiệm" earned today from DailyGoal row */
export async function XpEarnedCard({ userId }: XpEarnedCardProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dailyGoal = await prisma.dailyGoal.findUnique({
    where: { userId_date: { userId, date: today } },
    select: { xpEarned: true },
  });

  const xp = dailyGoal?.xpEarned ?? 0;

  return (
    <div className="bg-sun-300 rounded-2xl shadow-chunky-sun border border-sun-500 px-6 py-5 text-center">
      <p className="font-display font-semibold text-sm text-sun-700 mb-1">
        Điểm kinh nghiệm
      </p>
      <p className="font-display font-bold text-4xl text-sun-700 tabular-nums">
        +{xp}
      </p>
      <p className="text-xs text-sun-700 mt-1 opacity-80">XP hôm nay</p>
    </div>
  );
}

// badges-earned-list.tsx — server component.
// Loads UserBadge rows earned in the last hour for the user (session heuristic).
// Renders a simple list with badge name + description in Vietnamese.
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/ui/cn";

interface BadgesEarnedListProps {
  userId: string;
}

const TIER_STYLES: Record<string, string> = {
  gold: "bg-tier-gold text-ink-900",
  silver: "bg-tier-silver text-ink-900",
  bronze: "bg-tier-bronze text-white",
};

/** Lists badges earned within the last hour (session heuristic).
 * Async server component — Date.now() is fine here, runs at request time. */
export async function BadgesEarnedList({ userId }: BadgesEarnedListProps) {
  // eslint-disable-next-line react-hooks/purity
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const recentBadges = await prisma.userBadge.findMany({
    where: {
      userId,
      earnedAt: { gte: oneHourAgo },
    },
    include: {
      badge: { select: { nameVi: true, descVi: true, tier: true } },
    },
    orderBy: { earnedAt: "desc" },
  });

  if (recentBadges.length === 0) return null;

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-ink-400 uppercase tracking-wide">
        Huy hiệu đã giành
      </p>
      <ul className="space-y-2" aria-label="Huy hiệu mới">
        {recentBadges.map(({ id, badge }) => {
          const tierClass = TIER_STYLES[badge.tier] ?? "bg-mastery-1 text-ink-900";
          return (
            <li
              key={id}
              className="flex items-start gap-3 bg-paper rounded-xl border border-brand-100 px-4 py-3 shadow-flat"
            >
              {/* Tier badge dot */}
              <span
                aria-hidden="true"
                className={cn(
                  "mt-0.5 shrink-0 w-3 h-3 rounded-full",
                  tierClass
                )}
              />
              <div className="min-w-0">
                <p className="font-display font-semibold text-sm text-ink-900 truncate">
                  {badge.nameVi}
                </p>
                <p className="text-xs text-ink-600 leading-snug mt-0.5">
                  {badge.descVi}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

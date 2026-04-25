"use client";
// Persistent top bar for student shell.
// Mimi emotion from Zustand (client); XP + streak from server props.
import { MimiSVG } from "@/components/mimi/mimi-svg";
import { XPCounter } from "@/components/ui/xp-counter";
import { StreakFlame } from "@/components/ui/streak-flame";
import { useMascot } from "@/stores/mascot-store";
import { signOutUser } from "@/app/actions/auth-signout";

interface StudentHeaderProps {
  totalXp: number;
  streakDays: number;
}

export function StudentHeader({ totalXp, streakDays }: StudentHeaderProps) {
  const emotion = useMascot((s) => s.emotion);

  return (
    <header className="sticky top-0 z-30 bg-paper/90 backdrop-blur-sm border-b border-brand-100">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        {/* Left: Mimi + app title */}
        <div className="flex items-center gap-2 min-w-0">
          <MimiSVG state={emotion} size={40} className="shrink-0" />
          <span className="font-display font-bold text-lg text-brand-700 hidden sm:block truncate">
            Toán SGK
          </span>
        </div>

        {/* Right: XP, streak, signout */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-white rounded-full px-3 py-1.5 shadow-[0_3px_0_0_rgb(0_0_0/.10)]">
            <XPCounter value={totalXp} className="text-sm" />
          </div>
          <div className="bg-white rounded-full px-3 py-1.5 shadow-[0_3px_0_0_rgb(0_0_0/.10)]">
            <StreakFlame days={streakDays} className="text-sm" />
          </div>
          {/* Sign-out — form action for progressive enhancement */}
          <form action={signOutUser}>
            <button
              type="submit"
              className="min-h-[40px] min-w-[40px] px-3 py-1.5 rounded-xl text-sm font-semibold text-ink-600 hover:bg-brand-50 hover:text-brand-700 transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sun-500"
              aria-label="Đăng xuất"
            >
              <span className="hidden sm:inline">Đăng xuất</span>
              <span className="sm:hidden" aria-hidden="true">✕</span>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}

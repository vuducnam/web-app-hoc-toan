---
title: "Phase 09 — Student Feedback Overlay + Session Summary"
priority: P2
effort: 4h
status: completed
depends_on: [06, 08]
completed: 2026-04-24
---

# Phase 09 — Student Feedback Overlay + Session Summary

## Context Links
- Wireframes: `docs/wireframe/student-feedback-correct.html`, `docs/wireframe/student-feedback-wrong.html`, `docs/wireframe/student-summary.html`
- `UX_DECISIONS.md` — asymmetric celebration (principle 1), encouraging copy (principle 2)
- `docs/design-guidelines.md` §4 — `EncouragingToast`, `XPRing`, `MasteryPill`, `BadgeCard`
- Research: `docs/research/researcher-child-safe-gamification.md` §1 — no red "WRONG", no Duo-sad guilt

## Overview
Two visual layers:
1. **Inline feedback overlay** (extends Phase 08 stub) — appears briefly after each submit.
2. **Session summary page** (`/student/summary`) — end-of-10 recap with XP earned, mastery diff, badges unlocked.

## Key Insights
- **Correct = big.** Confetti (canvas-confetti, already installed), `bounce-in` animation on MathDisplay, random phrase from 6-pool, Mimi `cheering` for 400ms then `happy`.
- **Wrong = small.** Gentle shake (300ms), Mimi `sad` for 800ms then returns to `idle`, toast from 5-phrase wrong pool. NO red banner. NO correct-answer reveal after single fail.
- **Level-up = asymmetric boost.** If `leveledUp: true`, confetti burst becomes larger (2x particles), banner "Lên hạng! Thành thạo → Thuần thục" with `shadow-celebration` glow.
- **Summary** is informational, not gamified-pressure. Shows: correct / total, new XP, which skills moved bucket, badges earned. "Tiếp tục học" CTA back to dashboard.

## Requirements
**Functional:**
- Rewrite `feedback-overlay.tsx` from Phase 08 to full fidelity:
  - Accepts `{correct, leveledUp, newMasteryLevel, encouragementKey}` from `submitAnswer` response
  - Triggers confetti (correct only)
  - Triggers shake on the question card (wrong only — via `data-shake` attr)
  - Drives Mimi emotion transitions via `useMascot`
  - Shows `EncouragingToast` for 1.2s
  - On `leveledUp`: insert 800ms level-up banner before advancing
- `/student/summary?skillKey=K&session=S` — RSC:
  - Query Attempts for (userId, skillKey, session window) — need session id stored. Simplest: query last 10 attempts by timestamp for that skill.
  - Compute: itemsCorrect, itemsTotal, xpEarned (Phase 11 will compute; Phase 09 reads a stored value or recomputes in-line)
  - Show current mastery bucket with before/after arrow
  - Show any new UserBadges earned in session window
  - "Tiếp tục" → dashboard

**Non-functional:**
- Honor `prefers-reduced-motion` (already via globals.css) — confetti falls back to a static color flash (no movement).
- Confetti count ≤ 80 particles (battery/perf).

## Architecture
```
src/components/feedback/
├── feedback-overlay.tsx        # "use client" - full version replaces Phase 08 stub
├── confetti-burst.tsx          # client - wraps canvas-confetti with size prop
├── level-up-banner.tsx         # "Lên hạng!" with transitions
└── shake-attr.ts               # helper returns `data-shake` toggler

src/app/(student)/student/summary/
└── page.tsx                    # RSC

src/components/summary/
├── summary-header.tsx          # items correct / total big number
├── xp-earned-card.tsx
├── mastery-diff-list.tsx       # before -> after arrows
└── badges-earned-list.tsx      # new UserBadges this session
```

## Related Code Files
**Create:** all files above.

**Modify:**
- `src/components/practice/feedback-overlay.tsx` — REPLACES Phase 08 stub (same path).

## Implementation Steps
1. Replace `feedback-overlay.tsx` with full version:
   ```tsx
   "use client";
   export function FeedbackOverlay({state}: {state: Feedback | null}) {
     const setMimi = useMascot(s => s.set);
     useEffect(() => {
       if (!state) return;
       if (state.correct) { setMimi(state.leveledUp?"cheering":"happy"); burst(state.leveledUp?"large":"small"); }
       else { setMimi("sad"); triggerShake(); }
       const t = setTimeout(() => setMimi("idle"), state.correct?800:1000);
       return () => clearTimeout(t);
     }, [state]);
     // render EncouragingToast + optional LevelUpBanner
   }
   ```
2. Write `confetti-burst.tsx` using canvas-confetti; expose `burst(size: "small"|"large")`.
3. Write `level-up-banner.tsx` — absolute-positioned card with Vietnamese mastery label transition.
4. Wire `practice-session.tsx` (Phase 08) to pass `feedback` state + schedule advance-to-next on overlay complete.
5. Write `summary/page.tsx`:
   ```tsx
   export default async function SummaryPage({ searchParams }: { searchParams: Promise<{skillKey:string}>}) {
     const { skillKey } = await searchParams;
     const user = await verifyStudent();
     const attempts = await prisma.attempt.findMany({where:{userId:user.id,skillKey}, orderBy:{createdAt:"desc"}, take:10});
     // aggregate
     return <>...</>;
   }
   ```
6. Write `summary-header`, `xp-earned-card`, `mastery-diff-list`, `badges-earned-list` all as server components reading from DB.
7. Manual: play a session, observe overlay per answer, land on summary.

## Todo List
- [x] Full `feedback-overlay.tsx`
- [x] `confetti-burst.tsx` (small vs large)
- [x] `level-up-banner.tsx`
- [x] Wire practice-session → overlay → advance
- [x] Summary RSC page + 4 sub-components
- [x] Reduced-motion fallback verified

## Success Criteria
- [x] Correct answer → confetti + happy Mimi + random phrase (reload 2x → different phrases)
- [x] Wrong answer → shake + sad Mimi + no red banner
- [x] Level-up → larger confetti + banner visible for ~800ms
- [x] Summary shows 10 attempts aggregated, XP count, any leveled-up skills, badges earned
- [x] `prefers-reduced-motion: reduce` in devtools → no animation, only color change on correct
- [x] Typecheck green

## Risk Assessment
**R1 — Session boundary definition (Medium/Medium):** Phase 05 doesn't tag attempts with a session id, so summary page can't reliably pick exactly the last 10. *Mitigation:* Add `sessionId: String?` column to `Attempt` in a tiny phase-09 migration; client passes same UUID through practice session. Alternatively (KISS): summary queries `take: 10, orderBy: createdAt desc` — acceptable for MVP given sessions are always 10 questions. Choose the KISS path; document the limitation.

**R2 — Confetti package edge behavior with React 19 (Low/Low):** `canvas-confetti` works via imperative canvas API — no React deps. Safe.

## Rollback Plan
Swap the full overlay back to the Phase 08 stub if animations are janky — no DB or action change required.

## Next Steps
Student flow complete after this phase. Phase 10 builds the parallel parent flow; Phase 11 adds the gamification numbers that Summary displays.

## Completion Note
Full feedback overlay with confetti + level-up banner. Summary page at `/student/summary`. Correct answers show confetti + happy Mimi. Wrong answers show shake + sad Mimi. Level-up triggers `cheering` + larger confetti. Summary aggregates 10 attempts, shows XP/badges/mastery diffs.

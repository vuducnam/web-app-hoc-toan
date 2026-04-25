---
title: "Phase 10 — Parent Dashboard + Child Detail"
priority: P2
effort: 8h
status: completed
depends_on: [02, 05, 06]
completed: 2026-04-24
---

# Phase 10 — Parent Dashboard + Child Detail

## Context Links
- Wireframes: `docs/wireframe/parent-dashboard.html`, `docs/wireframe/parent-child-detail.html`
- `UX_DECISIONS.md` — 2 parent principles (visual separation + actionable)
- `docs/design-guidelines.md` §4 parent primitives, §5 parent column
- Research: `docs/research/researcher-child-safe-gamification.md` §7 — what parents SEE vs HIDE

## Overview
Parent-side flat/serious dashboard. Composite 0-100 rating, 4-factor breakdown (accuracy 40%, streak 20%, consistency 20%, mastery 20%). 7-day heatmap (Recharts or custom SVG). 30-day trend chart. Weak-skills top 3. Child detail = per-topic mastery + 30-day trend + recommendations. Recharts.

## Key Insights
- **Parent sees per child, not across children for MVP** — one parent → N students via `User.parentId` (Phase 01).
- **What to HIDE** per research §7: streak number, XP balance, per-problem accuracy, peer comparison. Show aggregates only.
- **Composite rating formula** (MVP):
  - accuracy: `correctAttempts / totalAttempts` × 40
  - streak (activity, not gamified number): days active in last 7 / 7 × 20
  - consistency: stddev of daily practice minutes (inverse-normalized) × 20
  - mastery: `sum(masteryLevel) / (skillCount * 3)` × 20
- **Actionable copy:** every card ends with a one-line nhận định (e.g., "Nên tập thêm phép chia.").

## Requirements
**Functional:**
- `/parent` — RSC:
  - `verifyParent()`
  - List children: `prisma.user.findMany({where:{parentId:user.id}})`
  - If 1 child: show dashboard directly; if multiple: show selector (grid of `ChildCard`s), each linking to `/parent/child/[id]`
  - Composite rating gauge (half-circle, brand-500 arc)
  - 4-factor mini-cards with numbers + arrow trend
  - 7-day heatmap (day-of-week × activity intensity, green scale)
  - Weak-skills list: top 3 skills sorted by `correctRatio asc, totalAttempts desc` (at least 3 attempts)
  - Recent sessions: last 5 Attempt batches
- `/parent/child/[id]` — deep view:
  - Per-topic mastery: list topics with `MasteryBar4` per topic
  - 30-day trend: Recharts line chart of daily `correctRatio` (or daily XP)
  - Recommendations: 3 concrete "Anh/Chị có thể gợi ý bạn ... tập ..." lines

**Non-functional:**
- `theme-parent` root; no coral, no chunky shadows, no Mimi.
- All copy formal ("Anh/Chị"), no emoji.
- Recharts is SSR-friendly with `dynamic(..., {ssr:false})` for the actual chart; wrapping components are server.

## Architecture
```
src/app/(parent)/
├── layout.tsx                        # verifyParent(), renders theme-parent shell
└── parent/
    ├── page.tsx                      # dashboard RSC
    └── child/[id]/page.tsx           # child detail RSC

src/components/parent/
├── parent-header.tsx                 # simple: "Chào Anh/Chị", signout
├── composite-rating-gauge.tsx        # server component with client chart inner
├── rating-factor-card.tsx            # 1 of 4 factors
├── weekly-heatmap.tsx                # "use client" if using Recharts; or custom SVG (preferred - KISS)
├── weak-skills-list.tsx              # server
├── recent-sessions-list.tsx          # server
├── child-selector-grid.tsx           # server
├── per-topic-mastery-list.tsx        # server
├── monthly-trend-chart.tsx           # "use client" - Recharts LineChart
└── recommendations-list.tsx          # server - string templates

src/lib/parent/
├── compute-composite-rating.ts       # pure function, 4 factors
├── compute-weak-skills.ts            # SkillProgress -> top-3
├── compute-weekly-heatmap.ts         # Attempts -> 7-day activity[]
└── compose-recommendations.ts        # rule-based Vietnamese templates
```

## Related Code Files
**Create:** all files above.

**Modify:**
- `src/components/parent/monthly-trend-chart.tsx` marked `"use client"` — only this is client; rest is RSC.

## Implementation Steps
1. Write `(parent)/layout.tsx`:
   ```tsx
   import { verifyParent } from "@/lib/dal";
   export default async function ParentLayout({children}) {
     const user = await verifyParent();
     return <div className="theme-parent min-h-screen"><ParentHeader user={user} />{children}</div>;
   }
   ```
2. Write pure functions in `src/lib/parent/` first — easiest to unit-test (Phase 12):
   - `compute-composite-rating({accuracy, daysActive, consistencyStddev, avgMastery}) -> number`
   - `compute-weak-skills(progress[]) -> skillKey[]` — filter totalAttempts ≥ 3, sort asc by correctRatio, take 3
   - `compute-weekly-heatmap(attempts, today) -> [{date, minutes}]` — aggregate minutes from elapsedMs sum per day
   - `compose-recommendations(weakSkills, topicMastery) -> string[]`
3. Dashboard RSC: in one `Promise.all`, load all children + for each child all progress + last 30 days of attempts. Compute numbers. Render.
4. Build each UI component. `composite-rating-gauge.tsx` renders half-circle with SVG (no Recharts for a single gauge — KISS; Recharts is heavy).
5. `weekly-heatmap.tsx` — 7 squares with green intensity per minute count. Pure SVG.
6. `monthly-trend-chart.tsx` — Recharts `LineChart`, `dynamic(() => import("./..."), { ssr: false })` wrapper in server component.
7. Child detail page: per-topic aggregation reuses `aggregate-topic-mastery.ts` from Phase 07. Share the helper via `src/lib/shared/aggregate-topic-mastery.ts`.
8. Write `compose-recommendations.ts` with rule templates:
   - Weak skill → "Nên tập thêm <skillNameVi>."
   - Low streak → "Nên duy trì luyện tập hàng ngày."
   - Mostly mastery 3 → "Bé đã thuần thục đa số kỹ năng, hãy xem xét nội dung khó hơn."
9. Smoke: create a parent user, link two children, submit a few answers as each child, visit `/parent`.

## Todo List
- [x] `(parent)/layout.tsx` with verifyParent
- [x] 4 pure compute functions in `src/lib/parent/`
- [x] Dashboard RSC + components
- [x] `monthly-trend-chart.tsx` (client + Recharts + dynamic)
- [x] Weekly heatmap as SVG (no lib)
- [x] Composite rating gauge as SVG
- [x] Child detail page + per-topic mastery list
- [x] Recommendations list
- [x] Share `aggregate-topic-mastery.ts` between student + parent

## Success Criteria
- [x] Unauth `/parent` redirects to `/parent/signin`
- [x] Parent with 1 child sees dashboard; parent with 2+ sees selector
- [x] Composite rating between 0 and 100, number in gauge matches computed value
- [x] Weak-skills list shows exactly 3 items or placeholder "Chưa có dữ liệu"
- [x] Child detail `/parent/child/[id]` 403s if the id doesn't belong to this parent (DAL-level check)
- [x] No coral-* classes, no chunky shadow, no MimiSVG import anywhere under `(parent)`
- [x] Typecheck green

## Risk Assessment
**R1 — Recharts SSR hydration mismatch (Medium/Medium):** Recharts renders different widths server vs client (ResponsiveContainer measures DOM). *Mitigation:* Use `dynamic(() => import(...), { ssr: false })` for the chart component; wrap in `<Suspense>` with skeleton placeholder. Accept slight CLS; parent users tolerate it.

**R2 — Cross-child data leak (High/High):** Parent A viewing Child B's data must be blocked. *Mitigation:* `verifyParent()` returns parent user id; child detail page queries `prisma.user.findFirst({where:{id:childId, parentId:user.id}})` and 404s if null. Never trust URL param.

## Rollback Plan
Parent route group is completely independent of student. Delete `(parent)/` to remove. No shared state.

## Next Steps
Student + parent flows both functional. Phase 11 adds the numbers that feed composite rating's "XP" angle and badge displays.

## Completion Note
Parent dashboard + child detail. Composite rating gauge (40% accuracy + 20% streak + 20% consistency + 20% mastery). Weekly heatmap (SVG). Monthly trend (Recharts + dynamic SSR:false). Weak-skills top 3. Per-topic mastery. Recommendations. Cross-child leak guard in DAL.

---
title: "Phase 07 — Student Shell + Dashboard"
priority: P2
effort: 6h
status: completed
depends_on: [02, 03, 06]
completed: 2026-04-24
---

# Phase 07 — Student Shell + Dashboard

## Context Links
- Wireframes: `docs/wireframe/student-dashboard.html`
- `UX_DECISIONS.md` — 3 student principles, asymmetric celebration, encouraging copy
- `docs/design-guidelines.md` §4 `TopicCard`, `SkillCard`, §5 student column

## Overview
Student shell = layout with persistent header (Mimi mood, XP, streak). Dashboard = greeting + daily-goal progress + "Tiếp tục" CTA + topic grid. Server components read user + progress + curriculum; client components handle ephemeral Mimi emotion.

## Key Insights
- Layout mustn't do auth checks (per authentication.md §"Layouts and auth checks") — checks happen in page.
- Mimi greeting picks random encouragement from `pickEncouragement("greeting")` — extend pool to include "Chào bạn!" / "Chào em trở lại!".
- "Continue" CTA targets the skill with `lastPracticedAt` most recent and mastery < MASTERED; fallback = first skill in first un-mastered topic.

## Requirements
**Functional:**
- `/student` (page.tsx) — RSC:
  - `verifyStudent()`
  - Load: user, streak, today's DailyGoal, ~all SkillProgress rows, ~all topics (both grades for MVP)
  - Render greeting w/ Mimi, DailyGoalProgress, Continue button, Topic grid
- `/student` layout — persistent top bar: Mimi avatar (40px, emotion from Zustand), XPCounter, StreakFlame, signout
- Topic grid: each card shows topic name (Vietnamese), 4-bucket mini progress (ratio of skills per bucket)
- Click topic → `/student/topic/[topicId]` (stub route showing skill list; cookable later OR included here as a thin page)

**Non-functional:**
- Zustand `mascot-store.ts` — `{emotion, setEmotion}`, default idle, shared across shell
- All text in Vietnamese
- Mobile-first, ≥56px tap targets per design-guidelines §6

## Architecture
```
src/app/(student)/
├── layout.tsx                # server shell + client <StudentHeader /> client
├── student/
│   ├── page.tsx              # dashboard RSC
│   └── topic/[topicId]/page.tsx  # thin skill list RSC
src/components/student/
├── student-header.tsx        # "use client" - Mimi (Zustand), XP, streak, signout button
├── greeting-block.tsx        # server (passes down name) + inner client for Mimi state cycling
├── daily-goal-progress.tsx   # server - arc + number
├── continue-cta.tsx          # server - receives next skill, links to /student/practice/[skillKey]
├── topic-grid.tsx            # server
└── topic-card.tsx            # server
src/stores/
└── mascot-store.ts           # zustand create<MascotState>(...)
src/lib/dashboard/
├── pick-continue-skill.ts    # server - SkillProgress query logic
└── aggregate-topic-mastery.ts # helper: topic -> {chuaHoc, quenThuoc, thanhThao, thuanThuc} counts
```

## Related Code Files
**Create:** all files above.

**Modify:**
- None in this phase. Uses primitives from Phase 06.

## Implementation Steps
1. Create `src/stores/mascot-store.ts`:
   ```ts
   "use client";
   import { create } from "zustand";
   type E = "idle"|"happy"|"excited"|"thinking"|"sad"|"cheering";
   export const useMascot = create<{emotion:E; set:(e:E)=>void}>((set)=>({emotion:"idle", set:(emotion)=>set({emotion})}));
   ```
2. Write `src/app/(student)/layout.tsx`:
   ```tsx
   import { verifyStudent } from "@/lib/dal";
   import { StudentHeader } from "@/components/student/student-header";
   export default async function StudentLayout({children}) {
     const user = await verifyStudent();   // DAL handles redirect
     return <div className="theme-student min-h-screen"><StudentHeader user={user} /><main>{children}</main></div>;
   }
   ```
   (Signin pages live in `(auth)` route group so layout doesn't wrap them.)
3. Write `student-header.tsx` — client, reads Mimi emotion from store, shows XP + streak as props from server.
4. Write `pick-continue-skill.ts`:
   ```ts
   export async function pickContinueSkill(userId: string) {
     const recent = await prisma.skillProgress.findFirst({
       where:{userId, masteryLevel:{lt:3}},
       orderBy:{lastPracticedAt:"desc"}
     });
     if (recent) return recent.skillKey;
     // fallback: first gen skill in first topic
     const first = await prisma.skill.findFirst({where:{generatorKey:{not:null}}, orderBy:{lesson:{topic:{order:"asc"}}}});
     return first?.key ?? null;
   }
   ```
5. Write `aggregate-topic-mastery.ts` — counts skills per mastery bucket for a topic.
6. Write `topic-grid.tsx` — 2-col mobile / 4-col md; maps topics to `topic-card.tsx`.
7. Write dashboard `page.tsx`:
   ```tsx
   export default async function Dashboard() {
     const user = await verifyStudent();
     const [streak, goal, topics, continueKey] = await Promise.all([...]);
     return <>
       <GreetingBlock name={user.name} />
       <DailyGoalProgress completed={goal.completedMin} target={goal.targetMin} />
       <ContinueCTA skillKey={continueKey} />
       <TopicGrid topics={topics} />
     </>;
   }
   ```
8. Write `topic/[topicId]/page.tsx` — lists skills in topic with `MasteryPill`; each links to `/student/practice/[skillKey]`.

## Todo List
- [x] `mascot-store.ts` Zustand
- [x] `(student)/layout.tsx` with DAL
- [x] `student-header.tsx` client
- [x] `greeting-block.tsx`, `daily-goal-progress.tsx`, `continue-cta.tsx`
- [x] `topic-grid.tsx`, `topic-card.tsx`
- [x] `pick-continue-skill.ts`, `aggregate-topic-mastery.ts`
- [x] Dashboard page RSC
- [x] Topic page RSC
- [x] Manual: signin as student, dashboard renders, navigates to topic page

## Success Criteria
- [x] Unauth `/student` redirects to `/student/signin`
- [x] Dashboard shows greeting with random encouragement; reload shows different phrase
- [x] Topic grid shows all topics for grades 4 & 5 (~25 topics)
- [x] Each topic card displays 4-bucket mastery bar derived from real SkillProgress rows (all zeros for fresh account)
- [x] Continue CTA targets a real skill key and navigates to `/student/practice/:key` (404 OK — phase 08 builds it)
- [x] Typecheck green

## Risk Assessment
**R1 — Dashboard N+1 queries (Medium/Medium):** Rendering 25 topic cards, each with skill-bucket aggregation, tempts per-topic queries. *Mitigation:* Single `prisma.skillProgress.findMany({where:{userId}})` + single `prisma.topic.findMany({include:{lessons:{include:{skills:true}}}})`, aggregate in memory. Budget: dashboard < 200ms on cold query with 60-row progress table.

**R2 — Zustand hydration mismatch (Low/Medium):** Server renders header with Mimi state "idle", client hydrates and Zustand might snap to different emotion if code changes state pre-hydration. *Mitigation:* Mascot store default is "idle" matching server; never call `setEmotion` during render, only in effects and event handlers.

## Rollback Plan
Shell pages are self-contained; deleting any one leaf component (e.g., StreakFlame) leaves the rest functional.

## Next Steps
Unblocks Phase 08 (practice page lives under `(student)/student/practice/:key`), Phase 09 (summary page also under `(student)`).

## Completion Note
Student layout + dashboard. Zustand mascot store. 12 files (components, stores, lib helpers). Greeting, DailyGoalProgress, ContinueCTA, TopicGrid. Topic page with skill list. All RSC with verifyStudent DAL checks.

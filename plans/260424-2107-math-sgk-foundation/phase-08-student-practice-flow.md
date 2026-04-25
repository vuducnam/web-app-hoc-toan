---
title: "Phase 08 — Student Practice Flow"
priority: P2
effort: 8h
status: completed
depends_on: [04, 05, 06, 07]
completed: 2026-04-24
---

# Phase 08 — Student Practice Flow

## Context Links
- Wireframes: `docs/wireframe/student-practice.html`
- Research: `docs/research/researcher-math-rendering.md` §3-4 (MathDisplay, FractionInput)
- Research: `docs/research/researcher-procedural-generators.md` §4 (anti-cheat wire protocol)
- Phase 05 server actions — `getNextQuestion`, `submitAnswer`

## Overview
Practice page per skill. Server fetches first question (RSC). Client component renders based on `answerFormat`, submits to `submitAnswer`, shows inline feedback overlay (Phase 09 fully builds overlay — here we wire the call site), loops to next question. 10 questions = one session.

## Key Insights
- **Question fetch is a server action, not a page reload** — client calls `getNextQuestion(skillKey)` via TanStack Query `useMutation` on each "next" tap. First question can be prefetched server-side for fast TTI.
- `answerFormat` drives input component: numeric → `<input type=number>`, fraction → `<FractionInput>`, decimal → `<input inputMode=decimal>`, multiple-choice → four `<Button>` choices, text → `<input>`.
- Progress dots (10 slots) managed in session state: empty / correct-green / wrong-red.
- "Bỏ qua" (skip) records Attempt with `correct:false` but `skipped:true` flag OR just moves to next without recording (MVP: move without recording). "Trợ giúp" (help) reveals the `problemLatex` full-form or a hint blurb — hints out of MVP scope; button shows "Coming soon" toast.

## Requirements
**Functional:**
- `/student/practice/[skillKey]` — RSC. Verify student, verify skill exists (else 404). Call `getNextQuestion` server-side to get first question. Pass to client root.
- Client root `<PracticeSession>` (Zustand local store for session): holds `current: Question | null`, `answered: number`, `correct: number`, `history: Array<{correct, elapsedMs}>`, `progressDots: Array<"empty"|"correct"|"wrong">`.
- On submit: call `submitAnswer`, on response:
  - update dots
  - if `leveledUp`, trigger Mimi `cheering` (Phase 09 overlay handles confetti); else if `correct`, Mimi `happy`; else Mimi `sad`
  - advance to next question (call `getNextQuestion` again)
- Session of 10 questions → navigate `/student/summary?skillKey=...&session=<id>` (summary handled by Phase 09).
- Buttons: "Bỏ qua" (secondary), "Trợ giúp" (ghost), "Kiểm tra" (primary, submit).

**Non-functional:**
- Client bundle not imported from server code.
- Answer input auto-focuses on question change.
- Timer runs client-side for display only (server has its own timing); stops on submit.

## Architecture
```
/student/practice/[skillKey]/page.tsx                # RSC entry
  └── renders <PracticeSession firstQuestion={q} skillKey={key} />

src/components/practice/
├── practice-session.tsx            # "use client" - root state container
├── question-card.tsx               # renders MathDisplay + input
├── numeric-input.tsx               # stub wrappers - consistent API
├── fraction-input-adapter.tsx      # wraps ui/FractionInput
├── decimal-input.tsx               # vi-VN aware
├── multiple-choice-list.tsx
├── progress-dots.tsx               # 10 slots
├── action-bar.tsx                  # skip / help / check
└── feedback-overlay.tsx            # THIN here - Phase 09 expands; just shows toast now
src/lib/practice/
├── map-answer-format-to-input.ts   # runtime switch
└── random-session-id.ts            # uuid per session
```

## Related Code Files
**Create:** all files above.

**Modify:**
- None (Phase 09 extends `feedback-overlay.tsx` later).

## Implementation Steps
1. Create page RSC `page.tsx` for `[skillKey]`:
   ```tsx
   export default async function PracticePage({ params }: { params: Promise<{skillKey:string}>}) {
     const { skillKey } = await params;
     await verifyStudent();
     const skill = await prisma.skill.findUnique({where:{key:skillKey}});
     if (!skill) notFound();
     const firstQ = await getNextQuestion(skillKey);
     return <PracticeSession firstQuestion={firstQ} skillKey={skillKey} skillName={skill.nameVi} />;
   }
   ```
2. Write `practice-session.tsx`:
   - Zustand local (or `useReducer` — pick useReducer for session isolation; KISS)
   - Ten-question loop
   - TanStack `useMutation` wraps `submitAnswer` server action (via hook pattern; call `submitAnswer` directly from `useMutation(mutationFn: submitAnswer)`)
   - On mutation success: update local state + `useMascot().set(emotion)`
3. Write `map-answer-format-to-input.ts` — switch returning the right React element.
4. Write each input adapter consistently: `{ onSubmit(raw: string): void, disabled: boolean, autoFocus: boolean }`.
5. Write `progress-dots.tsx` — 10 circles, color per state, scale animation on new entry.
6. Write `action-bar.tsx` — three buttons with `aria-label`.
7. Write thin `feedback-overlay.tsx` — just shows `EncouragingToast` from Phase 06. Phase 09 rewrites for full overlay.
8. Smoke test: generate test user, practice `add-sub-100k-carry`, submit correct answer — mastery row advances.

## Todo List
- [x] Page RSC with first-question prefetch
- [x] `practice-session.tsx` reducer + 10-question loop
- [x] Input adapters (numeric, fraction, decimal, multi-choice)
- [x] `progress-dots.tsx`
- [x] `action-bar.tsx` (skip/help/check)
- [x] Thin `feedback-overlay.tsx`
- [x] `map-answer-format-to-input.ts`
- [x] Navigate to summary on 10/10

## Success Criteria
- [x] Practice page 404s for unknown skillKey
- [x] Practice page 404s for skillKey whose generator is a stub (throws on generate) — error boundary shows "Bài đang được chuẩn bị"
- [x] Correct numeric submit advances to next question within 500ms
- [x] Wrong submit shows sad Mimi + toast from wrong copy pool
- [x] After 10 questions → redirect to summary with session id
- [x] Typecheck green

## Risk Assessment
**R1 — Stub generators crash page (High/Medium):** Every skill with `[pool]` tag or un-implemented `[gen]` throws `NotImplemented` from `getNextQuestion`. The page RSC would 500. *Mitigation:* Wrap `getNextQuestion` in RSC with try/catch; on stub, render a "coming soon" card instead of throwing. Or: filter the topic page (Phase 07) to only link to skills whose `generatorKey` is in `GENERATORS` live list — but that hides curriculum. Better: render a placeholder page per skill so user sees that content exists. Decision: placeholder.

**R2 — Server-action answer round-trip slow on Windows dev (Medium/Low):** Two server actions per question (submit + next) ≈ 2×DB roundtrip. *Mitigation:* Combine into one action `submitAndFetchNext` returning `{feedback, nextQuestion}`. If latency budget blown, collapse; otherwise keep separate for clarity. Measure in Phase 12.

## Rollback Plan
Practice page is a leaf route; deleting `practice/[skillKey]` doesn't affect dashboard. Topic cards would 404 — acceptable fallback.

## Next Steps
Unblocks Phase 09 (feedback overlay lives in this page, summary page receives handoff).

## Completion Note
Practice page at `/student/practice/[skillKey]`. useReducer session, 10-question loop. 5 input adapters. Thin feedback overlay. Mimi emotion states (happy/sad/cheering). Navigation to summary on completion.

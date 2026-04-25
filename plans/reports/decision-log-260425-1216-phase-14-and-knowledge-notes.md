# Decision Log — Phase 14 + Knowledge Notes + Difficulty Selector

**Date:** 2026-04-25 12:16-12:35
**Context:** User prioritized multiple features mid-session; this log consolidates locked decisions for downstream implementation.

## Phase 13 Status

- 44 live generators shipped, 608 unit tests pass, typecheck clean
- LaTeX rendering bugfix applied (7 generators)
- **NOT YET COMMITTED** — uncommitted ~50 files

## Phase 14 — Pool Architecture (Locked Decisions)

| # | Question | Decision | Notes |
|---|---|---|---|
| 1 | TEACHER auth provider | Reuse parent-credentials + role-check | KISS, 1 form. Role from DB → redirect logic |
| 2 | TEMPLATE columns | Add nullable now | 4 nullable cols (templateText, templateLatex, variableSpec JSON, expectedFormula). Future-proof |
| 3 | `g4-angle-measure` | DEFER to Phase 15 (SVG protractor) | Stays as placeholder; not in 14a procedural conversion |
| 4 | `g5-circle-circumference-area` | Alternate C / A in 1 skill | Matches seed (single skill). Generator randomizes between C and A prompts |
| 5 | Sample seed reviewer | Self-review for MVP | Iterate post-launch |
| 6 | PARENT_OVERRIDE creation UI | Defer Phase 17 | TEACHER-only authoring in Phase 14 |
| 7 | Theme-teacher CSS | Reuse parent palette placeholder | Polish post-MVP |

**Scope adjustment:** Phase 14a = **13 procedural skills** (not 14, excluded angle-measure). Phase 14b = **2 pool skills** (data-collection, data-tables-graphs).

## Knowledge Notes — 3-Section Pre-Exercise (Locked Decisions)

| # | Question | Decision | Notes |
|---|---|---|---|
| 1 | Display timing | Pre-session card + toggle inline drawer | Card before practice, drawer for re-reference |
| 2 | Granularity | **Lesson-only for MVP, no skill override** | Saves ~30% content effort. Add overrides post-launch if needed |
| 3 | Content sections | 3 sections: **Ghi nhớ / Chú ý / Mở rộng** | Vietnamese pedagogical convention |
| 4 | Storage | DB columns on Lesson | 3 nullable Markdown cols on `Lesson` only (skip Skill override cols) |
| 5 | Coverage gate | Soft-warn | Test logs warning, doesn't fail CI |
| 6 | Theme tokens | Use existing `bubble-mint-*` (not `mint-*`); `sun-*` exists | Auto-resolved via globals.css check |
| 7 | Reviewer | Self-review for MVP | Same as Phase 14 |

**Scope adjustment:** Schema adds 3 columns to `Lesson` only (not Skill). Resolver simplified: just `lesson.X ?? null`. Override capability deferred to Phase 17.

## NEW Feature — Difficulty Selector (UX)

User report: "tất cả bài tập đều quá dễ" → mastery-driven difficulty stuck at D1 for new students.

**Decision:** Add **Difficulty selector on practice page** (UI feature).

**Spec:**
- Practice page top: 3 chip buttons (D1 Dễ / D2 Vừa / D3 Khó) + "Auto" (mastery default)
- Default = mastery-suggested via `nextDifficulty(masteryLevel)`
- Click chip → override locally for this session, pass `?difficulty=N` to `getNextQuestion(skillKey, difficulty)`
- Server side: accept optional `difficulty` arg, validate (1|2|3|undefined), use override if provided else mastery default
- Persist user preference in localStorage per skill (optional Phase 15)
- Mastery progression UNCHANGED — selector doesn't affect mastery transitions (still based on actual answer correctness vs server-decided baseline difficulty)

**Effort:** ~2-3h. Self-contained, no schema/DB changes.

## Implementation Priority (Suggested)

Per user latest signals, recommended order:

1. **Commit Phase 13** (immediate — lock 44 generators in git)
2. **Difficulty Selector** (2-3h, quick win, addresses user's "too easy" complaint immediately)
3. **Knowledge Notes** (~26h, user called this "phần quan trọng nhất")
4. **Phase 14** (~26h parallel / 32h serial, largest scope)

Phase 13 commit + Difficulty Selector together = 1 session. Knowledge Notes + Phase 14 each their own session(s).

## Unresolved Questions (Outstanding)

- None blocking. All architectural decisions locked.
- Content review (post-Phase 14b/Knowledge Notes content seed) — accept self-review for MVP, can iterate with teacher post-launch.

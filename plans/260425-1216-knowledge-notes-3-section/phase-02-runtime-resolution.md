# Phase 02 — Runtime Resolution + Practice Page Integration

## Context Links

- Practice entry RSC: `src/app/(student)/student/practice/[skillKey]/page.tsx:15-56`
- Practice session client: `src/components/practice/practice-session.tsx:78-272`
- Prisma client: `src/lib/prisma.ts`
- Phase 01 schema (blocker): `./phase-01-schema-and-types.md`
- Phase 03 UI consumer: `./phase-03-ui-card-and-drawer.md`

## Overview

- **Priority:** P2
- **Status:** pending
- **Effort:** ~3h
- Build pure resolver `resolveKnowledgeNote()` and wire it into the practice page so the resolved note prop reaches `PracticeSession`.

## Key Insights

- Resolver MUST be pure (no Prisma, no fetch) → easily unit-testable, no DB-roundtrip needed inside the function
- Pre-existing Prisma query at `practice/[skillKey]/page.tsx:22` does `findUnique({ where: { key: skillKey } })` — needs `include: { lesson: true }` to fetch lesson columns in same round-trip
- `PracticeSession` is already a client component; pass plain serializable `note` prop (not the whole skill+lesson)
- If all 3 sections are null → resolver returns `null`; UI must skip card and drawer toggle entirely (no empty UI)
- "Not yet started" stub branch (`page.tsx:29-47`) does NOT need notes — keep that branch unchanged
- Skill-level override is **per-section**, not whole-note: `caution` may override while `remember` falls through

## Requirements

### Functional
- Pure function `resolveKnowledgeNote(skill, lesson)` returns `KnowledgeNote | null`
- `KnowledgeNote = { remember, caution, extension }` each `string | null`
- All-null result returns `null` (caller checks for absence)
- Practice page selects the lesson alongside the skill in one Prisma query
- `PracticeSession` accepts new optional `note?: KnowledgeNote | null` prop

### Non-Functional
- No new DB round-trip beyond a single `include`
- Resolver covered by unit tests (3 truth-table cases + null collapse)

## Architecture

### Data Flow
```
page.tsx (RSC)
  ├─ verifyStudent()
  ├─ prisma.skill.findUnique({ key, include: { lesson: true } })
  ├─ resolveKnowledgeNote(skill, skill.lesson)  → KnowledgeNote | null
  ├─ getNextQuestion(skillKey)
  └─ <PracticeSession note={note} … />
```

### Resolver Contract
```ts
// src/lib/knowledge-notes/resolve-note.ts
import "server-only"; // not strictly required (pure), but keeps import boundary obvious

export interface KnowledgeNote {
  remember: string | null;
  caution: string | null;
  extension: string | null;
}

interface NoteFields {
  knowledgeNoteRemember: string | null;
  knowledgeNoteCaution: string | null;
  knowledgeNoteExtension: string | null;
}

export function resolveKnowledgeNote(
  skill: NoteFields,
  lesson: NoteFields | null,
): KnowledgeNote | null {
  const remember = skill.knowledgeNoteRemember ?? lesson?.knowledgeNoteRemember ?? null;
  const caution = skill.knowledgeNoteCaution ?? lesson?.knowledgeNoteCaution ?? null;
  const extension = skill.knowledgeNoteExtension ?? lesson?.knowledgeNoteExtension ?? null;
  if (!remember && !caution && !extension) return null;
  return { remember, caution, extension };
}
```

### Page Diff
```diff
-const skill = await prisma.skill.findUnique({ where: { key: skillKey } });
+const skill = await prisma.skill.findUnique({
+  where: { key: skillKey },
+  include: { lesson: true },
+});
 if (!skill) notFound();
+const note = resolveKnowledgeNote(skill, skill.lesson);

 const firstQ = await getNextQuestion(skillKey);
 // … unchanged stub branch …
 return (
   <PracticeSession
+    note={note}
     firstQuestion={firstQ}
     skillKey={skillKey}
     skillName={skill.nameVi}
   />
 );
```

### `PracticeSession` Prop Diff
- Add `note?: KnowledgeNote | null` to `PracticeSessionProps`
- State: `const [showCard, setShowCard] = useState(note != null)` — pre-session card visible at start when note exists
- State: `const [drawerOpen, setDrawerOpen] = useState(false)` — drawer toggle inside session
- Render branching:
  - `showCard && note` → render `<NoteCard note={note} skillName={skillName} onStart={() => setShowCard(false)} />`
  - else → render existing practice UI; add `<NoteDrawerToggle disabled={note == null}>` and `<NoteDrawer open={drawerOpen} note={note} onClose={…} />`
- Drawer auto-close: in `handleSubmit`, before async submit: `if (drawerOpen) setDrawerOpen(false)`

## Related Code Files

### Modify
- `src/app/(student)/student/practice/[skillKey]/page.tsx` — add `include: { lesson: true }`, call resolver, pass prop
- `src/components/practice/practice-session.tsx` — accept `note` prop, gate pre-session card, drawer state
- `src/lib/knowledge-notes/index.ts` (new module barrel) — re-export resolver + types

### Create
- `src/lib/knowledge-notes/resolve-note.ts` — pure resolver
- `src/lib/knowledge-notes/types.ts` — `KnowledgeNote` interface (or co-located in resolver)

### Delete
- none

## Implementation Steps

1. Create `src/lib/knowledge-notes/resolve-note.ts` with the function shown above
2. Export `KnowledgeNote` type from same file (no separate `types.ts` unless reused widely — KISS)
3. Update `src/app/(student)/student/practice/[skillKey]/page.tsx`:
   - Change Prisma query to include lesson
   - Call resolver after `notFound()` check
   - Pass `note` prop to `<PracticeSession>`
4. Update `src/components/practice/practice-session.tsx`:
   - Add `note?: KnowledgeNote | null` to props interface
   - Add `useState` for `showCard` (init from `note != null`) and `drawerOpen`
   - Wrap existing return in branch: pre-session card OR practice UI
   - Add drawer toggle button in progress header (disabled when `note == null`)
   - Auto-close drawer on first input via callback hook
5. Run `npm run typecheck` — fix prop types
6. Spot-check by manually toggling a `knowledgeNoteRemember` value in DB via `prisma studio` and observing card render

## Todo List

- [ ] Create `resolve-note.ts` with pure function + `KnowledgeNote` type
- [ ] Add `include: { lesson: true }` in practice page query
- [ ] Call `resolveKnowledgeNote` and pass `note` prop
- [ ] Add `note` prop to `PracticeSessionProps`
- [ ] Add `showCard` + `drawerOpen` state
- [ ] Branch render between card and session
- [ ] Wire drawer toggle button + auto-close on first submit
- [ ] Manual smoke test with one populated note row

## Success Criteria

- Resolver unit tests cover: (a) all skill, (b) all lesson, (c) mixed override per section, (d) all null → returns null
- Practice page query is one round-trip (verified via Prisma log or `EXPLAIN`)
- When note populated: pre-session card shows; "Bắt đầu" hides it; drawer toggle accessible during practice
- When note null: existing flow is byte-identical (no extra renders, no toggle button)

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Forgetting to flush drawer on advance to next question (stale open state) | Medium | Low | Reset `drawerOpen=false` in `handleAdvance` and on first keystroke in input |
| RSC→client serialization fails (passing wrong shape) | Low | Medium | `KnowledgeNote` is plain string fields → trivially serializable |
| Adding `include: { lesson: true }` regresses query plan in production | Low | Low | Lesson is FK by id, indexed; <1ms overhead |
| Pre-session card pre-empts learning (kids skip "Bắt đầu" reflexively) | Medium | Medium | Keep drawer toggle visible during session; A/B test in Phase 15 |
| Drawer state lost on parent rerender from new question | Low | Low | `drawerOpen` lives in `PracticeSession` (top of session subtree) — survives `dispatch` |

## Security Considerations

- `note` prop crosses RSC boundary as plain strings — no functions, no class instances → safe
- No new auth surface; reuses `verifyStudent()` guard at page top
- Markdown rendering happens in Phase 03; this phase passes raw strings only

## Next Steps

- Phase 03 consumes `note` prop in client UI components
- Phase 06 adds resolver unit tests + integration test (page renders card)

# Phase 06 — Validation: Tests + A11y + Smoke

## Context Links

- Test runner: Vitest 4 (`package.json:11-15`); existing 161 tests pass
- Test layout: `tests/unit/`, `tests/integration/` (per `package.json` scripts)
- Phase 02 resolver: `src/lib/knowledge-notes/resolve-note.ts`
- Phase 03 components: `src/components/knowledge-notes/*`
- Phase 04/05 seed coverage: `prisma/seed-data/grade-4.ts`, `grade-5.ts`

## Overview

- **Priority:** P2
- **Status:** pending
- **Effort:** ~3h
- Add unit tests for resolver, component snapshot tests for renderer + card + drawer, integration test for practice page, content coverage assertion, manual a11y audit.
- Sequenced last — depends on 01-05.

## Key Insights

- Resolver is pure → trivial unit tests; aim for 100% line coverage
- React component tests use `vitest` + `@testing-library/react` (verify availability; install if missing)
- Snapshot test on `NoteMarkdown` with mixed Markdown+KaTeX input asserts deterministic HTML output
- Drawer focus-trap behavior best tested manually (Radix is well-tested); we add a smoke test that drawer opens/closes via toggle
- Content coverage test: query all lessons after `db:seed` in test DB; assert `knowledgeNoteRemember` non-null
- A11y: use `axe-core` if already in stack; otherwise manual checklist (axe browser ext, NVDA screen reader spot-check)

## Requirements

### Functional
- Unit: resolver covers 4 cases (all skill, all lesson, mixed override, all null)
- Unit: renderer snapshot for canonical Markdown w/ inline + block KaTeX
- Unit: tone-tokens map returns expected class strings
- Component: `NoteCard` renders 3 sections + CTA, calls `onStart` on click
- Component: `NoteDrawer` opens/closes via `open` prop change; ESC fires `onOpenChange(false)`
- Component: `NoteSection` returns null when `body == null`
- Integration: practice page renders card when `note != null`, skips card when null
- Coverage: every G4 + G5 lesson has `knowledgeNoteRemember` non-null (assert in seed step or in CI test)

### Non-Functional
- All new tests pass under `npm run test`
- No regressions in existing 161 tests
- Lighthouse a11y score on practice page ≥ pre-feature baseline

## Architecture

### Test File Layout
```
tests/
├── unit/
│   └── knowledge-notes/
│       ├── resolve-note.test.ts                # resolver
│       ├── note-tone-tokens.test.ts            # token map
│       └── note-markdown.test.tsx              # renderer snapshot
├── component/                                   # if using @testing-library
│   └── knowledge-notes/
│       ├── note-card.test.tsx
│       ├── note-drawer.test.tsx
│       └── note-section.test.tsx
└── integration/
    └── practice-page-with-note.test.tsx         # full page render
```

### Resolver Test Cases
```ts
describe("resolveKnowledgeNote", () => {
  const empty = { knowledgeNoteRemember: null, knowledgeNoteCaution: null, knowledgeNoteExtension: null };
  it("uses skill when both populated", () => { /* skill values returned */ });
  it("falls back to lesson when skill null", () => { /* lesson values returned */ });
  it("mixes per-section override", () => { /* skill remember + lesson caution + null extension */ });
  it("returns null when all null", () => { expect(resolveKnowledgeNote(empty, empty)).toBeNull(); });
  it("returns null when lesson is null and skill all null", () => { /* … */ });
});
```

### Renderer Snapshot Input
```ts
const sample = `### Heading

Inline math: $x = 5$

Block math:
$$S = \\frac{a \\times h}{2}$$

- bullet 1
- bullet 2`;
```

### Coverage Assertion (option A — test, option B — seed-time check)

Recommended: option B (cheaper). Add to `prisma/seed.ts` near line 192:
```ts
const lessonsMissingNote = await prisma.lesson.count({
  where: { knowledgeNoteRemember: null },
});
if (lessonsMissingNote > 0) {
  console.warn(`⚠ ${lessonsMissingNote} lesson(s) missing knowledgeNoteRemember`);
}
```
Don't fail seed (allows incremental authoring), but surface count.

Strict version (option A) — gate Phase 04/05 PR merge:
```ts
// tests/integration/knowledge-notes-coverage.test.ts
it("every lesson has knowledgeNoteRemember", async () => {
  const missing = await prisma.lesson.count({ where: { knowledgeNoteRemember: null } });
  expect(missing).toBe(0);
});
```

### A11y Manual Checklist
- Card: `<h1>` for skill, `<h2>` per section, "Bắt đầu" is `<button>`
- Drawer toggle: `aria-expanded`, `aria-controls`, focusable, ≥56px tap
- Drawer: focus moves into dialog on open (Radix default), trapped while open, returns to toggle on close
- Drawer: ESC closes (Radix default)
- Markdown: heading order monotonic; no skipped levels
- KaTeX: `aria-label` matches formula source (Phase 03 already wraps with `MathDisplay`-style labels)
- Reduced motion: `prefers-reduced-motion: reduce` skips slide animations
- Color contrast: section header colors ≥4.5:1 against text (verify via DevTools)

## Related Code Files

### Modify
- `package.json` — add `@testing-library/react` if not present; verify `jsdom` env config in vitest
- `prisma/seed.ts` — optional warn-count for missing notes (line ~192)

### Create
- `tests/unit/knowledge-notes/resolve-note.test.ts`
- `tests/unit/knowledge-notes/note-tone-tokens.test.ts`
- `tests/unit/knowledge-notes/note-markdown.test.tsx`
- `tests/component/knowledge-notes/note-card.test.tsx`
- `tests/component/knowledge-notes/note-drawer.test.tsx`
- `tests/component/knowledge-notes/note-section.test.tsx`
- `tests/integration/practice-page-with-note.test.tsx`
- `tests/integration/knowledge-notes-coverage.test.ts` (gated; can be `skip` until Phase 04/05 done)

### Delete
- none

## Implementation Steps

1. Verify `@testing-library/react` available; install if missing (`npm i -D @testing-library/react @testing-library/user-event jsdom`)
2. Configure vitest `environment: "jsdom"` for `tests/component/**` (project-level config or in-file `// @vitest-environment jsdom`)
3. Write resolver unit tests (5 cases)
4. Write tone-tokens map test
5. Write renderer snapshot test with the sample Markdown
6. Write component tests for Card, Drawer, Section
7. Write integration test for practice page (mock `verifyStudent` + `prisma.skill.findUnique`)
8. Add coverage gate test (skipped until 04/05 land)
9. Run `npm run test` — all green; verify no regressions
10. Run manual a11y checklist with axe DevTools on `/student/practice/{skillKey}`
11. Capture Lighthouse a11y score; record in PR description

## Todo List

- [ ] Install/verify testing-library + jsdom
- [ ] Resolver unit tests (5 cases)
- [ ] tone-tokens map test
- [ ] Renderer snapshot test
- [ ] NoteCard component test
- [ ] NoteDrawer open/close test
- [ ] NoteSection null-body test
- [ ] Integration test (practice page + note)
- [ ] Coverage gate test
- [ ] Manual axe DevTools audit
- [ ] Lighthouse score recorded
- [ ] All tests green; no regressions

## Success Criteria

- New test count: ≥12 (matching list above)
- Total test suite: ≥173 passing (was 161); coverage on `src/lib/knowledge-notes/*` ≥95%
- A11y score on practice page ≥ baseline
- No console warnings during render (no missing keys, no React act warnings)

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Snapshot brittle due to KaTeX HTML output | Medium | Low | Snapshot only structural top-level HTML, not full KaTeX subtree; or use string match for class names |
| Vitest jsdom env conflict with existing node-env tests | Low | Medium | Use per-file env directive; don't change global config |
| Integration test needs Prisma mock — heavy setup | Medium | Medium | Mock `@/lib/prisma` via `vi.mock`; assert renders, not DB |
| Coverage gate test fails CI before content done | Medium | High | Mark `it.skip` initially; un-skip in same PR as Phase 04/05 merge |
| `@testing-library/react` not installed | Medium | Low | Step 1 detects + installs |

## Security Considerations

- No security-relevant tests in this phase (no auth, no input validation)
- Renderer snapshot indirectly verifies `skipHtml` is honored (raw `<script>` in input → escaped in output)

## Next Steps

- Merge to main once all phases complete and reviewed
- Update `docs/codebase-summary.md` and `docs/project-changelog.md` per documentation-management rules
- Consider Phase 15 enhancement: "seen-state" tracking, EN translations, teacher-authored notes

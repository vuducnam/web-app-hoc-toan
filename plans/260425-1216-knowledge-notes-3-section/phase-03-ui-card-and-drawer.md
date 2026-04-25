# Phase 03 — UI: Pre-Session Card, Drawer, Markdown+KaTeX Renderer

## Context Links

- Practice session: `src/components/practice/practice-session.tsx`
- Existing KaTeX wrapper: `src/components/ui/math-display.tsx`
- KaTeX CSS already imported: `src/app/layout.tsx:3`
- Available primitive: `@radix-ui/react-dialog` (already in `package.json:30`)
- Theme tokens: `src/app/globals.css` (`@theme inline`)
- Phase 02 prop contract: `./phase-02-runtime-resolution.md`

## Overview

- **Priority:** P2
- **Status:** pending
- **Effort:** ~6h
- Build the visible UI: pre-session card, inline drawer toggle, drawer surface, Markdown+KaTeX renderer wrapper. Theming follows `theme-student` (chunky shadows, brand-500 accents).

## Key Insights

- `react-markdown` v9 stable; pairs natively with `remark-math` + `rehype-katex` plugin chain
- `react-katex` already used by `MathDisplay`; `rehype-katex` uses `katex` (same dep) directly — bundle-shared
- All notes are seeded by devs → trusting Markdown is OK; we still pass `skipHtml: true` (or no `rehype-raw`) so embedded HTML is escaped
- Three sections need distinct visual treatment but identical layout → single `NoteSection` component with `tone: "remember" | "caution" | "extension"`
- Mobile = bottom sheet, desktop = side drawer; Radix Dialog supports both via positioning class
- Drawer must trap focus (Radix Dialog provides focus trap + ESC handler natively)
- Bundle weight: `react-markdown` ≈ 12KB gz, plugins ≈ 3KB gz, no impact on RSC payload (only loaded on practice page)
- Use Next.js `dynamic()` to lazy-load `NoteCard`/`NoteDrawer` only when `note != null` to avoid penalising note-less skills

## Requirements

### Functional
- `<NoteCard note skillName onStart />` — full-screen-ish card (mobile) / centered (desktop) with header, 3 sections, "Bắt đầu" CTA
- `<NoteDrawerToggle onClick disabled />` — small button in practice header ("Xem kiến thức")
- `<NoteDrawer open onOpenChange note />` — sheet/drawer with same 3 sections + close button
- `<NoteSection tone heading body />` — single section w/ Markdown body
- `<NoteMarkdown source />` — wraps `react-markdown` with math plugins; renders KaTeX

### Non-Functional
- Mobile-first responsive, ≥56px tap targets
- Reduced motion respected
- Card and drawer lazy-loaded (no JS impact when `note == null`)
- A11y: `<h1>` skill name, `<h2>` per section, `aria-expanded` on toggle, focus trap on drawer

## Architecture

### Component Tree
```
PracticeSession (client, holds note state)
├─ if (showCard && note)
│   └─ NoteCard
│       ├─ <h1>{skillName}</h1>
│       ├─ NoteSection tone="remember"   body={note.remember}
│       ├─ NoteSection tone="caution"    body={note.caution}
│       ├─ NoteSection tone="extension"  body={note.extension}
│       └─ Button "Bắt đầu" → onStart
│
└─ else
    ├─ progress header
    │   └─ NoteDrawerToggle (only if note != null)
    └─ NoteDrawer (Radix Dialog) — same NoteSection trio
```

### Renderer
```ts
// src/components/knowledge-notes/note-markdown.tsx
"use client";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

export function NoteMarkdown({ source }: { source: string }) {
  return (
    <div className="prose-note">
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        skipHtml // safety: don't render embedded raw HTML
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
```

### Tone → Token Map
| tone | header bg | body bg | border | icon |
|---|---|---|---|---|
| remember  | `bg-brand-500 text-white`   | `bg-brand-50`   | `border-brand-100`   | 📘 (or `lucide-react BookOpen`) |
| caution   | `bg-sun-500 text-ink-900`   | `bg-sun-50`     | `border-sun-100`     | ⚠️ (`lucide-react AlertTriangle`) |
| extension | `bg-mint-500 text-ink-900`  | `bg-mint-50`    | `border-mint-100`    | ✨ (`lucide-react Sparkles`) |

(Confirm token names against `globals.css`; if `mint-*` absent, fall back to `coral-*` or add tokens — Phase 03 step 1.)

### Lazy Loading
```ts
// in practice-session.tsx
const NoteCard = dynamic(() => import("@/components/knowledge-notes/note-card").then(m => m.NoteCard));
const NoteDrawer = dynamic(() => import("@/components/knowledge-notes/note-drawer").then(m => m.NoteDrawer));
```

### Drawer Behaviour
- Radix `Dialog` with `Dialog.Overlay` + `Dialog.Content`
- Position: `bottom-0 inset-x-0 max-h-[85vh] rounded-t-3xl` on mobile, `right-0 inset-y-0 w-[480px] rounded-l-3xl` on desktop (`md:` breakpoint)
- Close on: ESC (Radix default), backdrop click (Radix default), close button, **and** auto-close hook from `PracticeSession` on first submit
- Animation: slide-up (mobile) / slide-left (desktop); respect `prefers-reduced-motion`

## Related Code Files

### Modify
- `src/components/practice/practice-session.tsx` — render branches + drawer toggle + lazy imports (state already added in Phase 02)
- `package.json` — add `react-markdown`, `remark-math`, `rehype-katex`
- `src/app/globals.css` — add `.prose-note` typographic block (small reset, headings, lists, KaTeX vertical rhythm)

### Create
- `src/components/knowledge-notes/note-card.tsx` — pre-session card (≤120 lines)
- `src/components/knowledge-notes/note-drawer.tsx` — Radix Dialog wrapper (≤120 lines)
- `src/components/knowledge-notes/note-drawer-toggle.tsx` — toggle button (≤40 lines)
- `src/components/knowledge-notes/note-section.tsx` — single section row (≤80 lines)
- `src/components/knowledge-notes/note-markdown.tsx` — react-markdown wrapper (≤30 lines)
- `src/components/knowledge-notes/note-tone-tokens.ts` — tone → class map (≤30 lines)

### Delete
- none

## Implementation Steps

1. `npm i react-markdown remark-math rehype-katex` — verify versions (`react-markdown@^9`, `remark-math@^6`, `rehype-katex@^7`)
2. Create `note-markdown.tsx` (KISS — only `ReactMarkdown` + plugins)
3. Create `note-tone-tokens.ts` returning class strings per tone
4. Create `note-section.tsx` rendering header (icon + Vietnamese heading) + `<NoteMarkdown source={body} />`
   - Section auto-hides if `body == null`
   - Headings: "Ghi nhớ", "Chú ý", "Mở rộng"
5. Create `note-card.tsx` — full card; wraps three `NoteSection` + "Bắt đầu" CTA; uses theme-student rounded-3xl + `shadow-chunky`
6. Create `note-drawer.tsx` — Radix `Dialog.Root` controlled by `open`/`onOpenChange`; mounts three `NoteSection`; close button top-right
7. Create `note-drawer-toggle.tsx` — pill button with book icon + "Xem kiến thức" text; `aria-expanded`, `aria-controls`
8. Add `.prose-note` styles in `globals.css`: spacing for `<p>`, `<ul>`, `<li>`, KaTeX block margin
9. Wire into `practice-session.tsx`:
   - `dynamic()` import card + drawer
   - Render `NoteCard` when `showCard && note`
   - Render `NoteDrawerToggle` in progress header when `note != null`
   - Render `NoteDrawer` with `drawerOpen` state
10. Run `npm run typecheck && npm run lint && npm run build`
11. Manual visual QA: populate one row in DB; navigate to `/student/practice/{skillKey}`; verify card → drawer → drawer auto-close on first input

## Todo List

- [ ] Install react-markdown + remark-math + rehype-katex
- [ ] `note-markdown.tsx` renderer
- [ ] `note-tone-tokens.ts` map
- [ ] `note-section.tsx` (auto-hide on null body)
- [ ] `note-card.tsx` pre-session full card
- [ ] `note-drawer.tsx` Radix dialog
- [ ] `note-drawer-toggle.tsx` toggle button
- [ ] `.prose-note` CSS
- [ ] Lazy-load card + drawer in practice-session
- [ ] Drawer auto-closes on first input
- [ ] typecheck + lint + build green
- [ ] Manual smoke test mobile + desktop viewports

## Success Criteria

- Card displays before practice starts when note != null
- Drawer toggle invisible/disabled when note == null (no DOM noise)
- KaTeX renders identically inside notes vs. existing problem statements
- Bundle delta: practice page ≤ +20KB gz total (react-markdown + plugins)
- Lighthouse a11y score on practice page ≥ baseline
- Reduced-motion media query: card and drawer skip animations

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| `react-markdown` v9 + Next 16 ESM compat issue | Low | High | Pin known-good versions; smoke test in `npm run build` before broader use |
| KaTeX block math vertical rhythm clashes with `.prose-note` defaults | Medium | Low | Override `.prose-note .katex-display { margin: 0.75rem 0 }` |
| Drawer focus trap fights with input adapter focus on auto-close | Medium | Medium | On auto-close, return focus to question input via `inputRef.focus()` |
| Mobile bottom sheet covers virtual keyboard | Medium | Low | Drawer max-height 85vh; not invoked while typing (auto-close on first input) |
| File length exceeds 200-line rule | Medium | Low | Split: `note-card.tsx` (layout) + `note-section.tsx` (section row) + `note-markdown.tsx` (renderer) keeps each ≤120 lines |
| Theme color tokens (`mint-*`, `sun-*`) missing | Medium | Low | Step 1 verify against `globals.css`; add tokens if absent |

## Security Considerations

- `react-markdown` defaults: no raw HTML, no script execution → safe for Markdown
- `skipHtml` flag adds belt-and-braces protection
- `rehype-katex` only renders math; does not execute JS
- KaTeX has no JS execution surface (CSS+SVG output only)
- No URL embedding in Markdown links → if seeds add links later, audit in Phase 04/05 review

## Next Steps

- Phase 04/05 author Markdown content that this UI renders
- Phase 06 adds component snapshot tests and a11y assertions

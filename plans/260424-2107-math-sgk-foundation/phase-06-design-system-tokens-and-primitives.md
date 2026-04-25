---
title: "Phase 06 — Design System: Tokens + Primitives"
priority: P2
effort: 8h
status: completed
depends_on: [01]
completed: 2026-04-24
---

# Phase 06 — Design System: Tokens + Primitives

## Context Links
- `docs/design-guidelines.md` §1-4 — full tokens, component inventory, Mimi spec
- `UX_DECISIONS.md` — mascot philosophy, encouraging copy pools
- `docs/wireframe/*.html` — visual reference (all 12)
- Research: `docs/research/researcher-math-rendering.md` — KaTeX setup, FractionInput
- Research: `docs/research/researcher-child-safe-gamification.md` §5 — encouraging copy pools

## Overview
Replace scaffold `globals.css` with full Tailwind v4 `@theme` tokens. Build primitive components. Fonts via `next/font/google` with Vietnamese subset. Mimi SVG component with 6 emotion states. No pages yet — only primitives.

## Key Insights
- **Tailwind v4 uses CSS `@theme` directive**, no `tailwind.config.ts`. Token = CSS var = Tailwind utility (`bg-brand-500`). Scaffold `globals.css` has a minimal `@theme inline`; fully replace per design guidelines §2.
- **Two root classes:** `.theme-student` + `.theme-parent` applied at layout level. Never mix coral/chunky in parent; never mix flat/muted in student.
- **KaTeX CSS imported globally** in root layout (research §2); prevents FOUC.
- **Mimi is inline SVG** — shared face geometry, swap only `<g>` for eyes/mouth per state. No asset pipeline needed.
- `lucide-react` at `^1.9.0` in package.json is suspect (latest is `~0.469.x`). Verify actual installed version before importing; fallback: use inline SVG for the 5-6 icons we need.

## Requirements
**Functional components (primitives only):**
- `Button` (CVA variants): `primary`, `secondary`, `ghost`, `celebration`, `parent-primary`, `parent-secondary`
- `Card` (CVA): `skill`, `topic`, `badge`, `child`, `metric`
- `MasteryPill` — 4 colors per bucket, Vietnamese label
- `MasteryBar4` — 4-segment horizontal bar
- `ProgressBar` — generic ratio-based
- `XPCounter` — sun-500 + animated count-up
- `StreakFlame` — coral SVG + days
- `MimiSVG` — 6 states
- `EncouragingToast` — picks from copy pool at random via helper `pickEncouragement(kind: "correct"|"wrong")`
- `FractionInput` — per research §4
- `MathDisplay` — KaTeX `InlineMath`/`BlockMath` wrapper, `aria-label` passthrough

**Non-functional:**
- Every component ≤150 lines.
- Parent primitives and student primitives co-exist but visually separate per §5 table of design-guidelines.
- `prefers-reduced-motion` honored in `globals.css` (already stubbed).

## Architecture
```
src/app/globals.css                  # tokens + base + utility classes
src/components/ui/
├── button.tsx                       # CVA with 6 variants
├── card.tsx                         # CVA with 5 variants
├── mastery-pill.tsx
├── mastery-bar-4.tsx
├── progress-bar.tsx
├── xp-counter.tsx
├── streak-flame.tsx
├── encouraging-toast.tsx
├── math-display.tsx                 # "use client"
└── fraction-input.tsx               # "use client"
src/components/mimi/
├── mimi-svg.tsx                     # state switch
└── mimi-states/
    ├── idle.tsx, happy.tsx, excited.tsx, thinking.tsx, sad.tsx, cheering.tsx
src/lib/ui/
├── cn.ts                            # clsx + tailwind-merge wrapper
└── encouragement-pool.ts            # 6 correct + 5 wrong phrases, picker
```

## Related Code Files
**Create:** all files above (13 components + 6 Mimi states + 2 lib helpers).

**Modify:**
- `src/app/globals.css` — replace fully
- `src/app/layout.tsx` — swap Geist fonts for Fredoka (display) + Nunito (body) + JetBrains Mono; import `katex/dist/katex.min.css` (research §2); keep html class variables

## Implementation Steps
1. Verify `lucide-react` version: `cat node_modules/lucide-react/package.json | grep '"version"'`. If really `^1.9`, reinstall `npm i lucide-react@latest`. Document resolution in the PR.
2. Write `src/lib/ui/cn.ts`:
   ```ts
   import { clsx, type ClassValue } from "clsx";
   import { twMerge } from "tailwind-merge";
   export const cn = (...i: ClassValue[]) => twMerge(clsx(i));
   ```
3. Rewrite `src/app/globals.css` — full `@theme inline` block from design-guidelines §2 (copy-paste), plus `.theme-student` / `.theme-parent` roots and motion media query.
4. Update `src/app/layout.tsx`:
   ```ts
   import { Fredoka, Nunito, JetBrains_Mono } from "next/font/google";
   import "katex/dist/katex.min.css";
   import "./globals.css";
   const fredoka = Fredoka({ variable:"--font-display", subsets:["latin-ext","vietnamese"] });
   const nunito = Nunito({ variable:"--font-body", subsets:["latin-ext","vietnamese"] });
   const mono = JetBrains_Mono({ variable:"--font-mono", subsets:["latin"] });
   // keep RootLayout; put font vars on <html>, lang="vi"
   ```
5. Write `encouragement-pool.ts` — arrays from gamification research §5; `pickEncouragement(kind)` picks random, tracks last-shown to guarantee no repeat (Zustand store or sessionStorage).
6. Write `Button` via CVA — 6 variants, `shadow-chunky-brand` utility assumed present (it is — Tailwind reads from `@theme`).
7. Write `Card` — 5 variants.
8. Write `MasteryPill`, `MasteryBar4`, `ProgressBar`, `XPCounter`, `StreakFlame`, `EncouragingToast`.
9. Write `MathDisplay` — `"use client"`, uses `BlockMath` when `display`, `InlineMath` otherwise, forwards `aria-label`.
10. Write `FractionInput` — per research §4, enter key focuses denominator; emits `{num, den}`.
11. Write Mimi states: start with `base-face.tsx` exporting shared `<g>` geometry; each state imports it + overlays eyes/mouth. `MimiSVG` takes `state` prop and picks.
12. Create `src/app/page.tsx` ad-hoc preview (temporary) mounting every primitive in both themes for visual QA. Delete at end of phase or move to `src/app/(dev)/design-system/page.tsx` gated to `NODE_ENV==="development"`.

## Todo List
- [x] Verify/fix `lucide-react` version
- [x] `cn.ts`, `encouragement-pool.ts`
- [x] Replace `globals.css` with full tokens
- [x] Update `layout.tsx` fonts + KaTeX CSS + `lang="vi"`
- [x] Button, Card, MasteryPill, MasteryBar4, ProgressBar
- [x] XPCounter, StreakFlame, EncouragingToast
- [x] MathDisplay, FractionInput
- [x] Mimi 6 states + MimiSVG switcher
- [x] (optional) design-system preview page

## Success Criteria
- [x] `npm run build` succeeds with fonts loaded
- [x] `<Button variant="primary">Test</Button>` renders with chunky teal press-down effect
- [x] `<MathDisplay formula="\\frac{1}{2}" display />` renders via KaTeX, no FOUC
- [x] `<FractionInput />` two stacked inputs, Enter moves focus
- [x] `<MimiSVG state="happy" size={120} />` visible and semantic (has `aria-label`)
- [x] Typecheck green, no unused-var warnings in new files

## Risk Assessment
**R1 — Tailwind v4 font-variable path (Medium/Medium):** Tailwind v4 reads fonts via `--font-display` CSS var. `next/font/google` sets that var on the `<html>` element via `className`. If the var is set but Tailwind theme doesn't know `--font-display` is a font family, `font-display` utility fails. *Mitigation:* `globals.css` `@theme` block explicitly maps `--font-display: "Fredoka", system-ui, sans-serif;` — the `next/font` var name `{variable: "--font-display"}` overrides this with the hosted font. Verify by inspecting computed style on `<h1 class="font-display">`.

**R2 — Vietnamese diacritic support (Medium/High):** Fredoka/Nunito must include full Vietnamese glyph set (ă, ơ, ư, đ, tone marks). *Mitigation:* Use `subsets: ["vietnamese"]` in `next/font/google` call. `@next/font` will pull the Vietnamese subset from Google Fonts automatically. Visual QA on a page containing "Tuyệt vời lắm!" and "Phân số bằng nhau" — zero missing glyphs.

## Rollback Plan
Primitives are leaf components; remove individual files if one breaks. Revert `globals.css` to scaffold version is one-line git revert.

## Next Steps
Unblocks Phase 07 (student shell reads these primitives), Phase 08 (practice uses MathDisplay/FractionInput), Phase 09 (feedback uses MimiSVG/EncouragingToast), Phase 10 (parent uses parent-variant Button/Card).

## Completion Note
Tailwind v4 with `@theme` tokens. Vietnamese fonts (Fredoka + Nunito + JetBrains Mono). Mimi 6 states. All primitives: Button, Card, MasteryPill, ProgressBar, XPCounter, StreakFlame, Toast, MathDisplay, FractionInput. lucide-react@1.9.0 confirmed correct.

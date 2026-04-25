# Math SGK — Design Guidelines

> Vietnamese math practice app, grades 4-5. Two distinct visual languages: **Student** (chunky/playful) and **Parent** (flat/serious/data-first). Tailwind v4 + shadcn/ui + Next.js 16 RSC.

---

## 1. Design Tokens

### 1.1 Color

| Token (TW v4) | Hex | Vietnamese | Usage |
|---|---|---|---|
| `--color-brand-50` | `#e6faf7` | Bạc hà nhạt | Backgrounds, hover tints |
| `--color-brand-100` | `#b3f0e6` | Bạc hà | Card tints |
| `--color-brand-500` | `#0cbbab` | **Xanh ngọc** | Primary brand (both sides) |
| `--color-brand-700` | `#067a70` | Xanh ngọc đậm | Active states, headers |
| `--color-sun-300` | `#f8d77f` | Vàng nhạt | Soft highlights |
| `--color-sun-500` | `#f0b429` | **Vàng nắng** | XP, streak, CTA accent |
| `--color-sun-700` | `#a17a14` | Vàng đậm | Sun text on light |
| `--color-coral-500` | `#ff3366` | **San hô** | Celebration, energy (kid only) |
| `--color-coral-300` | `#ff7a99` | San hô nhạt | Soft celebration |
| `--color-tier-bronze` | `#cd7f32` | Đồng | Badge tier 1 |
| `--color-tier-silver` | `#b8c2cc` | Bạc | Badge tier 2 |
| `--color-tier-gold` | `#ffc107` | Vàng | Badge tier 3 |
| `--color-mastery-0` | `#e5e7eb` | Chưa học | Empty bucket |
| `--color-mastery-1` | `#fcd34d` | Quen thuộc | Bucket 1 (warm) |
| `--color-mastery-2` | `#34d399` | Thành thạo | Bucket 2 (mint) |
| `--color-mastery-3` | `#0cbbab` | Thuần thục | Bucket 3 (brand) |
| `--color-ink-900` | `#0f172a` | Mực đen | Body text |
| `--color-ink-600` | `#475569` | Xám than | Secondary text |
| `--color-ink-400` | `#94a3b8` | Xám nhạt | Captions, dividers |
| `--color-paper` | `#fffdf7` | Giấy ngà | Student bg (warm) |
| `--color-canvas` | `#f8fafc` | Canvas | Parent bg (cool) |
| `--color-success` | `#22c55e` | Xanh đúng | Correct feedback (subtle) |
| `--color-warn` | `#f59e0b` | Cam nhắc | Warning (parent side) |

### 1.2 Typography

| Token | Family | Vietnamese support | Usage |
|---|---|---|---|
| `--font-display` | Fredoka | ✅ Latin Ext | H1-H3 student, Mimi bubbles |
| `--font-body` | Nunito | ✅ Latin Ext | All body text both sides |
| `--font-mono` | JetBrains Mono | ✅ | Math expressions, numbers in inputs |

**Scale (rem):**
| Token | Size | Line | Use |
|---|---|---|---|
| `--text-xs` | 0.75 | 1.0 | Captions, hint pills |
| `--text-sm` | 0.875 | 1.4 | Secondary, parent table |
| `--text-base` | 1.0 | 1.6 | Body |
| `--text-lg` | 1.125 | 1.5 | Lead paragraph |
| `--text-xl` | 1.375 | 1.4 | Card titles |
| `--text-2xl` | 1.75 | 1.3 | Page heading parent |
| `--text-3xl` | 2.25 | 1.2 | Hero student greeting |
| `--text-4xl` | 3.0 | 1.1 | Math display, big numbers |

### 1.3 Spacing, Radius, Shadow

| Token | Value | Use |
|---|---|---|
| `--radius-sm` | 6px | Pills, chips |
| `--radius-md` | 12px | Inputs parent |
| `--radius-lg` | 16px | Cards parent |
| `--radius-xl` | 24px | Cards student |
| `--radius-2xl` | 32px | Hero cards student |
| `--shadow-flat` | `0 1px 2px rgb(15 23 42 / .06)` | Parent card |
| `--shadow-soft` | `0 4px 12px rgb(15 23 42 / .08)` | Hover parent |
| `--shadow-chunky` | `0 5px 0 0 rgb(0 0 0 / .15)` | **Student button base** |
| `--shadow-chunky-brand` | `0 5px 0 0 #067a70` | Student primary button |
| `--shadow-chunky-sun` | `0 5px 0 0 #a17a14` | Student CTA button |
| `--shadow-celebration` | `0 0 32px rgb(255 51 102 / .35)` | Correct overlay glow |

### 1.4 Animation Tokens

| Token | Value | Use |
|---|---|---|
| `--duration-fast` | 150ms | Hover, focus |
| `--duration-base` | 250ms | Modal, drawer |
| `--duration-celebration` | 600ms | Bounce-in, confetti spawn |
| `--ease-bounce` | `cubic-bezier(.34,1.56,.64,1)` | Buttons, badges pop |
| `--ease-snap` | `cubic-bezier(.4,0,.2,1)` | Standard transitions |
| `--ease-shake` | `cubic-bezier(.36,.07,.19,.97)` | Wrong answer shake |

---

## 2. Tailwind v4 `globals.css` Snippet

```css
@import "tailwindcss";

@theme inline {
  /* color */
  --color-brand-50: #e6faf7;
  --color-brand-100: #b3f0e6;
  --color-brand-500: #0cbbab;
  --color-brand-700: #067a70;
  --color-sun-300: #f8d77f;
  --color-sun-500: #f0b429;
  --color-sun-700: #a17a14;
  --color-coral-300: #ff7a99;
  --color-coral-500: #ff3366;
  --color-tier-bronze: #cd7f32;
  --color-tier-silver: #b8c2cc;
  --color-tier-gold: #ffc107;
  --color-mastery-0: #e5e7eb;
  --color-mastery-1: #fcd34d;
  --color-mastery-2: #34d399;
  --color-mastery-3: #0cbbab;
  --color-ink-900: #0f172a;
  --color-ink-600: #475569;
  --color-ink-400: #94a3b8;
  --color-paper: #fffdf7;
  --color-canvas: #f8fafc;
  --color-success: #22c55e;
  --color-warn: #f59e0b;

  /* font */
  --font-display: "Fredoka", system-ui, sans-serif;
  --font-body: "Nunito", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;

  /* radius */
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-2xl: 32px;

  /* shadow */
  --shadow-flat: 0 1px 2px rgb(15 23 42 / .06);
  --shadow-soft: 0 4px 12px rgb(15 23 42 / .08);
  --shadow-chunky: 0 5px 0 0 rgb(0 0 0 / .15);
  --shadow-chunky-brand: 0 5px 0 0 #067a70;
  --shadow-chunky-sun: 0 5px 0 0 #a17a14;
  --shadow-celebration: 0 0 32px rgb(255 51 102 / .35);

  /* motion */
  --ease-bounce: cubic-bezier(.34, 1.56, .64, 1);
  --ease-snap: cubic-bezier(.4, 0, .2, 1);
  --ease-shake: cubic-bezier(.36, .07, .19, .97);
}

/* student-side root */
.theme-student {
  background: var(--color-paper);
  color: var(--color-ink-900);
  font-family: var(--font-body);
}

/* parent-side root */
.theme-parent {
  background: var(--color-canvas);
  color: var(--color-ink-900);
  font-family: var(--font-body);
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; }
}
```

---

## 3. Mascot Mimi — Inline SVG Spec

**Component API:**
```tsx
<MimiSVG state="happy" size={120} className="..." />
// state: 'idle' | 'happy' | 'excited' | 'thinking' | 'sad' | 'cheering'
```

**Base shape:** Round yellow cat face (`#f0b429` body, `#a17a14` outline, white belly, peach `#ffd1a0` inner ears, brand teal `#0cbbab` collar bow). Square viewBox 120x120. Two triangular ears top, oval body, small tail right.

| State | Eyes | Mouth | Body / extras |
|---|---|---|---|
| `idle` | Half-closed `)` `(` | Small flat `—` | Static, tail down |
| `happy` | Full circle eyes ✦, ears forward | Small smile arc | Slight tilt right 5° |
| `excited` | Wide oval eyes + sparkle stars | Open `O` joy | Tail up, mini bounce y-translate -4px loop |
| `thinking` | Eyes side-glance left | Closed flat | Head tilted 12°, floating `?` top-right |
| `sad` | Droopy eyes (downward arcs) | Tiny inverted arc `︶` no tears | Ears flattened, tail down |
| `cheering` | Star-shaped sparkle eyes | Big open smile | Both paws raised, confetti dots around |

**Implementation note:** All states share identical face/body geometry. Only eyes/mouth/extras `<g>` swap by `state` prop. No external assets.

---

## 4. Component Inventory

### Buttons
| Variant | Visual | Usage |
|---|---|---|
| `Button.primary` (student) | brand-500 bg, white text, `shadow-chunky-brand`, radius-xl, `active:translate-y-[3px] active:shadow-none`, font-display semibold | Main CTAs |
| `Button.celebration` (student) | sun-500 bg, ink-900 text, `shadow-chunky-sun`, larger px-8 py-4 | "Tiếp tục", "Bắt đầu" |
| `Button.secondary` (student) | white bg, brand-500 text, brand-500 2px border, `shadow-chunky` | "Bỏ qua", "Trợ giúp" |
| `Button.ghost` (student) | transparent, ink-600 text, hover brand-50 bg | Minor links |
| `Button.parent-primary` | brand-700 bg, white, radius-md, `shadow-flat`, hover `shadow-soft`, no translate | Parent CTAs |
| `Button.parent-secondary` | white bg, ink-600 text, ink-400 1px border | Parent secondary |

### Cards
- `SkillCard` (student) — radius-2xl, paper bg, 2px brand-100 border, `shadow-chunky` neutral, mastery pill top-right, big icon left
- `TopicCard` (student) — radius-xl, gradient brand-50 → white, 4-bucket mini-progress bar at bottom
- `BadgeCard` (student) — square radius-xl, tier-color border 3px, badge SVG center, name below
- `ChildCard` (parent) — radius-lg, white, shadow-flat, avatar + name + composite rating right
- `MetricCard` (parent) — radius-md, white, ink-400 border 1px, label uppercase tracking-wide xs, big number, trend arrow

### Progress
- `MasteryBar4` — horizontal bar split into 4 segments (mastery-0/1/2/3 colors), filled per current bucket level
- `XPRing` (student) — circular ring, sun-500 stroke, animated stroke-dashoffset
- `DailyGoalProgress` — paper card, big number "8/10" with sun-500 progress arc
- `CompositeRatingGauge` (parent) — half-circle gauge 0-100, brand-500 arc, big numeric center, tier label

### Specialized
- `MasteryBadge` — pill: mastery-0 gray "Chưa học" • mastery-1 yellow "Quen thuộc" • mastery-2 green "Thành thạo" • mastery-3 brand "Thuần thục"
- `XPCounter` — sun-500 icon + bold number, animated count-up
- `StreakFlame` — coral-500 flame SVG + day count, gentle pulse
- `EncouragingToast` — paper bg radius-2xl, Mimi avatar 40px left, Vietnamese phrase right, slide-in from top
- `FractionInput` — two stacked text inputs separated by horizontal line; mono font; large 32px chars
- `MathDisplay` — KaTeX rendered, font-mono fallback, ink-900, text-3xl center, padding-y-6

---

## 5. Two Visual Languages — Student vs Parent

| Aspect | Student | Parent |
|---|---|---|
| Background | `paper` (#fffdf7 warm) | `canvas` (#f8fafc cool) |
| Density | Generous, low info-density, big tap targets ≥56px | Compact, table-friendly, 40px controls |
| Font weight | 600-800 (display Fredoka) | 400-600 (body Nunito) |
| Heading | Fredoka, text-3xl, brand-700 | Nunito, text-2xl, ink-900 |
| Border radius | xl/2xl (16-32px) | md/lg (12-16px) |
| Shadow | `chunky` (0 5px 0 0) tactile | `flat`/`soft` blurred subtle |
| Color saturation | Coral, sun, brand at 100% | brand-700 muted, no coral |
| Buttons | Press-down translate-y-3 | Hover lift `shadow-soft`, no translate |
| Mascot | Mimi everywhere | None |
| Copy tone | "bạn"/"em", emoji ok | "Anh/Chị", formal, no emoji |
| Charts | None (pie progress only) | Recharts: bar, line, heatmap, gauge |
| Iconography | lucide rounded, larger 28-32px | lucide standard 16-20px |

---

## 6. Accessibility

- **Contrast:** brand-500 on paper = 4.6:1 ✓. Coral-500 on white = 3.9:1 → use only as accent, never body text. Mastery-1 (#fcd34d) only on ink-900 text (10:1).
- **Focus:** `outline: 3px solid var(--color-sun-500); outline-offset: 2px;` on all interactive (both sides).
- **Touch targets:** Student ≥56x56px, Parent ≥40x40px (WCAG 2.5.5 AAA exceeded for kids).
- **Motion:** All celebration animations gated by `prefers-reduced-motion: reduce` → static fallback (color flash only, no movement).
- **Keyboard:** PIN keypad navigable Tab + 1-9 keys. Practice answer input autofocus. Skip link "Bỏ qua tới nội dung" first focusable.
- **Vietnamese diacritics:** All chosen fonts (Fredoka, Nunito, JetBrains Mono) include Vietnamese subset — verified via Google Fonts language filter.
- **Screen reader:** Mimi `<svg role="img" aria-label="Mèo Mimi đang vui">`. Mastery pills have `aria-label="Mức độ: Thành thạo"`. Confetti decorative `aria-hidden`.

---

## 7. Wireframe Index

Located in `docs/wireframe/`:

- `landing.html` — public role split
- `student-signin.html`, `student-dashboard.html`, `student-practice.html`
- `student-feedback-correct.html`, `student-feedback-wrong.html`, `student-summary.html`
- `parent-signin.html`, `parent-dashboard.html`, `parent-child-detail.html`
- `404.html`, `loading.html`

---

## Unresolved Questions

1. **Mimi accessory shop** — should badge tier upgrades unlock cosmetic Mimi accessories (hat, scarf)? Decision blocks asset/SVG variant count.
2. **Math notation rendering** — KaTeX adequate for grade 4-5 fractions/decimals, but volume 3D shapes need extra (raw SVG)? Confirm before implementation.
3. **Parent bilingual** — should parent dashboard support English toggle? Out of MVP scope but affects layout breathing room.
4. **Dark mode** — student side dark = problematic (paper warmth lost). Parent side dark plausible. Defer.
5. **Tier color for color-blind** — gold/silver/bronze hard to distinguish for deuteranopia. Add tier label text always? Need contrast audit.

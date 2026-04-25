# Math Rendering Research: Vietnamese Math Practice App
**Date:** 2026-04-24 | **Stack:** React 19 + Next.js 16 App Router + TypeScript

---

## 1. Library Selection: KaTeX via `react-katex`

**Recommendation: `react-katex` (v3.1.0)**

| Criteria | KaTeX Core | react-katex | better-react-mathjax | @matejmazur/react-katex |
|----------|-----------|-------------|---------------------|------------------------|
| Maintenance | ✅ Active (0.16.45, 16d old) | ✅ Stable (3.1.0, 1yr) | ❌ Unmaintained | ✅ Maintained |
| React 19 compat | N/A (direct lib) | ✅ Yes | ⚠️ Unknown | ✅ Yes |
| Next.js SSR | Needs `use client` | ✅ Designed for it | ⚠️ Risky | ✅ Works |
| Bundle size | 347.5 kB | Minimal wrapper | Larger | Similar |
| Accessibility | ❌ Limited | ✅ Via aria-label | Partial | Partial |

**Why react-katex:** Single responsibility wrapper, active KaTeX dependency, proven SSR/App Router integration, simplest API for Next.js teams.

---

## 2. SSR & Next.js App Router Strategy

**Font Loading & FOUC Prevention:**
- Import KaTeX CSS globally in root layout, NOT component files (prevents dynamic CSS anti-pattern)
- Use KaTeX's default `font-display: block` (prevents Flash of Unstyled Text)
- Preload fonts via `<link rel="preload">` in `layout.tsx` for critical math fonts
- Leverage Next.js built-in font optimization: fonts are auto-self-hosted and avoid layout shift

**App Router Pattern:**
```tsx
// app/layout.tsx (Server Component)
import 'katex/dist/katex.min.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  )
}

// app/problems/page.tsx (Server Component) → calls <MathProblem />
```

**Client Boundary:**
```tsx
// components/MathProblem.tsx (Client Component)
'use client'
import { Math } from '@/components/math'
```

---

## 3. `<Math>` Component API

**TypeScript Interface & Implementation:**
```tsx
interface MathProps {
  formula: string;          // TeX input: "\\frac{1}{2}"
  display?: boolean;        // true = block, false = inline (default)
  ariaLabel?: string;       // Screen reader text
  className?: string;       // Tailwind classes
}

export function Math({ formula, display = false, ariaLabel, className }: MathProps) {
  return (
    <span
      className={cn('inline-math', className)}
      role={ariaLabel ? 'img' : undefined}
      aria-label={ariaLabel}
    >
      <InlineMath math={formula} />
    </span>
  )
}

// Usage:
<Math formula="\frac{1}{2} + \frac{3}{4}" display ariaLabel="One half plus three quarters" />
```

---

## 4. Stacked Fraction Input Component

**Problem:** KaTeX renders display math beautifully, but students need custom two-input UI for answers.

**`<FractionInput>` Implementation:**
```tsx
interface FractionInputProps {
  value?: { numerator: number; denominator: number }
  onChange: (value: { numerator: number; denominator: number }) => void
  onBlur?: () => void
  disabled?: boolean
}

export function FractionInput({ value = { numerator: 0, denominator: 1 }, onChange, onBlur, disabled }: FractionInputProps) {
  const numRef = useRef<HTMLInputElement>(null)
  const denRef = useRef<HTMLInputElement>(null)

  const handleNumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseInt(e.target.value, 10) || 0
    onChange({ ...value, numerator: num })
  }

  const handleNumKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') denRef.current?.focus()
  }

  return (
    <div className="flex flex-col items-center gap-0">
      <input
        ref={numRef}
        type="number"
        value={value.numerator || ''}
        onChange={handleNumChange}
        onKeyDown={handleNumKeyDown}
        disabled={disabled}
        className="w-16 h-8 text-center border-0 border-b-2"
        aria-label="Numerator"
      />
      <div className="w-16 h-px bg-black my-1" />
      <input
        ref={denRef}
        type="number"
        value={value.denominator || ''}
        onChange={(e) => onChange({ ...value, denominator: parseInt(e.target.value, 10) || 1 })}
        onBlur={onBlur}
        disabled={disabled}
        min="1"
        className="w-16 h-8 text-center border-0"
        aria-label="Denominator"
      />
    </div>
  )
}
```

**Accessibility:** ARIA labels on each field; Enter key navigates numerator→denominator; denominator min=1 validation prevents division by zero.

---

## 5. Vietnamese Decimal Separator Handling

**Vietnam Standard:** Decimal separator is comma ("0,5"), not period.

**Strategy:**
- **Display layer (KaTeX):** Pass comma-formatted formula to `<Math>` (KaTeX renders as-is)
  ```tsx
  <Math formula="\\frac{1}{2} = 0\\text{,}5" ariaLabel="One half equals zero comma five" />
  ```
- **Input layer (FractionInput):** Two `<input type="number">` fields use browser's locale. For decimal input (if added), use `Intl.NumberFormat`:
  ```tsx
  const formatter = new Intl.NumberFormat('vi-VN')
  const displayValue = formatter.format(0.5) // "0,5"
  ```
- **Validation:** Store internally as float (dot), display as comma in UI. Replace on form submit:
  ```tsx
  const submit = (value: string) => {
    const normalized = value.replace(',', '.') // "0,5" → "0.5"
    // validate & submit normalized value
  }
  ```

---

## 6. Geometry Diagrams: SVG Inline (MVP Recommendation)

**Why SVG inline (not libraries):**
- No dependency bloat for education app
- Full control over hình tròn, hình tam giác, hình chữ nhật rendering
- Integrates naturally with React components
- Accessible via `<title>` and `<desc>` tags

**Minimal Example:**
```tsx
export function Triangle({ width = 100, height = 100 }: { width?: number; height?: number }) {
  return (
    <svg width={width} height={height} viewBox="0 0 100 100" role="img" aria-label="Equilateral triangle">
      <title>Hình tam giác đều</title>
      <polygon points="50,10 90,90 10,90" fill="none" stroke="black" strokeWidth="2" />
    </svg>
  )
}
```

**For complex diagrams (multi-shape, labels):** Use SVGR to generate reusable components from `.svg` files. Don't add diagram libraries (Diagrams.net, Excalidraw) until feature demand justifies the overhead.

---

## 7. Worked Example: "1/2 + 3/4 = ?"

```tsx
// Problem component
export function ProblemAddFractions() {
  const [answer, setAnswer] = useState<{ numerator: number; denominator: number }>()

  return (
    <div className="space-y-6">
      {/* Display problem */}
      <div className="text-lg">
        <Math 
          formula="\\frac{1}{2} + \\frac{3}{4} = \\enspace ?"
          display
          ariaLabel="One half plus three quarters equals question mark"
        />
      </div>

      {/* Student input */}
      <div>
        <label className="block text-sm mb-2">Lời giải:</label>
        <FractionInput
          value={answer}
          onChange={setAnswer}
        />
      </div>

      {/* Show work (optional) */}
      {answer && (
        <div className="text-sm text-gray-600">
          <Math
            formula={`\\text{Kết quả: } \\frac{${answer.numerator}}{${answer.denominator}}`}
            ariaLabel={`Result: ${answer.numerator} over ${answer.denominator}`}
          />
        </div>
      )}
    </div>
  )
}
```

---

## Summary & Recommendations

1. **Use `react-katex` v3.1.0** — stable, Next.js App Router compatible, minimal overhead
2. **Mark math components with `'use client'`** — KaTeX is inherently client-side
3. **Import KaTeX CSS globally** in root layout to prevent FOUC/dynamic CSS issues
4. **Custom `<FractionInput>`** — two stacked number fields, no library wrapper needed
5. **Vietnamese comma decimals** — handle in display (KaTeX `\text{,}`) and validation layer
6. **SVG inline for diagrams** — start with simple shapes; add libraries only if complexity grows
7. **Accessibility first** — use `aria-label` on `<Math>`, `aria-label` on fraction inputs

**Next Phase:** Build `<MathEditor>` component for teacher problem creation (interactive KaTeX input with live preview).

---

## Unresolved Questions
- Should stacked fractions auto-reduce (simplify) on input? Need product owner confirmation.
- Will equations use Vietnamese numerals (optional feature)? Current plan: Arabic numerals only.
- Keyboard navigation for multi-digit numbers in FractionInput—allow backspace to clear vs. decrement behavior?

---

## Sources
- [Next.js App Router: Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [KaTeX Documentation: Browser & Extensions](https://katex.org/docs/browser.html)
- [How to use KaTeX in Next.js (Vercel Discussion)](https://github.com/vercel/next.js/discussions/15479)
- [FOUC Prevention in Next.js App Router](https://dev.to/amritapadhy/understanding-fixing-fouc-in-nextjs-app-router-2025-guide-ojk)
- [React Aria: useNumberField](https://react-spectrum.adobe.com/react-aria/useNumberField.html)
- [Vietnamese Decimal Separator Handling](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat)
- [KaTeX vs. MathJax Comparison](https://www.intmath.com/cg5/katex-mathjax-comparison.php)
- [SVG in React Best Practices](https://www.logrocket.com/blog/how-to-use-svgs-in-react/)
- [react-katex npm](https://www.npmjs.com/package/react-katex)

import * as React from "react";
import { cn } from "@/lib/ui/cn";

export type MimiState = "idle" | "happy" | "excited" | "thinking" | "sad" | "cheering";

export interface MimiSVGProps {
  state?: MimiState;
  size?: number;
  className?: string;
}

/* ── Shared face/body geometry ────────────────────────────────────────── */
function BaseFace() {
  return (
    <>
      {/* Body */}
      <ellipse cx="60" cy="72" rx="32" ry="28" fill="#f0b429" stroke="#a17a14" strokeWidth="2" />
      {/* Belly */}
      <ellipse cx="60" cy="78" rx="18" ry="14" fill="#fffdf7" opacity="0.7" />
      {/* Head */}
      <circle cx="60" cy="44" r="28" fill="#f0b429" stroke="#a17a14" strokeWidth="2" />
      {/* Left ear */}
      <polygon points="36,22 28,6 44,18" fill="#f0b429" stroke="#a17a14" strokeWidth="2" />
      <polygon points="37,20 31,10 42,18" fill="#ffd1a0" />
      {/* Right ear */}
      <polygon points="84,22 92,6 76,18" fill="#f0b429" stroke="#a17a14" strokeWidth="2" />
      <polygon points="83,20 89,10 78,18" fill="#ffd1a0" />
      {/* Collar bow — teal brand */}
      <rect x="46" y="96" width="28" height="6" rx="3" fill="#0cbbab" />
      <polygon points="46,99 38,94 38,104" fill="#0cbbab" />
      <polygon points="74,99 82,94 82,104" fill="#0cbbab" />
      <circle cx="60" cy="99" r="4" fill="#067a70" />
      {/* Nose */}
      <ellipse cx="60" cy="48" rx="4" ry="2.5" fill="#a17a14" />
      {/* Whiskers left */}
      <line x1="32" y1="46" x2="54" y2="49" stroke="#a17a14" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="32" y1="50" x2="54" y2="51" stroke="#a17a14" strokeWidth="1.2" strokeLinecap="round" />
      {/* Whiskers right */}
      <line x1="88" y1="46" x2="66" y2="49" stroke="#a17a14" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="88" y1="50" x2="66" y2="51" stroke="#a17a14" strokeWidth="1.2" strokeLinecap="round" />
      {/* Tail */}
      <path d="M92,80 Q106,70 100,58" stroke="#f0b429" strokeWidth="6" strokeLinecap="round" fill="none" />
    </>
  );
}

/* ── Eye/mouth layers per state ─────────────────────────────────────── */
function EyesIdle() {
  return (
    <>
      <path d="M48,42 Q51,40 54,42" stroke="#0f172a" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M66,42 Q69,40 72,42" stroke="#0f172a" strokeWidth="2" fill="none" strokeLinecap="round" />
      <line x1="50" y1="56" x2="70" y2="56" stroke="#a17a14" strokeWidth="1.5" strokeLinecap="round" />
    </>
  );
}

function EyesHappy() {
  return (
    <>
      <circle cx="51" cy="41" r="5" fill="#0f172a" />
      <circle cx="69" cy="41" r="5" fill="#0f172a" />
      <circle cx="53" cy="39" r="1.5" fill="white" />
      <circle cx="71" cy="39" r="1.5" fill="white" />
      <path d="M50,56 Q60,62 70,56" stroke="#a17a14" strokeWidth="2" fill="none" strokeLinecap="round" />
    </>
  );
}

function EyesExcited() {
  return (
    <>
      <ellipse cx="51" cy="41" rx="6" ry="7" fill="#0f172a" />
      <ellipse cx="69" cy="41" rx="6" ry="7" fill="#0f172a" />
      <circle cx="53" cy="38" r="2" fill="white" />
      <circle cx="71" cy="38" r="2" fill="white" />
      {/* Sparkle stars */}
      <text x="38" y="32" fontSize="10" fill="#f0b429">✦</text>
      <text x="76" y="30" fontSize="8" fill="#f0b429">✦</text>
      {/* Open joy mouth */}
      <ellipse cx="60" cy="57" rx="8" ry="5" fill="#a17a14" />
      <ellipse cx="60" cy="56" rx="7" ry="3" fill="#ffd1a0" />
    </>
  );
}

function EyesThinking() {
  return (
    <>
      {/* Side-glance left */}
      <circle cx="49" cy="41" r="5" fill="#0f172a" />
      <circle cx="67" cy="41" r="5" fill="#0f172a" />
      <circle cx="48" cy="40" r="1.5" fill="white" />
      <circle cx="66" cy="40" r="1.5" fill="white" />
      {/* Flat mouth */}
      <line x1="52" y1="56" x2="68" y2="56" stroke="#a17a14" strokeWidth="1.5" strokeLinecap="round" />
      {/* Floating ? */}
      <text x="78" y="28" fontSize="14" fontWeight="bold" fill="#0cbbab">?</text>
    </>
  );
}

function EyesSad() {
  return (
    <>
      {/* Droopy downward arcs */}
      <path d="M46,43 Q51,40 56,43" stroke="#0f172a" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M64,43 Q69,40 74,43" stroke="#0f172a" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Inverted mouth (frown) */}
      <path d="M52,59 Q60,54 68,59" stroke="#a17a14" strokeWidth="2" fill="none" strokeLinecap="round" />
    </>
  );
}

function EyesCheering() {
  return (
    <>
      {/* Star sparkle eyes */}
      <text x="44" y="47" fontSize="14" fill="#f0b429">★</text>
      <text x="62" y="47" fontSize="14" fill="#f0b429">★</text>
      {/* Big open smile */}
      <path d="M48,57 Q60,68 72,57" stroke="#a17a14" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Paws raised */}
      <circle cx="28" cy="60" r="8" fill="#f0b429" stroke="#a17a14" strokeWidth="1.5" />
      <circle cx="92" cy="60" r="8" fill="#f0b429" stroke="#a17a14" strokeWidth="1.5" />
      {/* Confetti dots — decorative, aria-hidden on parent */}
      <circle cx="20" cy="30" r="3" fill="#ff3366" />
      <circle cx="100" cy="25" r="3" fill="#0cbbab" />
      <circle cx="15" cy="50" r="2" fill="#f0b429" />
      <circle cx="105" cy="45" r="2" fill="#fcd34d" />
    </>
  );
}

const STATE_TRANSFORMS: Record<MimiState, string> = {
  idle:     "",
  happy:    "rotate(5, 60, 60)",
  excited:  "translate(0, -4)",
  thinking: "rotate(12, 60, 60)",
  sad:      "",
  cheering: "",
};

const STATE_ARIA: Record<MimiState, string> = {
  idle:     "Mèo Mimi đang thư giãn",
  happy:    "Mèo Mimi đang vui",
  excited:  "Mèo Mimi đang hứng khởi",
  thinking: "Mèo Mimi đang suy nghĩ",
  sad:      "Mèo Mimi đang buồn",
  cheering: "Mèo Mimi đang cổ vũ",
};

const EYE_COMPONENTS: Record<MimiState, React.FC> = {
  idle:     EyesIdle,
  happy:    EyesHappy,
  excited:  EyesExcited,
  thinking: EyesThinking,
  sad:      EyesSad,
  cheering: EyesCheering,
};

/** Mimi cat mascot SVG — 6 emotional states via state prop.
 * When idle, the whole figure performs an ambient bob (token: --animate-mimi-bob)
 * so the mascot feels alive without distracting from content. Other states stop
 * the bob to let their distinctive transform (rotate, lift) read clearly. */
export function MimiSVG({ state = "idle", size = 120, className }: MimiSVGProps) {
  const Eyes = EYE_COMPONENTS[state];
  const transform = STATE_TRANSFORMS[state];
  const ariaLabel = STATE_ARIA[state];

  return (
    <svg
      role="img"
      aria-label={ariaLabel}
      width={size}
      height={size}
      viewBox="0 0 120 120"
      xmlns="http://www.w3.org/2000/svg"
      style={state === "idle" ? { animation: "var(--animate-mimi-bob)", transformOrigin: "60px 80px" } : undefined}
      className={cn("select-none", className)}
    >
      <g transform={transform}>
        <BaseFace />
        <Eyes />
      </g>
    </svg>
  );
}

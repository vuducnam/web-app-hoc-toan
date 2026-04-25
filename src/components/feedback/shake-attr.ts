// shake-attr.ts — helper for shake animation on wrong answers.
// Uses framer-motion variant values rather than CSS keyframes to keep
// prefers-reduced-motion support automatic (framer-motion reads the media query).

/** Framer-motion animate values for a 300ms horizontal shake */
export const SHAKE_ANIMATE = {
  x: [0, -8, 8, -8, 8, -4, 4, 0],
};

/** Framer-motion transition for shake — fast, snappy */
export const SHAKE_TRANSITION = {
  duration: 0.35,
  ease: "easeInOut",
} as const;

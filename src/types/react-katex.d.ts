/**
 * Type declarations for react-katex (package ships no .d.ts).
 * Covers InlineMath and BlockMath used in math-display.tsx.
 */
declare module "react-katex" {
  import type { ReactNode, FC } from "react";

  export interface MathProps {
    math?: string;
    children?: string;
    errorColor?: string;
    renderError?: (error: Error) => ReactNode;
  }

  export const InlineMath: FC<MathProps>;
  export const BlockMath: FC<MathProps>;
}

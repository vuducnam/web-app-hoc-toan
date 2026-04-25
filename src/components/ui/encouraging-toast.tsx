"use client";

import * as React from "react";
import * as Toast from "@radix-ui/react-toast";
import { cn } from "@/lib/ui/cn";
import { MimiSVG } from "@/components/mimi/mimi-svg";
import type { EncouragementKind } from "@/lib/ui/encouragement-pool";

export interface EncouragingToastProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phrase: string;
  kind: EncouragementKind;
  /** Duration in ms before auto-dismiss */
  duration?: number;
}

/** Toast with Mimi avatar + Vietnamese encouragement phrase, slides in from top */
export function EncouragingToast({
  open,
  onOpenChange,
  phrase,
  kind,
  duration = 3000,
}: EncouragingToastProps) {
  const mimiState = kind === "correct" ? "happy" : kind === "wrong" ? "sad" : "idle";

  return (
    <Toast.Provider swipeDirection="up" duration={duration}>
      <Toast.Root
        open={open}
        onOpenChange={onOpenChange}
        className={cn(
          "flex items-center gap-3 px-4 py-3",
          "bg-paper rounded-2xl shadow-chunky border border-brand-100",
          "data-[state=open]:animate-[slideInFromTop_0.3s_ease-out]",
          "data-[state=closed]:animate-[fadeOut_0.2s_ease-in]",
          "data-[swipe=end]:animate-[slideOutToTop_0.2s_ease-in]"
        )}
      >
        {/* Mimi avatar 40px */}
        <div className="shrink-0" aria-hidden="true">
          <MimiSVG state={mimiState} size={40} />
        </div>

        <Toast.Description asChild>
          <p className="font-display font-semibold text-lg text-ink-900">{phrase}</p>
        </Toast.Description>

        <Toast.Close
          aria-label="Đóng thông báo"
          className="ml-auto shrink-0 text-ink-400 hover:text-ink-900 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </Toast.Close>
      </Toast.Root>

      <Toast.Viewport className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[360px] max-w-[90vw]" />
    </Toast.Provider>
  );
}

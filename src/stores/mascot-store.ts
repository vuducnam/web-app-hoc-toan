"use client";
// Zustand store for Mimi mascot emotion state.
// Server renders header with default "idle"; client hydrates the same value.
// NEVER call set() during render — only in effects and event handlers.
import { create } from "zustand";

export type MascotEmotion = "idle" | "happy" | "excited" | "thinking" | "sad" | "cheering";

interface MascotState {
  emotion: MascotEmotion;
  set: (emotion: MascotEmotion) => void;
}

export const useMascot = create<MascotState>((set) => ({
  emotion: "idle",
  set: (emotion) => set({ emotion }),
}));

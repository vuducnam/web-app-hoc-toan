"use client";
// Countdown timer with color states (>5min green, 1-5min amber, <1min red, <30s pulse).
import { useEffect, useState } from "react";

interface Props {
  /** Wall-clock target deadline (ms since epoch) - server-authoritative. */
  deadlineMs: number;
  onExpire?: () => void;
}

function fmt(seconds: number): string {
  const sec = Math.max(0, Math.floor(seconds));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function ExamTimer({ deadlineMs, onExpire }: Props) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const remainingSec = Math.max(0, Math.floor((deadlineMs - now) / 1000));
  useEffect(() => {
    if (remainingSec === 0 && onExpire) onExpire();
  }, [remainingSec, onExpire]);

  let bg = "bg-emerald-100 text-emerald-800";
  if (remainingSec < 60) bg = "bg-red-100 text-red-700 animate-pulse";
  else if (remainingSec < 300) bg = "bg-amber-100 text-amber-800";

  return (
    <div
      role="timer"
      aria-live="off"
      className={`px-4 py-2 rounded-xl font-display font-bold text-2xl tabular-nums ${bg}`}
    >
      {fmt(remainingSec)}
    </div>
  );
}

"use client";
// Active exam runner - timer, paginator, autosave, submit confirm modal.
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveExamProgress } from "@/app/actions/exam-save-progress";
import { submitExamAttempt } from "@/app/actions/exam-submit";
import type { ExamQuestionDTO } from "@/lib/exam/types";
import { ExamTimer } from "./exam-timer";
import { ExamProgressBar } from "./exam-progress-bar";
import { ExamQuestionCard } from "./exam-question-card";

interface Props {
  attemptId: string;
  examName: string;
  durationMinutes: number;
  startedAtIso: string;
  serverNowIso: string;
  questions: ExamQuestionDTO[];
}

const AUTOSAVE_MS = 30_000;

export function ExamAttemptRunner({
  attemptId,
  examName,
  durationMinutes,
  startedAtIso,
  serverNowIso,
  questions,
}: Props) {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>(() => {
    const init: Record<number, string> = {};
    for (const q of questions) init[q.slotNo] = q.studentAnswer ?? "";
    return init;
  });
  const [submitting, startSubmit] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Server time offset - client clock may drift; deadline anchored to server time.
  const offsetMs = useMemo(() => {
    return new Date(serverNowIso).getTime() - Date.now();
  }, [serverNowIso]);
  const deadlineMs = useMemo(() => {
    return new Date(startedAtIso).getTime() + durationMinutes * 60_000 - offsetMs;
  }, [startedAtIso, durationMinutes, offsetMs]);

  const slotNumbers = useMemo(() => questions.map((q) => q.slotNo), [questions]);
  const answered = useMemo(() => {
    const s = new Set<number>();
    for (const slot of slotNumbers) {
      if (answers[slot] && answers[slot].trim() !== "") s.add(slot);
    }
    return s;
  }, [answers, slotNumbers]);

  const currentQ = questions[current];
  const value = answers[currentQ.slotNo] ?? "";

  // Save one slot to server.
  const dirtySlots = useRef<Set<number>>(new Set());
  const saveSlot = useCallback(async (slotNo: number, ans: string) => {
    try {
      await saveExamProgress({ attemptId, slotNo, answer: ans });
    } catch (e) {
      // Ignore expired silently here - submit handler covers it
      if (e instanceof Error) console.warn("save failed:", e.message);
    }
  }, [attemptId]);

  function handleChange(v: string) {
    setAnswers((prev) => ({ ...prev, [currentQ.slotNo]: v }));
    dirtySlots.current.add(currentQ.slotNo);
  }

  // Autosave dirty slots every 30s.
  useEffect(() => {
    const id = setInterval(() => {
      const slots = Array.from(dirtySlots.current);
      dirtySlots.current.clear();
      for (const slot of slots) {
        void saveSlot(slot, answers[slot] ?? "");
      }
    }, AUTOSAVE_MS);
    return () => clearInterval(id);
  }, [answers, saveSlot]);

  // Save on slot change.
  function jumpTo(idx: number) {
    const prevSlot = currentQ.slotNo;
    if (dirtySlots.current.has(prevSlot)) {
      dirtySlots.current.delete(prevSlot);
      void saveSlot(prevSlot, answers[prevSlot] ?? "");
    }
    setCurrent(Math.max(0, Math.min(questions.length - 1, idx)));
  }

  // beforeunload: flush dirty
  useEffect(() => {
    const handler = () => {
      const slots = Array.from(dirtySlots.current);
      for (const slot of slots) {
        // best effort - sendBeacon-like fallback not strictly needed here
        void saveSlot(slot, answers[slot] ?? "");
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [answers, saveSlot]);

  function doSubmit(force = false) {
    setError(null);
    startSubmit(async () => {
      try {
        // Flush all dirty saves first
        const slots = Array.from(dirtySlots.current);
        for (const slot of slots) {
          await saveSlot(slot, answers[slot] ?? "");
        }
        dirtySlots.current.clear();
        await submitExamAttempt({ attemptId });
        router.push(`/student/exam/attempt/${attemptId}/result`);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Có lỗi xảy ra");
        if (!force) setConfirmOpen(false);
      }
    });
  }

  function handleSubmitClick() {
    if (answered.size < questions.length) {
      setConfirmOpen(true);
    } else {
      doSubmit();
    }
  }

  // Auto-submit on timer expiry
  const handleExpire = useCallback(() => {
    doSubmit(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-5 pb-24">
      <header className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display font-bold text-2xl text-ink-900">{examName}</h1>
          <p className="text-sm text-ink-600">
            Câu {current + 1} / {questions.length} · Đã làm {answered.size}/{questions.length}
          </p>
        </div>
        <ExamTimer deadlineMs={deadlineMs} onExpire={handleExpire} />
      </header>

      <ExamProgressBar
        total={questions.length}
        current={current}
        answered={answered}
        slotNumbers={slotNumbers}
        onJump={jumpTo}
      />

      <ExamQuestionCard question={currentQ} value={value} onChange={handleChange} />

      <nav className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => jumpTo(current - 1)}
          disabled={current === 0}
          className="px-5 py-3 rounded-xl border-2 border-ink-200 font-display font-semibold disabled:opacity-50 hover:bg-ink-50"
        >
          ← Câu trước
        </button>
        {current === questions.length - 1 ? (
          <button
            type="button"
            onClick={handleSubmitClick}
            disabled={submitting}
            className="px-6 py-3 rounded-xl bg-brand-500 text-white font-display font-bold shadow-chunky-brand hover:bg-brand-700 transition disabled:opacity-50"
          >
            {submitting ? "Đang nộp..." : "Nộp bài"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => jumpTo(current + 1)}
            className="px-5 py-3 rounded-xl bg-brand-500 text-white font-display font-semibold shadow-chunky-brand hover:bg-brand-700 transition"
          >
            Câu sau →
          </button>
        )}
      </nav>

      {error && <p role="alert" className="text-red-600 text-sm font-semibold">{error}</p>}

      {confirmOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="exam-submit-confirm-title"
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        >
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4">
            <h3 id="exam-submit-confirm-title" className="font-display font-bold text-xl text-ink-900">
              Còn {questions.length - answered.size} câu chưa làm
            </h3>
            <p className="text-ink-700">Bạn chắc chắn muốn nộp bài?</p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="px-4 py-2 rounded-xl border-2 border-ink-200 font-display font-semibold"
              >
                Quay lại làm tiếp
              </button>
              <button
                type="button"
                onClick={() => doSubmit()}
                disabled={submitting}
                className="px-4 py-2 rounded-xl bg-brand-500 text-white font-display font-semibold shadow-chunky-brand"
              >
                {submitting ? "Đang nộp..." : "Nộp luôn"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

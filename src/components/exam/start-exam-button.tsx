"use client";
// Client button that triggers startExamAttempt server action and routes to attempt page.
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { startExamAttempt } from "@/app/actions/exam-start";

export function StartExamButton({ examPaperId }: { examPaperId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      try {
        const res = await startExamAttempt({ examPaperId });
        router.push(`/student/exam/attempt/${res.attemptId}`);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Có lỗi xảy ra");
      }
    });
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="w-full px-6 py-4 rounded-2xl bg-brand-500 text-white font-display font-bold text-lg shadow-chunky-brand hover:bg-brand-700 transition active:translate-y-[3px] active:shadow-none disabled:opacity-50 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sun-500"
      >
        {pending ? "Đang chuẩn bị đề..." : "Bắt đầu thi"}
      </button>
      {error && (
        <p role="alert" className="text-red-600 text-sm font-semibold">{error}</p>
      )}
    </div>
  );
}

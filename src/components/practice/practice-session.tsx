"use client";
// Root client component for the 10-question practice session.
// Manages session state via useReducer. Calls server actions directly.
import { useReducer, useRef, useState, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { submitAnswer, getNextQuestion } from "@/app/actions/practice-client-actions";
import { QuestionCard } from "./question-card";
import { ProgressDots, type DotState } from "./progress-dots";
import { ActionBar } from "./action-bar";
import { FeedbackOverlay, ShakeWrapper, type FeedbackState } from "./feedback-overlay";
import { IdleHintBubble } from "./idle-hint-bubble";
import type { MasteryLevel } from "@/components/ui/mastery-pill";
import { EncouragingToast } from "@/components/ui/encouraging-toast";
import { randomSessionId } from "@/lib/practice/random-session-id";
import { useIdleHint } from "@/lib/practice/use-idle-hint";
import type { SafeQuestion } from "@/lib/mastery/strip-answer";
import type { Difficulty } from "@/lib/generators/types";

const SESSION_LENGTH = 10;
const ELAPSED_CAP_MS = 600_000; // 10 min cap

type SafeQ = SafeQuestion & { seed: string; difficulty: Difficulty };

interface SessionState {
  current: SafeQ;
  dots: DotState[];
  answered: number;
  correct: number;
  feedback: FeedbackState | null;
  /** Mastery level before the last submit — used by level-up banner */
  prevMasteryLevel: MasteryLevel;
}

type Action =
  | { type: "record"; correct: boolean }
  | { type: "set_feedback"; fb: FeedbackState | null; prevMastery: MasteryLevel }
  | { type: "next"; q: SafeQ };

function reducer(state: SessionState, action: Action): SessionState {
  switch (action.type) {
    case "record": {
      const newDots = [...state.dots] as DotState[];
      newDots[state.answered] = action.correct ? "correct" : "wrong";
      return {
        ...state,
        dots: newDots,
        answered: state.answered + 1,
        correct: state.correct + (action.correct ? 1 : 0),
      };
    }
    case "set_feedback":
      return { ...state, feedback: action.fb, prevMasteryLevel: action.prevMastery };
    case "next":
      return { ...state, current: action.q, feedback: null };
    default:
      return state;
  }
}

function initState(firstQuestion: SafeQ): SessionState {
  return {
    current: firstQuestion,
    dots: Array(SESSION_LENGTH).fill("empty") as DotState[],
    answered: 0,
    correct: 0,
    feedback: null,
    prevMasteryLevel: "NOT_STARTED",
  };
}

interface PracticeSessionProps {
  firstQuestion: SafeQ;
  skillKey: string;
  skillName: string;
}

/** Root client container for a 10-question practice session. */
export function PracticeSession({ firstQuestion, skillKey, skillName }: PracticeSessionProps) {
  const [state, dispatch] = useReducer(reducer, firstQuestion, initState);
  // Initialized lazily on first effect run; safe default 0 keeps useRef pure during render.
  const questionStartTimeRef = useRef<number>(0);
  const [pendingAnswer, setPendingAnswer] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const sessionId = useRef<string>(randomSessionId());
  // Tracks current mastery so we can pass "before" level to level-up banner
  const currentMasteryRef = useRef<MasteryLevel>("NOT_STARTED");
  const router = useRouter();

  // Track start time reset when question advances
  function resetTimer() {
    questionStartTimeRef.current = Date.now();
  }

  // Called by FeedbackOverlay after dismiss delay to load next question.
  const handleAdvance = useCallback(() => {
    const nextAnswered = state.answered; // already incremented by "record"
    if (nextAnswered >= SESSION_LENGTH) {
      router.push(`/student/summary?skillKey=${skillKey}&sessionId=${sessionId.current}`);
      return;
    }
    startTransition(async () => {
      const next = await getNextQuestion(skillKey);
      if ("error" in next) {
        setErrorToast("Không thể tải câu tiếp theo. Vui lòng thử lại.");
        return;
      }
      dispatch({ type: "next", q: next });
      resetTimer();
      setPendingAnswer("");
    });
  }, [state.answered, skillKey, router]);

  async function handleSubmit(userAnswer: string) {
    if (isPending || state.feedback) return;
    // Initialize timer on first submit if not yet set (handles initial question)
    if (questionStartTimeRef.current === 0) questionStartTimeRef.current = Date.now();
    const elapsedMs = Math.min(Date.now() - questionStartTimeRef.current, ELAPSED_CAP_MS);

    const result = await submitAnswer({
      skillKey,
      seed: state.current.seed,
      difficulty: state.current.difficulty,
      userAnswer,
      elapsedMs,
    });

    if ("error" in result) {
      if (result.error === "replay") {
        setErrorToast("Vui lòng tải lại trang.");
      } else {
        setErrorToast("Đã có lỗi xảy ra. Thử lại nhé!");
      }
      return;
    }

    const prevMastery = currentMasteryRef.current;
    currentMasteryRef.current = result.newMasteryLevel;

    dispatch({ type: "record", correct: result.correct });
    dispatch({
      type: "set_feedback",
      prevMastery,
      fb: {
        correct: result.correct,
        leveledUp: result.leveledUp,
        newMasteryLevel: result.newMasteryLevel,
        encouragementKey: result.encouragementKey,
      },
    });
    setPendingAnswer("");
  }

  function handleSkip() {
    if (isPending || state.feedback) return;
    // Skip without recording — advance to next question directly.
    const nextAnswered = state.answered + 1;
    // Mark dot as wrong for skipped questions so progress advances visually.
    const newDots = [...state.dots] as DotState[];
    newDots[state.answered] = "wrong";
    dispatch({ type: "record", correct: false });
    if (nextAnswered >= SESSION_LENGTH) {
      router.push(`/student/summary?skillKey=${skillKey}&sessionId=${sessionId.current}`);
      return;
    }
    startTransition(async () => {
      const next = await getNextQuestion(skillKey);
      if ("error" in next) {
        setErrorToast("Không thể tải câu tiếp theo.");
        return;
      }
      dispatch({ type: "next", q: next });
      resetTimer();
      setPendingAnswer("");
    });
  }

  function handleHelp() {
    setErrorToast("Tính năng trợ giúp sắp có!");
    setTimeout(() => setErrorToast(null), 2000);
  }

  const isLocked = isPending || state.feedback !== null;

  // Idle nudge — soft prompt at 45s, deep prompt at 90s; resets on new question or any input.
  const idlePhase = useIdleHint(state.current.seed, isLocked);

  // Submit-moment ring flash signal — derived from feedback, keyed by seed so every
  // new feedback (even a second wrong in a row) restarts the keyframe.
  const flashKind: "correct" | "wrong" | null = state.feedback
    ? state.feedback.correct ? "correct" : "wrong"
    : null;

  return (
    <div className="space-y-4">
      {/* Progress header */}
      <div className="flex items-center gap-3">
        <Link
          href="/student"
          aria-label="Thoát bài luyện tập"
          className="text-ink-400 hover:text-ink-900 transition-colors shrink-0"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </Link>
        <ProgressDots dots={state.dots} current={state.answered} />
        <span className="text-sm font-bold text-ink-600 shrink-0">
          {state.answered}/{SESSION_LENGTH}
        </span>
      </div>

      {/* Question card — wrapped in ShakeWrapper for wrong-answer animation */}
      <div className="relative bg-white rounded-3xl shadow-chunky border border-brand-100 p-6 md:p-10">
        {/* Skill label */}
        <div className="mb-4">
          <span className="text-xs font-bold bg-brand-50 text-brand-700 px-2.5 py-1 rounded-full">
            {skillName}
          </span>
        </div>

        <ShakeWrapper
          shake={state.feedback?.correct === false}
          flash={flashKind}
          flashKey={state.current.seed}
        >
          <QuestionCard
            question={state.current}
            onAnswer={(v) => {
              setPendingAnswer(v);
              handleSubmit(v);
            }}
            disabled={isLocked}
          />
        </ShakeWrapper>

        <ActionBar
          onSkip={handleSkip}
          onHelp={handleHelp}
          onSubmit={() => {
            if (pendingAnswer) handleSubmit(pendingAnswer);
          }}
          disabled={isLocked}
          answerEmpty={pendingAnswer === ""}
        />

        {/* Soft idle nudge — only renders after 45s of inactivity, resets per question. */}
        <IdleHintBubble phase={idlePhase} />
      </div>

      {/* Feedback overlay — full Phase 09 version with confetti + level-up banner */}
      <FeedbackOverlay
        feedback={state.feedback}
        prevMasteryLevel={state.prevMasteryLevel}
        onAdvance={handleAdvance}
      />

      {/* Error / info toast */}
      {errorToast && (
        <EncouragingToast
          open={true}
          onOpenChange={() => setErrorToast(null)}
          phrase={errorToast}
          kind="wrong"
          duration={2500}
        />
      )}
    </div>
  );
}

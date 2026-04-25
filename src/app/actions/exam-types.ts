// Exam DTOs - shared between server actions, components, and tests.
import type {
  ExamQuestionDTO,
  ExamSummary,
  ScoredAnswer,
} from "@/lib/exam/types";

export interface StartExamResult {
  attemptId: string;
  examPaperKey: string;
  examPaperName: string;
  durationMinutes: number;
  startedAt: string; // ISO
  totalQuestions: number;
  questions: ExamQuestionDTO[];
}

export interface ResumeExamResult extends StartExamResult {
  // Server time at response - client uses to compute remaining
  serverNow: string; // ISO
}

export interface ExamSubmitResult {
  attemptId: string;
  status: "SUBMITTED" | "EXPIRED";
  totalScore: number;
  correctCount: number;
  totalCount: number;
  expired: boolean;
  summary: ExamSummary;
  answers: ScoredAnswer[];
}

export interface AssignExamInput {
  studentId: string;
  examPaperId: string;
  /** ISO datetime; null = no due date. */
  dueAt?: string | null;
}

export class ExamExpiredError extends Error {
  constructor() {
    super("Đã hết thời gian làm bài");
    this.name = "ExamExpiredError";
  }
}

export class ExamConflictError extends Error {
  constructor() {
    super("Đã có đề chưa hoàn thành cho học sinh này");
    this.name = "ExamConflictError";
  }
}

export class ExamUnauthorizedError extends Error {
  constructor(msg = "Không có quyền truy cập") {
    super(msg);
    this.name = "ExamUnauthorizedError";
  }
}

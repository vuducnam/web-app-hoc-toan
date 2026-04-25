// Seed data types — used by grade-4.ts, grade-5.ts, badges.ts
// AnswerFormat matches Prisma enum exactly (UPPER_SNAKE_CASE)

export type AnswerFormatType =
  | "NUMERIC"
  | "FRACTION"
  | "DECIMAL"
  | "TEXT"
  | "MULTIPLE_CHOICE";

// Discriminated union enforces generatorKey XOR poolKey at compile time
export type SeedSkill =
  | {
      key: string;
      nameVi: string;
      answerFormat: AnswerFormatType;
      timeEstimateSec: number;
      generatorKey: string;
      poolKey?: never;
    }
  | {
      key: string;
      nameVi: string;
      answerFormat: AnswerFormatType;
      timeEstimateSec: number;
      poolKey: string;
      generatorKey?: never;
    };

// Pre-exercise knowledge notes — 3 Vietnamese pedagogical sections.
// Markdown + KaTeX content. Lesson-only granularity (no skill override in MVP).
export interface KnowledgeNoteFields {
  knowledgeNoteRemember?: string | null;
  knowledgeNoteCaution?: string | null;
  knowledgeNoteExtension?: string | null;
}

export interface SeedLesson extends KnowledgeNoteFields {
  order: number;
  nameVi: string;
  skills: SeedSkill[];
}

export interface SeedTopic {
  order: number;
  nameVi: string;
  lessons: SeedLesson[];
}

export interface SeedVolume {
  order: number;
  name: string;
  topics: SeedTopic[];
}

export interface SeedGrade {
  key: string;
  name: string;
  volumes: SeedVolume[];
}

export interface SeedBadge {
  key: string;
  nameVi: string;
  descVi: string;
  tier: string;
  category: string;
  criteria: Record<string, unknown>;
}

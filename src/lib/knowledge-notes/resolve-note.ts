// Pure knowledge-note resolver. No DB / Next.js imports.
// MVP: lesson-only granularity (skill override deferred to Phase 17+).
// Returns null when ALL three sections are empty so caller can skip rendering entirely.

export interface KnowledgeNote {
  remember:  string | null;
  caution:   string | null;
  extension: string | null;
}

interface LessonNoteSource {
  knowledgeNoteRemember:  string | null;
  knowledgeNoteCaution:   string | null;
  knowledgeNoteExtension: string | null;
}

export function resolveKnowledgeNote(lesson: LessonNoteSource | null | undefined): KnowledgeNote | null {
  if (!lesson) return null;
  const remember  = lesson.knowledgeNoteRemember  ?? null;
  const caution   = lesson.knowledgeNoteCaution   ?? null;
  const extension = lesson.knowledgeNoteExtension ?? null;
  if (!remember && !caution && !extension) return null;
  return { remember, caution, extension };
}

import { describe, it, expect } from "vitest";
import { resolveKnowledgeNote } from "@/lib/knowledge-notes/resolve-note";

describe("resolveKnowledgeNote", () => {
  it("returns null when lesson is null/undefined", () => {
    expect(resolveKnowledgeNote(null)).toBeNull();
    expect(resolveKnowledgeNote(undefined)).toBeNull();
  });

  it("returns null when all 3 fields are null", () => {
    const lesson = {
      knowledgeNoteRemember: null,
      knowledgeNoteCaution: null,
      knowledgeNoteExtension: null,
    };
    expect(resolveKnowledgeNote(lesson)).toBeNull();
  });

  it("returns note with non-null sections passed through", () => {
    const lesson = {
      knowledgeNoteRemember: "Remember text",
      knowledgeNoteCaution: null,
      knowledgeNoteExtension: "Extension text",
    };
    expect(resolveKnowledgeNote(lesson)).toEqual({
      remember: "Remember text",
      caution: null,
      extension: "Extension text",
    });
  });

  it("returns full 3-section note when all populated", () => {
    const lesson = {
      knowledgeNoteRemember: "R",
      knowledgeNoteCaution: "C",
      knowledgeNoteExtension: "E",
    };
    expect(resolveKnowledgeNote(lesson)).toEqual({
      remember: "R",
      caution: "C",
      extension: "E",
    });
  });
});

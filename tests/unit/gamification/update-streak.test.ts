import { describe, it, expect, vi, beforeEach } from "vitest";
import { updateStreakOnAttempt } from "@/lib/gamification/update-streak";
import * as vietnamModule from "@/lib/gamification/vietnam-today";

describe("updateStreakOnAttempt", () => {
  // Mock vietnamYesterday for testing different date scenarios
  let mockVietnamYesterday: (date: string) => string;

  // Simple mock implementation
  beforeEach(() => {
    mockVietnamYesterday = (date: string): string => {
      const d = new Date(date + "T00:00:00Z");
      d.setUTCDate(d.getUTCDate() - 1);
      return d.toISOString().split("T")[0];
    };
    vi.spyOn(vietnamModule, "vietnamYesterday").mockImplementation(mockVietnamYesterday);
  });

  describe("first activity (null streak)", () => {
    it("initializes streak to {1, 1, today}", () => {
      const result = updateStreakOnAttempt(null, "2026-04-25");

      expect(result.currentDays).toBe(1);
      expect(result.longestDays).toBe(1);
      expect(result.lastActiveDate).toBe("2026-04-25");
    });
  });

  describe("activity on same day", () => {
    it("returns unchanged streak when activity today matches lastActiveDate", () => {
      const input = { currentDays: 5, longestDays: 7, lastActiveDate: "2026-04-25" };
      const result = updateStreakOnAttempt(input, "2026-04-25");

      expect(result.currentDays).toBe(5);
      expect(result.longestDays).toBe(7);
      expect(result.lastActiveDate).toBe("2026-04-25");
    });
  });

  describe("activity on consecutive day", () => {
    it("increments streak when lastActiveDate is yesterday", () => {
      const input = { currentDays: 5, longestDays: 7, lastActiveDate: "2026-04-24" };
      const result = updateStreakOnAttempt(input, "2026-04-25");

      expect(result.currentDays).toBe(6);
      expect(result.longestDays).toBe(7);
      expect(result.lastActiveDate).toBe("2026-04-25");
    });

    it("updates longestDays when currentDays exceeds it", () => {
      const input = { currentDays: 7, longestDays: 7, lastActiveDate: "2026-04-24" };
      const result = updateStreakOnAttempt(input, "2026-04-25");

      expect(result.currentDays).toBe(8);
      expect(result.longestDays).toBe(8);
      expect(result.lastActiveDate).toBe("2026-04-25");
    });
  });

  describe("activity after gap", () => {
    it("resets streak when lastActiveDate is 2+ days ago", () => {
      const input = { currentDays: 10, longestDays: 15, lastActiveDate: "2026-04-23" };
      const result = updateStreakOnAttempt(input, "2026-04-25");

      expect(result.currentDays).toBe(1);
      expect(result.longestDays).toBe(15); // longestDays doesn't change on reset
      expect(result.lastActiveDate).toBe("2026-04-25");
    });

    it("preserves longestDays when resetting", () => {
      const input = { currentDays: 5, longestDays: 20, lastActiveDate: "2026-04-20" };
      const result = updateStreakOnAttempt(input, "2026-04-25");

      expect(result.currentDays).toBe(1);
      expect(result.longestDays).toBe(20);
    });
  });

  describe("edge cases", () => {
    it("handles streak of 1 correctly on consecutive day", () => {
      const input = { currentDays: 1, longestDays: 1, lastActiveDate: "2026-04-24" };
      const result = updateStreakOnAttempt(input, "2026-04-25");

      expect(result.currentDays).toBe(2);
      expect(result.longestDays).toBe(2);
    });

    it("does not decrement longestDays on reset", () => {
      const input = { currentDays: 50, longestDays: 50, lastActiveDate: "2026-04-01" };
      const result = updateStreakOnAttempt(input, "2026-04-25");

      expect(result.currentDays).toBe(1);
      expect(result.longestDays).toBe(50);
    });
  });
});

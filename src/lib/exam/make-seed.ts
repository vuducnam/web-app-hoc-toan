// Deterministic exam attempt seed - SHA-256 of (studentId|paperId|attemptNumber).
import "server-only";
import { createHash } from "node:crypto";

export function makeSeed(
  studentId: string,
  examPaperId: string,
  attemptNumber: number,
): string {
  return createHash("sha256")
    .update(`${studentId}|${examPaperId}|${attemptNumber}`)
    .digest("hex")
    .slice(0, 16);
}

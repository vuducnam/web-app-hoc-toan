// Answer stripping — removes expectedAnswer (and any solution hints) from a Question
// before it leaves the server. This is the ONLY path through which a Question
// should be returned to the client.
import type { Question } from "@/lib/generators/types";

/**
 * A Question with expectedAnswer removed — safe to send to the client.
 * `seed` and numeric `difficulty` are added by the server action caller
 * so the client can echo them back on submit.
 */
export type SafeQuestion<T = unknown> = Omit<Question<T>, "expectedAnswer">;

/**
 * Strip `expectedAnswer` (and any `solutionHint` field that generators may add)
 * from a Question before returning it to the client.
 *
 * CODE REVIEW RULE: any `return` that includes a Question MUST go through this helper.
 * Phase 12 test asserts that `JSON.stringify(result)` does not contain "expectedAnswer".
 */
export function stripAnswer<T>(q: Question<T>): SafeQuestion<T> {
  // Destructure to exclude expectedAnswer; also drop solutionHint if present
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { expectedAnswer, ...safe } = q as Question<T> & { solutionHint?: unknown };
  // Remove solutionHint if a generator added it
  delete (safe as { solutionHint?: unknown }).solutionHint;
  return safe as SafeQuestion<T>;
}

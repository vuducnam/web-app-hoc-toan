/** Generates a unique session ID for each 10-question practice session. */
export function randomSessionId(): string {
  return crypto.randomUUID();
}

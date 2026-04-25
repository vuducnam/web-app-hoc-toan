import "server-only";
// Stub generator factory — used for skills not yet implemented.
// Throws NotImplementedError on generate() so the UI can surface "coming soon" cleanly.
// validate() always returns false (no cheating through stubs).
import type { Generator } from "./types";

export function makeStub(key: string): Generator {
  return {
    generate() {
      throw new Error(`NotImplemented: ${key}`);
    },
    validate() {
      return false;
    },
  };
}

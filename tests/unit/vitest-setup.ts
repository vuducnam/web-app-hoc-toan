import { vi } from "vitest";

// Mock server-only to avoid "Cannot be imported from Client Component" error in unit tests
vi.mock("server-only", () => ({}));

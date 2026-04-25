import "server-only";
// Re-export from measurement module — geometry directory entry point.
// The actual implementation lives in measurement/rectangular-prism-volume.ts
// to keep all measurement/geometry logic co-located.
export { rectangularPrismVolume } from "../measurement/rectangular-prism-volume";

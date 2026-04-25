import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Generated Prisma client (auto-generated, not our code)
    "src/generated/**",
    // Claude Code harness internals (CommonJS hooks/skills, not app code)
    ".claude/**",
    // Test fixtures and config
    "**/*.cjs",
    // Test coverage output
    "coverage/**",
  ]),
]);

export default eslintConfig;

import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    environment: "happy-dom",
    globals: true,
    /* `tests/*.spec.ts` are Playwright E2E specs — they need a running
       server on localhost:3000 and are driven by `playwright test`, not by
       this unit-test runner. Without this exclude, `npx vitest run` spends
       its time failing on ECONNREFUSED. */
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "tests/**/*.spec.ts",
      /* The agent skill libraries carry example suites (Pact consumer tests,
         Playwright fixtures, service templates). They are reference material,
         not this project's tests: collecting them made `test:unit` fail with
         ECONNREFUSED on suites that expect an external server. */
      ".agents/**",
      ".freebuff/**",
      ".freebuff-snapshots/**",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["lib/**/*.ts"],
      exclude: [
        "lib/**/*.test.ts",
        "lib/content/en.ts",
        "lib/content/id.ts",
        "lib/content/types.ts",
      ],
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./"),
    },
  },
});

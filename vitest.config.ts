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

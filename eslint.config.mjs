import { FlatCompat } from "@eslint/eslintrc";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

/* eslint-config-next is a legacy (eslintrc-style) config, so it is loaded
   through FlatCompat. Rules come from Next's own presets, unchanged. */
const compat = new FlatCompat({ baseDirectory: here });

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "next-env.d.ts",
      "playwright-report/**",
      "test-results/**",
      ".lighthouseci/**",
      "coverage/**",
      /* The agent skill libraries ship their own resource files — k6 scripts,
         React templates, Playwright fixtures. They are tooling, not this site,
         and linting them both fails the gate on files we never import and
         hides real findings in our own source behind their noise. */
      ".agents/**",
      ".freebuff/**",
      ".freebuff-snapshots/**",
    ],
  },
  ...compat.extends("next/core-web-vitals"),
];

export default eslintConfig;

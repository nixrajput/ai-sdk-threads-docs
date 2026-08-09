import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  // public/** holds the PGlite dist copied by scripts/copy-pglite.mjs - vendor bundles,
  // not our source, and linting them fails on their own minified idioms.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    ".source/**",
    ".samples/**",
    "public/**",
  ]),
]);

export default eslintConfig;

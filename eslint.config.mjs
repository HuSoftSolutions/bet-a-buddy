import { FlatCompat } from "@eslint/eslintrc";
import nextPlugin from "@next/eslint-plugin-next";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// Import legacy configs
const nextCoreConfig = compat.config({
  extends: ["next/core-web-vitals"]
});

const typescriptConfig = compat.config({
  extends: ["next/typescript"]
});

const config = [
  {
    plugins: {
      next: nextPlugin
    }
  },
  ...nextCoreConfig,
  {
    files: ["**/*.ts", "**/*.tsx"],
    ...typescriptConfig[0]
  }
];

export default config;

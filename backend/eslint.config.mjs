import globals from "globals";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import tseslintPlugin from "@typescript-eslint/eslint-plugin";
import prettier from "eslint-config-prettier";
import eslintPluginSecurity from "eslint-plugin-security";
import eslintPluginPromise from "eslint-plugin-promise";

export default [
  {
    ignores: ["node_modules", "dist"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: process.cwd(),
      },
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
      sourceType: "module",
    },
    plugins: {
      "@typescript-eslint": tseslintPlugin,
      security: eslintPluginSecurity,
      promise: eslintPluginPromise,
    },
    rules: {
      ...eslintPluginSecurity.configs.recommended.rules,
      ...eslintPluginPromise.configs.recommended.rules,
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/ban-ts-comment": "warn",
      "promise/always-return": "off",
      "promise/catch-or-return": "warn",
      "@typescript-eslint/no-var-requires": "off",
    },
  },
  prettier,
];
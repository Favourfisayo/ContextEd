import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
      globals: {
        process: "readonly"
      }
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { 
          argsIgnorePattern: "^_", 
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_"
        },
      ],
      "@typescript-eslint/no-explicit-any": "off",
      "no-useless-catch": "off",
      "no-empty": "off"
    },
  },
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.next/**",
      "**/.turbo/**",
      "**/*.test.ts",
      "**/*.config.js",
      "**/*coverage/**",
      "postcss.config.mjs",
      "**/ui/**"
    ],
  },
];
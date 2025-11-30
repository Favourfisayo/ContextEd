import baseConfig from "./base.js";

export default [
  ...baseConfig,
  {
    files: ["**/*.ts"],
    languageOptions: {
      globals: {
        NodeJS: true,
        process: true,
        console: true,
      },
    },
  },
];
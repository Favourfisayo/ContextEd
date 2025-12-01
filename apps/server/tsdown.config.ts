import { defineConfig } from "tsdown";

export default defineConfig({
	entry: [
		"./src/index.ts",
		"./src/features/courses/workers/embeddingWorker.ts",
	],
	format: "esm",
	outDir: "./dist",
	clean: true,
	noExternal: [/@studyRAG\/.*/, /@studyrag\/.*/],
    external: ["@prisma/client"],
});

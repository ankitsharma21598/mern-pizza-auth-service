import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        fileParallelism: false,
        coverage: {
            provider: "v8",
            reporter: ["text", "html", "json-summary"],
            reportsDirectory: "./coverage",
            include: ["src/**/*.ts"],
            exclude: [
                "src/**/*.spec.ts",
                "src/**/*.test.ts",
                "tests/",
                "tests/**",
                "node_modules/**",
                "src/migration/**",
                "src/config/data-source.ts",
            ],
        },
    },
});

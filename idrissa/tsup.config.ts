import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/interfaces/cli/index.ts"],
  format: ["esm"],
  outDir: "dist",
  sourcemap: true,
  platform: "node", // Ensures built-in Node modules are not bundled
  esbuildOptions(options) {
    options.alias = {
      "@": "./src",
    };
  },
});

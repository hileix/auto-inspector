import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/interfaces/cli/index.ts"],
  format: ["esm"],
  outDir: "dist",
  sourcemap: true,
  dts: true,
  esbuildOptions(options) {
    options.alias = {
      "@": "./src",
    };
  },
});

import { defineConfig } from "tsdown";
import pkg from "./package.json" with { type: "json" };
import { builtinModules } from "node:module";

export default async () => {
  const config = defineConfig({
    outDir: "dist",
    format: ["cjs"],
    entry: {
      master: "src/master/index.ts",
      worker: "src/worker/index.ts",
      main: "src/main.ts",
    },
    deps: {
      neverBundle: [
        ...builtinModules,
        ...builtinModules.map((name) => `node:${name}`),
        ...Object.keys(pkg?.dependencies ?? {}),
        ...Object.keys(pkg?.devDependencies ?? {}),
      ],
    },
    clean: true,
    dts: true,
    platform: "node",
    sourcemap: true,
    treeshake: true,
    target: "esnext",
  });

  return config;
};

// electron.vite.config.ts
import { resolve } from "path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import react from "@vitejs/plugin-react";
import envCompatible from "vite-plugin-env-compatible";
var __electron_vite_injected_dirname = "/Users/mzi/Documents/Code/Butterfly";
var electron_vite_config_default = defineConfig({
  main: {
    build: {
      outDir: "out/main",
      rollupOptions: {
        input: resolve(__electron_vite_injected_dirname, "src/main/index.ts")
      }
    },
    plugins: [externalizeDepsPlugin(), envCompatible()]
  },
  preload: {
    build: {
      outDir: "out/preload",
      rollupOptions: {
        input: resolve(__electron_vite_injected_dirname, "src/preload/index.ts")
      }
    },
    plugins: [externalizeDepsPlugin(), envCompatible()]
  },
  renderer: {
    build: {
      outDir: "out/renderer",
      rollupOptions: {
        input: resolve(__electron_vite_injected_dirname, "src/renderer/index.html")
      }
    },
    resolve: {
      alias: {
        "@renderer": resolve("src/renderer/src")
      }
    },
    plugins: [react(), envCompatible()]
  }
});
export {
  electron_vite_config_default as default
};

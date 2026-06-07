import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import type { Plugin } from "vite";
import path from "path";

// Custom plugin to handle Tauri API resolution
const tauriPlugin: Plugin = {
  name: "tauri-resolver",
  resolveId(id: string) {
    if (id === "@tauri-apps/api/tauri" || id === "@tauri-apps/api") {
      return id;
    }
  },
  load(id: string) {
    if (id === "@tauri-apps/api/tauri" || id === "@tauri-apps/api") {
      return `
        export const invoke = async (cmd, args) => {
          if (window.__TAURI__) {
            return window.__TAURI__.core.invoke(cmd, args);
          }
          console.warn('Tauri API not available');
          return null;
        };
        export const appDataDir = async () => '';
        export const resourceDir = async () => '';
      `;
    }
  },
};

// https://vite.dev/config/
export default defineConfig({
  base: "./",
  plugins: [react(), tauriPlugin],
  optimizeDeps: {
    exclude: ["@tauri-apps/api", "@tauri-apps/api/tauri"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      external: ["@tauri-apps/api", "@tauri-apps/api/tauri"],
      output: {
        globals: {
          "@tauri-apps/api": "window.__TAURI__",
          "@tauri-apps/api/tauri": "window.__TAURI__",
        },
      },
    },
  },
});

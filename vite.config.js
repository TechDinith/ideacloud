import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const SHELL_CACHE = path.join(ROOT, "node_modules", ".cache", "prerender-shell.html");

/**
 * Snapshots Vite's finished index.html to a cache outside dist/ so
 * scripts/prerender.mjs can render every route from an identical, pristine
 * template. Keeping it out of dist means it is never deployed, and rewriting it
 * on every build means it can never go stale.
 */
function prerenderShell() {
  return {
    name: "prerender-shell",
    apply: "build",
    closeBundle() {
      const html = readFileSync(path.join(ROOT, "dist", "index.html"), "utf8");
      mkdirSync(path.dirname(SHELL_CACHE), { recursive: true });
      writeFileSync(SHELL_CACHE, html.replace(/\r\n/g, "\n"), "utf8");
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), prerenderShell()],
  resolve: {
    alias: {
      "@": path.resolve(ROOT, "src"),
    },
  },
});

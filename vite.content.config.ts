import { defineConfig } from "vite";
import { resolve } from "node:path";

// The content script is injected via chrome.scripting.executeScript's
// `files` form (not `func`, since our matching engine can't be serialized
// as a closure). That injection mode captures the completion value of the
// last statement as a classic script would — which only works reliably
// for a non-module IIFE bundle, not an ES module. Built separately from
// the popup (which stays ES module) so emptyOutDir doesn't race/clobber it.
export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: false,
    rollupOptions: {
      input: {
        content: resolve(__dirname, "src/content/fill.ts"),
      },
      output: {
        format: "iife",
        entryFileNames: "[name].js",
      },
    },
  },
  publicDir: false,
});

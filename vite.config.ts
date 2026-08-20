import { defineConfig } from "vite";
import { resolve } from "node:path";

// Builds the popup as a standard ES-module entry (Chrome extension popup
// pages support <script type="module"> natively). `root` is set to the
// popup's own directory so the built HTML lands at dist/index.html instead
// of being nested under dist/src/popup/. The content script has its own
// build (vite.content.config.ts) because it must be emitted as a classic
// IIFE — see that file for why.
const popupDir = resolve(__dirname, "src/popup");

export default defineConfig({
  root: popupDir,
  build: {
    outDir: resolve(__dirname, "dist"),
    emptyOutDir: true,
  },
  publicDir: resolve(__dirname, "public"),
});

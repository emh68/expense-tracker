import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  root: "src",

  build: {
    outDir: "../dist",
    emptyOutDir: true,

    rollupOptions: {
      input: {
        dashboard: resolve(import.meta.dirname, "src/index.html"),
        transactions: resolve(import.meta.dirname, "src/transactions/index.html"),
        budgets: resolve(import.meta.dirname, "src/budgets/index.html"),
        reports: resolve(import.meta.dirname, "src/reports/index.html"),
        settings: resolve(import.meta.dirname, "src/settings/index.html")
      }
    }
  }
});
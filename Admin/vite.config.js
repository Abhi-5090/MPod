import { fileURLToPath, URL } from "node:url"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const BACKEND = process.env.MPOD_BACKEND_URL || "http://localhost:8002"

// The admin portal is always served under /admin (same as production), so links,
// the router basename and assets behave identically in dev and prod.
export default defineConfig({
  base: "/admin/",
  plugins: [react({ include: /\.(js|jsx)$/ })],
  // Some older libraries (draft-js editor) reference Node's `global`.
  define: { global: "globalThis" },
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  // The codebase uses JSX inside .js files.
  esbuild: { loader: "jsx", include: /src\/.*\.jsx?$/, exclude: [] },
  optimizeDeps: { esbuildOptions: { loader: { ".js": "jsx" } } },
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler",
        // Theme SCSS imports "./node_modules/bootstrap/..." relative to the project root.
        loadPaths: [fileURLToPath(new URL(".", import.meta.url))],
        quietDeps: true,
        silenceDeprecations: ["import", "global-builtin", "color-functions", "slash-div"],
      },
    },
  },
  server: {
    port: 8003,
    strictPort: true,
    // API calls are same-origin in dev too: no CORS, and the session cookie just works.
    proxy: { "/backend": { target: BACKEND, changeOrigin: true } },
  },
  preview: { port: 8003, strictPort: true, proxy: { "/backend": { target: BACKEND, changeOrigin: true } } },
  build: { outDir: "build", chunkSizeWarningLimit: 1500 },
})

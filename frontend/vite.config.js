import { fileURLToPath, URL } from "node:url"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const BACKEND = process.env.MPOD_BACKEND_URL || "http://localhost:8002"
const proxy = { "/backend": { target: BACKEND, changeOrigin: true } }

export default defineConfig({
  plugins: [react({ include: /\.(js|jsx)$/ })],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  // index.js / App.js contain JSX.
  esbuild: { loader: "jsx", include: /src\/.*\.jsx?$/, exclude: [] },
  optimizeDeps: { esbuildOptions: { loader: { ".js": "jsx" } } },
  css: {
    preprocessorOptions: {
      scss: { api: "modern-compiler", quietDeps: true, silenceDeprecations: ["import", "global-builtin", "color-functions", "slash-div"] },
    },
  },
  // API calls, photos and face models go through the dev server: same origin, cookies work, no CORS.
  server: { port: 3000, strictPort: true, proxy },
  preview: { port: 3000, strictPort: true, proxy },
  build: { outDir: "build", chunkSizeWarningLimit: 2000 },
})

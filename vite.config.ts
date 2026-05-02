import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import cesium from 'vite-plugin-cesium'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    cesium(),
    tailwindcss(),
  ],
  // Bind to `localhost` only — Google Maps API key referrer check treats
  // `localhost` and `127.0.0.1` as separate origins, so an accidental
  // 127.0.0.1 hit fails auth. See commit 7b21ea0.
  // Trade-off: dev server is unreachable from Codespaces / devcontainers /
  // LAN phones; pass `--host` if you need it.
  server: {
    host: 'localhost',
    port: 5173,
  },
})

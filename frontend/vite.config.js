import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    // Proxy backend routes to the Express server on port 3000 so the browser
    // makes same-origin requests (avoids CORS without touching the backend).
    proxy: {
      "/auth": "http://localhost:3000",
      "/admin": "http://localhost:3000",
      "/variants": "http://localhost:3000",
      "/products": "http://localhost:3000",
      "/validate": "http://localhost:3000",
      "/stats": "http://localhost:3000",
      "/ping": "http://localhost:3000",
    },
  },
})

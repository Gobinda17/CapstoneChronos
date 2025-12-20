import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: 8000,
    strictPort: true,
    proxy: {
      "/airtribe/capstone/chronos/app/api/v1": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
      },
    }
  },
})

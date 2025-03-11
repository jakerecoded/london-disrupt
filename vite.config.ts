import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use the correct base path for GitHub Codespaces
  base: '',
  // Simple server configuration
  server: {
    port: 5173
  }
})
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' 
import tailwindcss from '@tailwindcss/vite'
import path from 'path'; 

export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
  ],
  // Add the 'build' configuration object
  build: {
    // CRITICAL FIX: Disable source map generation for production builds
    sourcemap: false, 
  },
  server: {
    proxy: {
      "/api": "http://localhost:5000",
    },
  },
})
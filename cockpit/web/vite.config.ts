import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3002,
    strictPort: false,
    host: true,
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    sourcemap: false,
  },
});

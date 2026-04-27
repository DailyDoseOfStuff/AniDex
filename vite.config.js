import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [],
  root: '.',
  publicDir: 'public',
  server: {
    port: 3000,
    open: true,
    host: true // Required for Docker to expose the port
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});
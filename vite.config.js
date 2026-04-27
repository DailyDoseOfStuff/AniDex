import { defineConfig } from 'vite';
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [cloudflare()],
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
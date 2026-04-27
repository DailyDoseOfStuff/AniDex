import { defineConfig } from 'vite';

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  root: '.',
  publicDir: 'public',
  plugins: [cloudflare()],
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
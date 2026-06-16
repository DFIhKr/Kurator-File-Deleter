import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    minify: 'esbuild',
    sourcemap: false,
    target: 'es2022',
  },
  server: {
    port: 5173,
    open: true,
  },
});

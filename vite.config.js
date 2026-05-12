import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  root: '.',
  build: {
    outDir: 'tui-dist',
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'tui-index.html'),
    },
  },
});

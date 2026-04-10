import {defineConfig} from 'vite';
import marko from '@marko/vite';

export default defineConfig({
  plugins: [
    marko({
      // Client-only mode for Storybook — no SSR linking needed.
      linked: false,
    }),
  ],
  optimizeDeps: {
    exclude: ['@dnd-kit/*'],
  },
});

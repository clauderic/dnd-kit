import {defineConfig} from 'tsup';

export default defineConfig((options) => ({
  dts: true,
  outDir: './',
  external: ['@dnd-kit/abstract', '@dnd-kit/dom'],
  format: ['esm', 'cjs'],
  loader: {
    '.css': 'text',
  },
  sourcemap: true,
  treeshake: !options.watch,
}));

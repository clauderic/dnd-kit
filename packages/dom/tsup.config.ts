import {defineConfig} from 'tsup';

export default defineConfig((options) => ({
  dts: true,
  outDir: './',
  external: ['@dnd-kit/abstract', '@dnd-kit/dom'],
  esbuildOptions(options) {
    options.target = 'esnext';
  },
  format: ['esm', 'cjs'],
  loader: {
    '.css': 'text',
  },
  sourcemap: true,
  treeshake: !options.watch,
}));

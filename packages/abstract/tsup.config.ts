import {defineConfig} from 'tsup';

export default defineConfig((options) => ({
  dts: true,
  outDir: './',
  external: ['@dnd-kit/abstract'],
  esbuildOptions(options) {
    options.target = 'esnext';
  },
  format: ['esm', 'cjs'],
  sourcemap: true,
  treeshake: !options.watch,
}));

import {defineConfig} from 'tsup';

export default defineConfig((options) => ({
  dts: true,
  outDir: './',
  external: ['@dnd-kit/abstract'],
  format: ['esm', 'cjs'],
  sourcemap: true,
  treeshake: !options.watch,
  watch: ['src/**/*.(ts,tsx)'],
}));

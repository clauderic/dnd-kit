import {defineConfig} from 'tsup';

export default defineConfig((options) => ({
  dts: true,
  outDir: './',
  external: [
    '@dnd-kit/abstract',
    '@dnd-kit/solid',
    '@dnd-kit/dom',
    '@dnd-kit/state',
  ],
  format: ['esm', 'cjs'],
  sourcemap: true,
  treeshake: !options.watch,
}));

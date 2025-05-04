import {defineConfig} from 'tsup';

export default defineConfig((options) => ({
  dts: true,
  outDir: './',
  external: [
    '@dnd-kit/abstract',
    '@dnd-kit/dom',
    '@dnd-kit/state',
    '@dnd-kit/geometry',
    '@dnd-kit/collision',
  ],
  format: ['esm', 'cjs'],
  loader: {
    '.css': 'text',
  },
  sourcemap: true,
  treeshake: !options.watch,
}));

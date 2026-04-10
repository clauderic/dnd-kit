import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    'index': 'src/index.ts',
    'runtime/context': 'src/runtime/context.ts',
    'runtime/renderer': 'src/runtime/renderer.ts',
    'runtime/defaults': 'src/runtime/defaults.ts',
  },
  outDir: 'dist',
  format: ['esm'],
  dts: true,
  sourcemap: true,
  external: [
    '@dnd-kit/abstract',
    '@dnd-kit/dom',
    '@dnd-kit/state',
    '@dnd-kit/helpers',
    '@marko/runtime-tags',
    'marko',
  ],
  treeshake: true,
});
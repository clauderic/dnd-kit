import {defineConfig} from 'tsup';
import {solidPlugin} from 'esbuild-plugin-solid';

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
  esbuildPlugins: [solidPlugin()],
  esbuildOptions(esbuildOptions) {
    esbuildOptions.jsx = 'preserve';
    esbuildOptions.jsxImportSource = 'solid-js';
  },
}));

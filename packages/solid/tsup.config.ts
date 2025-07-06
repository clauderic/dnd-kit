import {defineConfig} from 'tsup';
import {solidPlugin} from 'esbuild-plugin-solid';

export default defineConfig((options) => ({
  dts: true,
  outDir: './dist',
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
  esbuildOptions(options) {
    options.jsx = 'preserve';
    options.jsxImportSource = 'solid-js';
  },
}));

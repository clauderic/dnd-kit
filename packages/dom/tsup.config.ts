import {defineConfig} from 'tsup';
import esbuildPluginTsc from 'esbuild-plugin-tsc';

export default defineConfig((options) => ({
  dts: true,
  outDir: './',
  external: ['@dnd-kit/dom'],
  loader: {
    '.css': 'text',
  },
  esbuildOptions(options) {
    options.target = 'esnext';
  },
  esbuildPlugins: [
    esbuildPluginTsc({
      force: true,
      tsx: true,
    }),
  ],
  format: ['esm', 'cjs'],
  sourcemap: true,
  treeshake: !options.watch,
}));

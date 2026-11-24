import {readFile} from 'node:fs/promises';
import {transformAsync} from '@babel/core';
import ts from '@babel/preset-typescript';
import solid from '@solidjs/babel-plugin';
import type {Plugin} from 'esbuild';
import {defineConfig} from 'tsup';

// Inline Solid plugin since esbuild-plugin-solid doesn't support SolidJS 2.0
const solidPlugin: Plugin = {
  name: 'solid2',
  setup(build) {
    build.onLoad({filter: /\.[jt]sx$/}, async ({path}) => {
      const result = await transformAsync(await readFile(path, 'utf8'), {
        filename: path,
        plugins: [solid],
        presets: [ts],
        sourceMaps: 'inline',
        babelrc: false,
        configFile: false,
      });

      return {contents: result!.code!, loader: 'js'};
    });
  },
};

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
  esbuildPlugins: [solidPlugin],
  esbuildOptions(esbuildOptions) {
    esbuildOptions.jsx = 'preserve';
    esbuildOptions.jsxImportSource = '@solidjs/web';
  },
}));

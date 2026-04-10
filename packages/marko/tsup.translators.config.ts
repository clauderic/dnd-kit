import { defineConfig } from 'tsup';

// Marko compiler loads translators via synchronous require() — must be CJS.
// Output as .cjs files; marko-tag.json references ./translator.cjs
export default defineConfig({
  entry: {
    '_translator-utils': 'tags/_translator-utils.ts',
    'create-draggable/translator': 'tags/create-draggable/translator.ts',
    'create-droppable/translator': 'tags/create-droppable/translator.ts',
    'create-sortable/translator': 'tags/create-sortable/translator.ts',
    'dnd-context-write/translator': 'tags/dnd-context-write/translator.ts',
  },
  outDir: 'tags',
  format: ['cjs'],
  outExtension: () => ({ js: '.cjs' }),
  dts: false,
  sourcemap: true,
  external: [
    '@marko/compiler',
    '@marko/runtime-tags',
  ],
  treeshake: false,
});
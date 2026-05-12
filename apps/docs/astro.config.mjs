import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { mintlify } from '@mintlify/astro';
import { resolve } from 'path';

import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://dndkit.com',
  trailingSlash: 'ignore',
  integrations: [
    mintlify({ docsDir: './docs' }),
    react(),
    mdx(),
    sitemap({
      serialize(item) {
        if (item.url.includes('/legacy/')) {
          item.priority = 0.3;
        } else {
          item.priority = 0.7;
        }
        return item;
      },
    }),
  ],
  redirects: {
    // Preserve legacy group/index links that predate the generated DndContext page.
    // Remove this once a context-provider index page exists.
    '/legacy/api-documentation/context-provider':
      '/legacy/api-documentation/context-provider/dnd-context',
    // Keep stale production links working after legacy introduction pages are fixed.
    // The legacy MDX previously used relative links like `../api-documentation/...`,
    // which Mintlify resolved against `/legacy/introduction/...`, producing the URLs below.
    '/legacy/introduction/api-documentation/context-provider':
      '/legacy/api-documentation/context-provider/dnd-context',
    '/legacy/introduction/api-documentation/context-provider/dnd-context':
      '/legacy/api-documentation/context-provider/dnd-context',
    '/legacy/introduction/api-documentation/context-provider/collision-detection-algorithms':
      '/legacy/api-documentation/context-provider/collision-detection-algorithms',
    '/legacy/introduction/api-documentation/context-provider/use-dnd-context':
      '/legacy/api-documentation/context-provider/use-dnd-context',
    '/legacy/introduction/api-documentation/context-provider/use-dnd-monitor':
      '/legacy/api-documentation/context-provider/use-dnd-monitor',
    '/legacy/introduction/api-documentation/draggable':
      '/legacy/api-documentation/draggable',
    '/legacy/introduction/api-documentation/draggable/drag-overlay':
      '/legacy/api-documentation/draggable/drag-overlay',
    '/legacy/introduction/api-documentation/draggable/use-draggable':
      '/legacy/api-documentation/draggable/use-draggable',
    '/legacy/introduction/api-documentation/droppable':
      '/legacy/api-documentation/droppable',
    '/legacy/introduction/api-documentation/droppable/use-droppable':
      '/legacy/api-documentation/droppable/use-droppable',
    '/legacy/introduction/api-documentation/modifiers':
      '/legacy/api-documentation/modifiers',
    '/legacy/introduction/api-documentation/sensors':
      '/legacy/api-documentation/sensors',
    '/legacy/introduction/api-documentation/sensors/keyboard':
      '/legacy/api-documentation/sensors/keyboard',
    '/legacy/introduction/api-documentation/sensors/mouse':
      '/legacy/api-documentation/sensors/mouse',
    '/legacy/introduction/api-documentation/sensors/pointer':
      '/legacy/api-documentation/sensors/pointer',
    '/legacy/introduction/api-documentation/sensors/touch':
      '/legacy/api-documentation/sensors/touch',
    '/legacy/introduction/guides/accessibility': '/legacy/guides/accessibility',
    '/legacy/introduction/presets/sortable':
      '/legacy/presets/sortable/overview',
    '/legacy/introduction/presets/sortable/sortable-context':
      '/legacy/presets/sortable/sortable-context',
    '/legacy/introduction/presets/sortable/use-sortable':
      '/legacy/presets/sortable/use-sortable',
  },
  markdown: {
    shikiConfig: {
      theme: 'monokai',
    },
  },
  vite: {
    define: {
      'process.env': '{}',
    },
    plugins: [tailwindcss()],
    resolve: {
      alias: [
        {
          // Generated Mintlify React snippets import this package directly.
          find: /^@mintlify\/components$/,
          replacement: resolve('./src/lib/mintlify-components-extended.tsx'),
        },
        {
          // The wrapper above re-exports the real package under this escape hatch.
          find: /^@mintlify\/components-original$/,
          replacement: resolve(
            '../../node_modules/@mintlify/components/dist/index.js',
          ),
        },
        {
          find: '@mintlify/astro/components',
          replacement: resolve('./src/lib/mintlify-components.tsx'),
        },
        {
          find: '@mintlify/astro-internal-components',
          replacement: resolve(
            '../../node_modules/@mintlify/astro/dist/utils/mintlify-components.js',
          ),
        },
        {
          find: '@components/CodeSandbox',
          replacement: resolve('./src/components/CodeSandbox.tsx'),
        },
      ],
    },
  },
});

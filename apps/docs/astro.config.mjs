import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { mintlify } from '@mintlify/astro';
import { resolve } from 'path';

import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://dndkit.com',
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
    '/legacy/api-documentation/context-provider':
      '/legacy/api-documentation/context-provider/dnd-context',
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

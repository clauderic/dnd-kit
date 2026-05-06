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
      alias: {
        '@mintlify/astro/components': resolve('./src/lib/mintlify-components.tsx'),
        '@mintlify/astro-internal-components': resolve(
          '../../node_modules/@mintlify/astro/dist/utils/mintlify-components.js'
        ),
        '@components/CodeSandbox': resolve('./src/components/CodeSandbox.tsx'),
        '@mintlify/components-original': resolve('./node_modules/@mintlify/components')
      },
    },
  },
});

import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { mintlify } from '@mintlify/astro';
import { resolve } from 'path';

import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://dndkit.com',
  integrations: [mintlify({ docsDir: './docs' }), preact({ compat: true }), mdx(), sitemap()],
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
      },
    },
  },
});

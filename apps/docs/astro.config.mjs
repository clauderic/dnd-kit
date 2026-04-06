import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import { mintlify } from '@mintlify/astro';
import { resolve } from 'path';

import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  integrations: [mintlify({ docsDir: './docs' }), react(), mdx()],
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

import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import { mintlify } from '@mintlify/astro';

import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  integrations: [mintlify({ docsDir: './docs' }), react(), mdx()],
  markdown: {
    shikiConfig: {
      theme: 'github-light-default',
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});

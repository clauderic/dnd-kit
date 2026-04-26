import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { mintlify } from '@mintlify/astro';
import { resolve, join } from 'path';
import { existsSync, readFileSync } from 'fs';

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
    plugins: [
      tailwindcss(),
      /*
       * @mintlify/components was published with .pnpm-style paths baked into its
       * dist files (it was built in a pnpm monorepo). Redirect any .pnpm package
       * path to the corresponding flat node_modules entry so bun's layout works.
       */
      {
        name: 'resolve-pnpm-paths',
        enforce: 'pre',
        resolveId(id, importer) {
          // Redirect .pnpm-style absolute paths to flat node_modules layout
          const pnpmMatch = id.match(/[/\\]\.pnpm[/\\][^/\\]+[/\\]node_modules[/\\]([^/\\]+)((?:[/\\].*)?$)/);
          if (pnpmMatch) {
            const [, packageName, suffix] = pnpmMatch;
            let flatPath = join(resolve('../../node_modules'), packageName, suffix || '');
            // Some packages renamed dist/*.js → dist/*.mjs; fall back when .js is missing
            if (flatPath.endsWith('.js') && !existsSync(flatPath)) {
              const mjs = flatPath.slice(0, -3) + '.mjs';
              if (existsSync(mjs)) flatPath = mjs;
            }
            // If the importer is a _virtual/*.js file, it expects a { __require } named
            // export (a Rollup CJS interop artifact). Provide a virtual shim module.
            if (importer && importer.includes('/_virtual/')) {
              return `\0mintlify-cjs-shim:${flatPath}`;
            }
            return flatPath;
          }
        },
        load(id, { ssr } = {}) {
          if (id.startsWith('\0mintlify-cjs-shim:')) {
            const flatPath = id.slice('\0mintlify-cjs-shim:'.length);
            if (ssr) {
              // SSR (Node.js): use createRequire to load the CJS module at runtime
              return [
                `import { createRequire } from 'module';`,
                `const _r = createRequire(import.meta.url);`,
                `export const __require = () => _r(${JSON.stringify(flatPath)});`,
              ].join('\n');
            }
            // Browser: inline the CJS module exports via a synchronous require shim
            const src = readFileSync(flatPath, 'utf8');
            const escaped = JSON.stringify(src);
            return [
              `const module = { exports: {} };`,
              `const exports = module.exports;`,
              `(new Function('module', 'exports', 'require', ${escaped}))(`,
              `  module, exports, () => { throw new Error('require() not available in browser'); }`,
              `);`,
              `export const __require = () => module.exports;`,
            ].join('\n');
          }
        },
      },
    ],
    ssr: {
      noExternal: ['@mintlify/components'],
    },
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

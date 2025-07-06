import {mergeConfig} from 'vite';
// import reactPlugin from '@vitejs/plugin-react';
import path from 'path';

const rootDir = path.resolve(__dirname, '..');

export default {
  framework: 'storybook-solidjs-vite',
  stories: ['../stories/**/*.stories.mdx', '../stories/**/*.stories.tsx'],

  addons: [
    '@storybook/addon-links',
    '@vueless/storybook-dark-mode',
    "@storybook/addon-docs"
  ],

  async viteFinal(config) {
    const { default: solidPlugin } = await import('vite-plugin-solid');
    
    config.plugins = config.plugins.filter((plugin) => plugin.name && !plugin.name.includes('solid'));
    
    config.plugins.push(
      // Compile *.react.tsx files as React components
      // reactPlugin({
      //   jsxRuntime: 'automatic',
      //   jsxImportSource: 'react',
      //   include: ['**/*.react.tsx'],
      // }),
      // And anything else as Solid components
      solidPlugin({
        include: [
          path.resolve(rootDir, '**/*.tsx'),
          path.resolve(rootDir, '../../packages/solid/**/*.tsx'),
        ],
        exclude: ['**/*.mdx', '**/*.react.tsx'],
      })
    );
    
    return mergeConfig(config, {
      define: {
        'process.env': {},
      },
      optimizeDeps: {
        exclude: ['@dnd-kit/*'],
      },
      resolve: {
        alias: {
          '@': rootDir,
        },
      },
    });
  },
  docs: {
      autodocs: true,
  },
  typescript: {
      reactDocgen: 'react-docgen-typescript',
      reactDocgenTypescriptOptions: {
          shouldExtractLiteralValuesFromEnum: true,
          // 👇 Default prop filter, which excludes props from node_modules
          propFilter: (prop: any) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
      },
  },
};
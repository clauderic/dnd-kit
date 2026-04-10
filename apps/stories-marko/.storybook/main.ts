import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { StorybookConfig } from '@storybook/marko-vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sharedPreviewHead = readFileSync(
  join(__dirname, '..', '..', 'stories-shared', 'preview-head.html'),
  'utf-8'
);

const config: StorybookConfig = {
  previewHead: (head: string) => `${sharedPreviewHead}\n${head}`,

  stories: ['../stories/**/*.stories.ts'],

  addons: [
    '@storybook/addon-links',
    '@vueless/storybook-dark-mode',
  ],

  framework: {
    name: '@storybook/marko-vite',
    options: {},
  },

  async viteFinal(config: any) {
    config.define = {
      ...config.define,
      'process.env': {},
    };
    config.optimizeDeps = {
      ...config.optimizeDeps,
      exclude: [...(config.optimizeDeps?.exclude || []), '@dnd-kit/*'],
    };
    return config;
  },
};

export default config;
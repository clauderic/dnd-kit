import {dirname, join} from 'path';
import {mergeConfig} from 'vite';

export default {
  stories: ['../stories/**/*.stories.ts'],

  addons: [
    getAbsolutePath('@storybook/addon-links'),
    getAbsolutePath('@vueless/storybook-dark-mode'),
  ],

  framework: {
    name: getAbsolutePath('@storybook/html-vite'),
    options: {},
  },

  async viteFinal(config) {
    return mergeConfig(config, {
      define: {
        'process.env': {},
      },
      optimizeDeps: {
        exclude: ['@dnd-kit/*'],
      },
    });
  },
};

function getAbsolutePath(value) {
  return dirname(require.resolve(join(value, 'package.json')));
}

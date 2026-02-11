import {dirname, join} from 'path';
import {mergeConfig} from 'vite';
import vue from '@vitejs/plugin-vue';

export default {
  stories: ['../stories/**/*.stories.ts'],

  addons: [
    getAbsolutePath('@storybook/addon-links'),
    getAbsolutePath('@vueless/storybook-dark-mode'),
    getAbsolutePath('@dnd-kit/storybook-addon-codesandbox'),
  ],

  framework: {
    name: getAbsolutePath('@storybook/vue3-vite'),
    options: {},
  },

  async viteFinal(config) {
    return mergeConfig(config, {
      plugins: [
        vue({
          template: {
            compilerOptions: {
              isCustomElement: (tag) => tag.includes('-'),
            },
          },
        }),
      ],
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

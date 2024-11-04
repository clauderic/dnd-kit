import {dirname, join} from 'path';
import {mergeConfig} from 'vite';

export default {
  stories: ['../stories/**/*.stories.tsx'],

  addons: [
    getAbsolutePath('@storybook/addon-links'),
    getAbsolutePath('@storybook/addon-essentials'),
    getAbsolutePath('storybook-dark-mode'),
  ],

  framework: {
    name: getAbsolutePath('@storybook/react-vite'),
    options: {
      strictMode: true,
    },
  },

  async viteFinal(config, {configType}) {
    // customize the Vite config here
    return mergeConfig(config, {
      define: {
        'process.env': {},
      },
      optimizeDeps: {
        exclude: ['@dnd-kit/*'],
      },
    });
  },

  docs: {},

  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },
};

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value) {
  return dirname(require.resolve(join(value, 'package.json')));
}

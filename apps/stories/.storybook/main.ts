import {dirname, join} from 'path';
import {mergeConfig} from 'vite';

export default {
  stories: ['../stories/**/*.stories.mdx', '../stories/**/*.stories.tsx'],

  addons: [
    getAbsolutePath('@storybook/addon-links'),
    getAbsolutePath('@vueless/storybook-dark-mode'),
    getAbsolutePath("@storybook/addon-docs")
  ],

  framework: {
    name: getAbsolutePath('@storybook/react-vite'),
    options: {
      strictMode: true,
    },
  },

  refs: () => {
    const refs: Record<string, {title: string; url: string}> = {};

    if (process.env.VANILLA_STORYBOOK_URL) {
      refs.vanilla = {title: 'Vanilla', url: process.env.VANILLA_STORYBOOK_URL};
    }

    if (process.env.VUE_STORYBOOK_URL) {
      refs.vue = {title: 'Vue', url: process.env.VUE_STORYBOOK_URL};
    }

    if (process.env.SOLID_STORYBOOK_URL) {
      refs.solid = {title: 'Solid', url: process.env.SOLID_STORYBOOK_URL};
    }

    return refs;
  },

  async viteFinal(config) {
    // customize the Vite config here
    return mergeConfig(config, {
      define: {
        'process.env': {},
      },
      optimizeDeps: {
        exclude: ['@dnd-kit/*'],
      },
    });
  }
};

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value) {
  return dirname(require.resolve(join(value, 'package.json')));
}

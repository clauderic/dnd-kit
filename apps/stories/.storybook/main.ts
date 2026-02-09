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

  refs: (_config, {configType}) => {
    const refs: Record<string, {title: string; url: string}> = {};

    const vanillaUrl =
      configType === 'DEVELOPMENT'
        ? 'http://localhost:6007'
        : process.env.VANILLA_STORYBOOK_URL;

    const vueUrl =
      configType === 'DEVELOPMENT'
        ? 'http://localhost:6008'
        : process.env.VUE_STORYBOOK_URL;

    if (vanillaUrl) refs.vanilla = {title: 'Vanilla', url: vanillaUrl};
    if (vueUrl) refs.vue = {title: 'Vue', url: vueUrl};

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

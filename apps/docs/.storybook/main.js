import {mergeConfig} from 'vite';
import {addons} from '@storybook/manager-api';

import {theme} from './theme';

addons.setConfig({
  theme,
});

export default {
  stories: ['../stories/**/*.stories.mdx', '../stories/**/*.stories.tsx'],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials'],
  framework: '@storybook/react-vite',
  core: {
    builder: '@storybook/builder-vite',
  },
  async viteFinal(config, {configType}) {
    // customize the Vite config here
    return mergeConfig(config, {
      define: {'process.env': {}},
    });
  },
};

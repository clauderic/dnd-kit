import {
  getAbsolutePath,
  getAddons,
  sharedViteFinal,
} from '@dnd-kit/stories/.storybook/shared';

export default {
  stories: ['../stories/**/*.stories.mdx', '../stories/**/*.stories.tsx'],

  addons: getAddons(),

  framework: {
    name: getAbsolutePath('@storybook/react-vite'),
    options: {
      strictMode: true,
    },
  },

  viteFinal: sharedViteFinal,
};

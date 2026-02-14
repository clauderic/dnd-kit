import type {Meta, StoryObj} from '@storybook/svelte-vite';

import HorizontalSortableApp from './HorizontalSortableApp.svelte';
import horizontalSortableSource from './HorizontalSortableApp.svelte?raw';
import {
  baseStyles,
  sortableStyles,
} from '@dnd-kit/stories-shared/styles/sandbox';

const meta: Meta = {
  title: 'Sortable/Horizontal list',
};

export default meta;
type Story = StoryObj;

export const BasicSetup: Story = {
  name: 'Basic setup',
  render: () => ({Component: HorizontalSortableApp}),
  parameters: {
    codesandbox: {
      files: {
        'src/App.svelte': horizontalSortableSource,
        'src/styles.css': [baseStyles, sortableStyles].join('\n\n'),
      },
    },
  },
};

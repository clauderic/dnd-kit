import type {Meta, StoryObj} from '@storybook/svelte-vite';

import GridSortableApp from './GridSortableApp.svelte';
import gridSortableSource from './GridSortableApp.svelte?raw';
import {
  baseStyles,
  sortableStyles,
} from '@dnd-kit/stories-shared/styles/sandbox';

const meta: Meta = {
  title: 'Sortable/Grid',
};

export default meta;
type Story = StoryObj;

export const BasicSetup: Story = {
  name: 'Basic setup',
  render: () => ({Component: GridSortableApp}),
  parameters: {
    codesandbox: {
      files: {
        'src/App.svelte': gridSortableSource,
        'src/styles.css': [baseStyles, sortableStyles].join('\n\n'),
      },
    },
  },
};

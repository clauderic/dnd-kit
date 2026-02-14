import type {Meta, StoryObj} from '@storybook/svelte-vite';

import SortableApp from '../SortableApp.svelte';
import sortableSource from '../SortableApp.svelte?raw';
import SortableDragHandleApp from '../SortableDragHandleApp.svelte';
import sortableDragHandleSource from '../SortableDragHandleApp.svelte?raw';
import {
  baseStyles,
  handleStyles,
  sortableStyles,
} from '@dnd-kit/stories-shared/styles/sandbox';

const meta: Meta = {
  title: 'Sortable/Vertical list',
};

export default meta;
type Story = StoryObj;

export const BasicSetup: Story = {
  name: 'Basic setup',
  render: () => ({Component: SortableApp}),
  parameters: {
    codesandbox: {
      files: {
        'src/App.svelte': sortableSource,
        'src/styles.css': [baseStyles, sortableStyles].join('\n\n'),
      },
    },
  },
};

export const WithDragHandle: Story = {
  name: 'Drag handle',
  render: () => ({Component: SortableDragHandleApp}),
  parameters: {
    codesandbox: {
      files: {
        'src/App.svelte': sortableDragHandleSource,
        'src/styles.css': [baseStyles, sortableStyles, handleStyles].join(
          '\n\n'
        ),
      },
    },
  },
};

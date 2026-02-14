import type {Meta, StoryObj} from '@storybook/svelte-vite';

import DroppableApp from './DroppableApp.svelte';
import droppableSource from './DroppableApp.svelte?raw';
import {
  baseStyles,
  draggableStyles,
  droppableStyles,
} from '@dnd-kit/stories-shared/styles/sandbox';

const meta: Meta<typeof DroppableApp> = {
  title: 'Droppable/Basic setup',
  component: DroppableApp,
};

export default meta;
type Story = StoryObj<typeof DroppableApp>;

export const Example: Story = {
  parameters: {
    codesandbox: {
      files: {
        'src/App.svelte': droppableSource,
        'src/styles.css': [baseStyles, draggableStyles, droppableStyles].join(
          '\n\n'
        ),
      },
    },
  },
};

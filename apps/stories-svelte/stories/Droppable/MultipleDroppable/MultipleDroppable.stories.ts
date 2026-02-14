import type {Meta, StoryObj} from '@storybook/svelte-vite';

import MultipleDroppableApp from './MultipleDroppableApp.svelte';
import multipleDroppableSource from './MultipleDroppableApp.svelte?raw';
import {
  baseStyles,
  draggableStyles,
  droppableStyles,
} from '@dnd-kit/stories-shared/styles/sandbox';

const meta: Meta<typeof MultipleDroppableApp> = {
  title: 'Droppable/Multiple drop targets',
  component: MultipleDroppableApp,
};

export default meta;
type Story = StoryObj<typeof MultipleDroppableApp>;

export const Example: Story = {
  parameters: {
    codesandbox: {
      files: {
        'src/App.svelte': multipleDroppableSource,
        'src/styles.css': [baseStyles, draggableStyles, droppableStyles].join(
          '\n\n'
        ),
      },
    },
  },
};

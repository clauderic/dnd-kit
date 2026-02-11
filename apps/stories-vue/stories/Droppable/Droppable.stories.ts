import type {Meta, StoryObj} from '@storybook/vue3-vite';

import DroppableExample from './DroppableExample.vue';
import droppableSource from './DroppableApp.vue?raw';
import {baseStyles, draggableStyles, droppableStyles} from '@dnd-kit/stories-shared/styles/sandbox';

const meta: Meta<typeof DroppableExample> = {
  title: 'Droppable/Basic setup',
  component: DroppableExample,
};

export default meta;
type Story = StoryObj<typeof DroppableExample>;

export const Example: Story = {
  parameters: {
    codesandbox: {
      files: {
        'src/App.vue': droppableSource,
        'src/styles.css': [baseStyles, draggableStyles, droppableStyles].join('\n\n'),
      },
    },
  },
};

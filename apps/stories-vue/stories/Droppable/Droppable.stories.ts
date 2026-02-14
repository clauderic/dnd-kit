import type {Meta, StoryObj} from '@storybook/vue3-vite';

import DroppableApp from './DroppableApp.vue';
import droppableSource from './DroppableApp.vue?raw';
import {baseStyles, draggableStyles, droppableStyles} from '@dnd-kit/stories-shared/styles/sandbox';

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
        'src/App.vue': droppableSource,
        'src/styles.css': [baseStyles, draggableStyles, droppableStyles].join('\n\n'),
      },
    },
  },
};

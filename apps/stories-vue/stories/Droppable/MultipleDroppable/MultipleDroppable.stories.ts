import type {Meta, StoryObj} from '@storybook/vue3-vite';

import MultipleDroppableApp from './MultipleDroppableApp.vue';
import multipleDroppableSource from './MultipleDroppableApp.vue?raw';
import {baseStyles, draggableStyles, droppableStyles} from '@dnd-kit/stories-shared/styles/sandbox';

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
        'src/App.vue': multipleDroppableSource,
        'src/styles.css': [baseStyles, draggableStyles, droppableStyles].join('\n\n'),
      },
    },
  },
};

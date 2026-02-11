import type {Meta, StoryObj} from '@storybook/vue3-vite';

import DraggableExample from './DraggableExample.vue';
import draggableSource from './DraggableApp.vue?raw';
import {baseStyles, draggableStyles} from '@dnd-kit/stories-shared/styles/sandbox';

const meta: Meta<typeof DraggableExample> = {
  title: 'Draggable/Basic setup',
  component: DraggableExample,
};

export default meta;
type Story = StoryObj<typeof DraggableExample>;

export const Example: Story = {
  parameters: {
    codesandbox: {
      files: {
        'src/App.vue': draggableSource,
        'src/styles.css': [baseStyles, draggableStyles].join('\n\n'),
      },
    },
  },
};

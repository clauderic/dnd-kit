import type {Meta, StoryObj} from '@storybook/html-vite';

import {DroppableExample} from './DroppableExample.ts';
import droppableSource from './DroppableApp.ts?raw';
import {baseStyles, draggableStyles, droppableStyles} from '@dnd-kit/stories-shared/styles/sandbox';

const meta: Meta = {
  title: 'Droppable/Basic setup',
};

export default meta;
type Story = StoryObj;

export const Example: Story = {
  render: () => DroppableExample().root,
  parameters: {
    codesandbox: {
      files: {
        'src/App.js': droppableSource,
        'src/styles.css': [baseStyles, draggableStyles, droppableStyles].join('\n\n'),
      },
    },
  },
};

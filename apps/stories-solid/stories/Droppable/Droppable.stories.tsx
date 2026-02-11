import type {Meta, StoryObj} from 'storybook-solidjs';

import {DroppableExample} from './DroppableExample';
import droppableSource from './DroppableApp.tsx?raw';
import {baseStyles, draggableStyles, droppableStyles} from '@dnd-kit/stories-shared/styles/sandbox';

const meta: Meta = {
  title: 'Droppable/Basic setup',
  component: DroppableExample,
};

export default meta;
type Story = StoryObj;

export const Example: Story = {
  parameters: {
    codesandbox: {
      files: {
        'src/App.tsx': droppableSource,
        'src/styles.css': [baseStyles, draggableStyles, droppableStyles].join('\n\n'),
      },
    },
  },
};

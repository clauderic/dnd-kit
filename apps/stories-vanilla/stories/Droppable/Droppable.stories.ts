import type {Meta, StoryObj} from '@storybook/html-vite';

import App from './DroppableApp.ts';
import droppableSource from './DroppableApp.ts?raw';
import {
  baseStyles,
  draggableStyles,
  droppableStyles,
} from '@dnd-kit/stories-shared/styles/sandbox';

const meta: Meta = {
  title: 'Droppable/Basic setup',
};

export default meta;
type Story = StoryObj;

export const Example: Story = {
  render: () => App(),
  parameters: {
    codesandbox: {
      files: {
        'src/App.ts': droppableSource,
        'src/styles.css': [baseStyles, draggableStyles, droppableStyles].join(
          '\n\n'
        ),
      },
    },
  },
};

import type {Meta, StoryObj} from '@storybook/html-vite';

import App from './MultipleDroppableApp.ts';
import multipleDroppableSource from './MultipleDroppableApp.ts?raw';
import {
  baseStyles,
  draggableStyles,
  droppableStyles,
} from '@dnd-kit/stories-shared/styles/sandbox';

const meta: Meta = {
  title: 'Droppable/Multiple drop targets',
};

export default meta;
type Story = StoryObj;

export const Example: Story = {
  render: () => App(),
  parameters: {
    codesandbox: {
      files: {
        'src/App.ts': multipleDroppableSource,
        'src/styles.css': [baseStyles, draggableStyles, droppableStyles].join(
          '\n\n'
        ),
      },
    },
  },
};

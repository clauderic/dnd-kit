import type {Meta, StoryObj} from '@storybook/html-vite';

import App from './DragHandleApp.ts';
import dragHandleSource from './DragHandleApp.ts?raw';
import {baseStyles, draggableStyles, handleStyles} from '@dnd-kit/stories-shared/styles/sandbox';

const meta: Meta = {
  title: 'Draggable/Drag handle',
};

export default meta;
type Story = StoryObj;

export const Example: Story = {
  render: () => App(),
  parameters: {
    codesandbox: {
      files: {
        'src/App.ts': dragHandleSource,
        'src/styles.css': [baseStyles, draggableStyles, handleStyles].join('\n\n'),
      },
    },
  },
};

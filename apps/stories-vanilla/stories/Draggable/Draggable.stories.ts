import type {Meta, StoryObj} from '@storybook/html-vite';

import App from './DraggableApp.ts';
import draggableSource from './DraggableApp.ts?raw';
import {baseStyles, draggableStyles} from '@dnd-kit/stories-shared/styles/sandbox';

const meta: Meta = {
  title: 'Draggable/Basic setup',
};

export default meta;
type Story = StoryObj;

export const Example: Story = {
  render: () => App(),
  parameters: {
    codesandbox: {
      files: {
        'src/App.ts': draggableSource,
        'src/styles.css': [baseStyles, draggableStyles].join('\n\n'),
      },
    },
  },
};

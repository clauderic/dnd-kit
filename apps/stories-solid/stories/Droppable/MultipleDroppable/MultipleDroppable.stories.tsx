import type {Meta, StoryObj} from 'storybook-solidjs';

import App from './MultipleDroppableApp';
import multipleDroppableSource from './MultipleDroppableApp.tsx?raw';
import {baseStyles, draggableStyles, droppableStyles} from '@dnd-kit/stories-shared/styles/sandbox';

const meta: Meta = {
  title: 'Droppable/Multiple drop targets',
  component: App,
};

export default meta;
type Story = StoryObj;

export const Example: Story = {
  parameters: {
    codesandbox: {
      files: {
        'src/App.tsx': multipleDroppableSource,
        'src/styles.css': [baseStyles, draggableStyles, droppableStyles].join('\n\n'),
      },
    },
  },
};

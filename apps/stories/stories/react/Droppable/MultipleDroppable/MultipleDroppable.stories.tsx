import type {Meta, StoryObj} from '@storybook/react-vite';

import MultipleDroppableApp from './MultipleDroppableApp';
import multipleDroppableSource from './MultipleDroppableApp.tsx?raw';
import {baseStyles, draggableStyles, droppableStyles} from '@dnd-kit/stories-shared/styles/sandbox';

const meta: Meta<typeof MultipleDroppableApp> = {
  title: 'React/Droppable/Multiple drop targets',
  component: MultipleDroppableApp,
};

export default meta;
type Story = StoryObj<typeof MultipleDroppableApp>;

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

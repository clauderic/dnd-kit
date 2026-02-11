import type {Meta, StoryObj} from '@storybook/react-vite';

import DroppableApp from './DroppableApp.tsx';
import droppableSource from './DroppableApp.tsx?raw';
import {baseStyles, draggableStyles, droppableStyles} from '@dnd-kit/stories-shared/styles/sandbox';
import docs from './docs/DroppableDocs.mdx';

const meta: Meta<typeof DroppableApp> = {
  title: 'React/Droppable',
  component: DroppableApp,
  tags: ['autodocs'],
  parameters: {
    docs: {
      page: docs,
    },
    codesandbox: {
      files: {
        'src/App.tsx': droppableSource,
        'src/styles.css': [baseStyles, draggableStyles, droppableStyles].join('\n\n'),
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof DroppableApp>;

export const Example: Story = {
  name: 'Example',
};

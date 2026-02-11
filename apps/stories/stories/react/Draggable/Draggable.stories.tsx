import type {Meta, StoryObj} from '@storybook/react-vite';

import DraggableApp from './DraggableApp.tsx';
import draggableSource from './DraggableApp.tsx?raw';
import {baseStyles, draggableStyles} from '@dnd-kit/stories-shared/styles/sandbox';
import docs from './docs/DraggableDocs.mdx';

const meta: Meta<typeof DraggableApp> = {
  title: 'React/Draggable',
  component: DraggableApp,
  tags: ['autodocs'],
  parameters: {
    docs: {
      page: docs,
    },
    codesandbox: {
      files: {
        'src/App.tsx': draggableSource,
        'src/styles.css': [baseStyles, draggableStyles].join('\n\n'),
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof DraggableApp>;

export const Example: Story = {
  name: 'Example',
};

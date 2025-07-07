import type {Meta, StoryObj} from 'storybook-solidjs-vite';

import {DroppableExample} from './DroppableExample';
import docs from './Droppable.docs.mdx';

const meta: Meta<typeof DroppableExample> = {
  title: 'Solid/Droppable',
  component: DroppableExample,
  tags: ['autodocs'],
  parameters: {
    docs: {
      page: docs,
    },
  },
};

export default meta;
type Story = StoryObj<typeof DroppableExample>;

export const Example: Story = {
  name: 'Example',
  args: {
    droppableCount: 1,
    debug: false,
  },
};

export const MultipleDropTargets: Story = {
  name: 'Multiple drop targets',
  args: { 
    droppableCount: 3,
    debug: false,
  },
};

export const Debug: Story = {
  name: 'Debug mode',
  args: {
    debug: true,
  },
};

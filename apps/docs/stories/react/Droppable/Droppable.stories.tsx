import type {Meta, StoryObj} from '@storybook/react';

import {DroppableExample} from './DroppableExample';
import docs from './docs/DroppableDocs.mdx';

const meta: Meta<typeof DroppableExample> = {
  title: 'React/Droppable',
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

export const BasicSetup: Story = {
  name: 'Example',
};

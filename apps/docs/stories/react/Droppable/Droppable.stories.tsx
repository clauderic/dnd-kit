import type {Meta, StoryObj} from '@storybook/react';

import {DroppableExample} from './DroppableExample';
import {KitchenSinkExample} from './KitchenSinkExample';
import docs from './docs/DroppableDocs.mdx';

const meta: Meta<typeof DroppableExample> = {
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

export const BasicSetup: Story = {};

export const MultipleDroppables: Story = {
  args: {
    parents: ['A', 'B', 'C'],
  },
};

export const KitchenSink: Story = {
  render: KitchenSinkExample,
};

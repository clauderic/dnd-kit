import type {Meta, StoryObj} from '@storybook/react';

import {DroppableExample} from '../DroppableExample';
import {KitchenSinkExample} from './KitchenSinkExample';

const meta: Meta<typeof DroppableExample> = {
  title: 'React/Droppable/Multiple drop targets',
  component: DroppableExample,
};

export default meta;
type Story = StoryObj<typeof DroppableExample>;

export const MultipleDroppables: Story = {
  args: {
    parents: ['A', 'B', 'C'],
  },
};

export const KitchenSink: Story = {
  render: KitchenSinkExample,
};

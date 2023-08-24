import type {Meta, StoryObj} from '@storybook/react';

import {DroppableExample} from '../DroppableExample';

const meta: Meta<typeof DroppableExample> = {
  title: 'React/Droppable/Multiple drop targets',
  component: DroppableExample,
};

export default meta;
type Story = StoryObj<typeof DroppableExample>;

export const MultipleDroppables: Story = {
  args: {
    droppableCount: 3,
    debug: false,
  },
};

export const Debug: Story = {
  args: {
    droppableCount: 3,
    debug: true,
  },
};

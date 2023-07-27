import type {Meta, StoryObj} from '@storybook/react';

import {DroppableExample} from './DroppableExample';

const meta: Meta<typeof DroppableExample> = {
  component: DroppableExample,
};

export default meta;
type Story = StoryObj<typeof DroppableExample>;

export const BasicSetup: Story = {
  args: {
    label: 'Basic setup',
  },
};

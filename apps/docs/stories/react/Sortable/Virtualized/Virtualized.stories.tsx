import type {Meta, StoryObj} from '@storybook/react';

import {VirtualizedSortableExample} from './VirtualizedSortableExample';

const meta: Meta<typeof VirtualizedSortableExample> = {
  component: VirtualizedSortableExample,
};

export default meta;
type Story = StoryObj<typeof VirtualizedSortableExample>;

export const ReactVirtual: Story = {
  name: 'react-virtual',
  render: VirtualizedSortableExample,
};

import type { Meta, StoryObj } from '@storybook/react';

import { ReactWindowExample } from './ReactWindowExample';
import { ReactVirtualExample } from './ReactVirtualExample';
import { ReactTinyVirtualListExample } from './ReactTinyVirtualListExample';
import { ReactVirtualFixedGridExample } from './ReactVirtualFixedGridExample';

const meta: Meta<typeof ReactVirtualExample> = {
  title: 'React/Sortable/Virtualized',
};

export default meta;
type Story = StoryObj<typeof ReactVirtualExample>;

export const ReactWindow: Story = {
  name: 'react-window',
  render: ReactWindowExample,
};

export const ReactTinyVirtualList: Story = {
  name: 'react-tiny-virtual-list',
  render: ReactTinyVirtualListExample,
};

export const ReactVirtual: Story = {
  name: 'react-virtual',
  render: ReactVirtualExample,
};

export const ReactVirtualGrid: Story = {
  name: 'react-virtual-fixed-grid',
  render: ReactVirtualFixedGridExample,
};
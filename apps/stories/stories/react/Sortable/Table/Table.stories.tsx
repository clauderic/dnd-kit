import type {Meta, StoryObj} from '@storybook/react-vite';

import {TableExample} from './TableExample.tsx';

const meta: Meta<typeof TableExample> = {
  title: 'React/Sortable/Table',
  component: TableExample,
};

export default meta;
type Story = StoryObj<typeof TableExample>;

export const DragHandle: Story = {
  name: 'Drag handle',
  args: {
    dragHandle: true,
  },
};

export const FullRow: Story = {
  name: 'Full row',
  args: {
    dragHandle: false,
  },
};

export const SortableColumns: Story = {
  name: 'Sortable columns',
  args: {
    dragHandle: true,
    sortableColumns: true,
  },
};

import type {Meta, StoryObj} from '@storybook/react';

import {SortableExample} from './SortableExample';
import docs from './docs/SortableDocs.mdx';

const meta: Meta<typeof SortableExample> = {
  component: SortableExample,
  title: 'React/Sortable',
  tags: ['autodocs'],
  parameters: {
    docs: {
      page: docs,
    },
  },
};

export default meta;
type Story = StoryObj<typeof SortableExample>;

export const Demo: Story = {
  name: 'Example',
  args: {
    dragHandle: true,
    debug: false,
    itemCount: 11,
  },
};

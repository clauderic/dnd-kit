import type {Meta, StoryObj} from '@storybook/react-vite';

import {SortableExample} from './SortableExample.tsx';
import {QuickstartExample} from './Quickstart.tsx';

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

export const Example: Story = {
  name: 'Example',
  args: {
    dragHandle: true,
    debug: false,
    itemCount: 11,
  },
};

export const Quickstart: Story = {
  name: 'Quickstart',
  tags: ['hidden'],
  render: () => <QuickstartExample />,
};

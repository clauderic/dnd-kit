import type {Meta, StoryObj} from '@storybook/react';

import {SortableExample} from './SortableExample';
import docs from './docs/Docs.mdx';

const meta: Meta<typeof SortableExample> = {
  component: SortableExample,
  tags: ['autodocs'],
  parameters: {
    docs: {
      page: docs,
    },
  },
};

export default meta;
type Story = StoryObj<typeof SortableExample>;

export const BasicSetup: Story = {
  render: SortableExample,
};

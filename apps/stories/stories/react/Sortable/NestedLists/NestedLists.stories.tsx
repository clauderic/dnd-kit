import type {Meta, StoryObj} from '@storybook/react';

import {NestedLists} from './NestedLists.tsx';

const meta: Meta<typeof NestedLists> = {
  title: 'React/Sortable/Nested lists',
  component: NestedLists,
};

export default meta;
type Story = StoryObj<typeof NestedLists>;

export const Example: Story = {
  name: 'Example',
  args: {
    debug: false,
  },
};

export const Debug: Story = {
  name: 'Debug',
  args: {
    debug: true,
  },
};

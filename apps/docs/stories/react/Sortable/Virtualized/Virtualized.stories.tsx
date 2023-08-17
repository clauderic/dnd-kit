import type {Meta, StoryObj} from '@storybook/react';

import {ReactVirtualExample} from './ReactVirtualExample';

const meta: Meta<typeof ReactVirtualExample> = {
  component: ReactVirtualExample,
};

export default meta;
type Story = StoryObj<typeof ReactVirtualExample>;

export const ReactVirtual: Story = {
  name: 'react-virtual',
  args: {
    debug: false,
  },
};

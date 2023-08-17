import type {Meta, StoryObj} from '@storybook/react';

import {MultipleContainers} from './MultipleContainers';

const meta: Meta<typeof MultipleContainers> = {
  component: MultipleContainers,
};

export default meta;
type Story = StoryObj<typeof MultipleContainers>;

export const BasicSetup: Story = {
  name: 'Basic setup',
  args: {
    debug: false,
    itemCount: 6,
  },
};

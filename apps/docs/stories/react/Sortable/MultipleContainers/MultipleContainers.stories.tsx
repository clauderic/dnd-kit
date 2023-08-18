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

export const Scrollable: Story = {
  name: 'Scrollable containers',
  args: {
    debug: false,
    itemCount: 25,
    scrollable: true,
  },
};

export const Grid: Story = {
  name: 'Grid',
  args: {
    debug: false,
    itemCount: 5,
    grid: true,
  },
};

export const VerticalSetup: Story = {
  name: 'Vertical',
  args: {
    debug: false,
    itemCount: 3,
    vertical: true,
  },
};

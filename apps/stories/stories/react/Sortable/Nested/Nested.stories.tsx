import type {Meta, StoryObj} from '@storybook/react-vite';

import {Nested} from './Nested';
import {TRANSFER_DELAY} from './useContainerHover';

const meta: Meta<typeof Nested> = {
  title: 'React/Sortable/Nested collections',
  component: Nested,
  args: {transferDelay: TRANSFER_DELAY},
  argTypes: {
    transferDelay: {
      name: 'Container hover delay',
      control: {type: 'range', min: 0, max: 800, step: 50},
    },
  },
  parameters: {layout: 'padded'},
};

export default meta;
type Story = StoryObj<typeof Nested>;

export const Example: Story = {};

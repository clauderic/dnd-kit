import type {Meta, StoryObj} from '@storybook/react-vite';

import {ScaledExample} from './ScaledExample';

const meta: Meta<typeof ScaledExample> = {
  title: 'React/Sortable/Scaled',
  component: ScaledExample,
  tags: ['hidden'],
};

export default meta;
type Story = StoryObj<typeof ScaledExample>;

export const BasicSetup: Story = {
  name: 'Basic setup',
};

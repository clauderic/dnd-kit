import type {Meta, StoryObj} from '@storybook/react-vite';

import {MarginsExample} from './MarginsExample';

const meta: Meta<typeof MarginsExample> = {
  title: 'React/Sortable/Margins',
  component: MarginsExample,
  tags: ['hidden'],
};

export default meta;
type Story = StoryObj<typeof MarginsExample>;

export const BasicSetup: Story = {
  name: 'Basic setup',
};

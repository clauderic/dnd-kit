import type {Meta, StoryObj} from '@storybook/react-vite';

import {TransformedExample} from './TransformedExample';

const meta: Meta<typeof TransformedExample> = {
  title: 'React/Sortable/Transformed',
  component: TransformedExample,
};

export default meta;
type Story = StoryObj<typeof TransformedExample>;

export const WithoutOverlay: Story = {
  name: 'Without overlay',
  args: {
    overlay: false,
  },
};

export const WithOverlay: Story = {
  name: 'With overlay',
  args: {
    overlay: true,
  },
};

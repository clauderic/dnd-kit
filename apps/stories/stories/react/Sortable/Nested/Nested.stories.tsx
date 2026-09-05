import type {Meta, StoryObj} from '@storybook/react-vite';

import {Nested} from './Nested';

const meta: Meta<typeof Nested> = {
  title: 'React/Sortable/Nested collections',
  component: Nested,
  parameters: {layout: 'padded'},
};

export default meta;
type Story = StoryObj<typeof Nested>;

export const Example: Story = {};

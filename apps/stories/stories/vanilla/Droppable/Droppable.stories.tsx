import type {Meta, StoryObj} from '@storybook/react-vite';

import {DroppableExample} from './DroppableExample.ts';

const meta: Meta<typeof DroppableExample> = {
  component: DroppableExample,
};

export default meta;
type Story = StoryObj<typeof DroppableExample>;

export const Example: Story = {
  name: 'Example',
};

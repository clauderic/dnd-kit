import type {Meta, StoryObj} from '@storybook/react-vite';

import {DraggableExample} from './DraggableExample.ts';

const meta: Meta<typeof DraggableExample> = {
  component: DraggableExample,
};

export default meta;
type Story = StoryObj<typeof DraggableExample>;

export const Example: Story = {
  name: 'Example',
};

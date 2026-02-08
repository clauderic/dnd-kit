import type {Meta, StoryObj} from '@storybook/html-vite';

import {DroppableExample} from './DroppableExample.ts';

const meta: Meta = {
  title: 'Droppable/Basic setup',
};

export default meta;
type Story = StoryObj;

export const Example: Story = {
  render: () => DroppableExample().root,
};

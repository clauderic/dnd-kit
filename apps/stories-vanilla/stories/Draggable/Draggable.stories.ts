import type {Meta, StoryObj} from '@storybook/html-vite';

import {DraggableExample} from './DraggableExample.ts';

const meta: Meta = {
  title: 'Draggable/Basic setup',
};

export default meta;
type Story = StoryObj;

export const Example: Story = {
  render: () => DraggableExample().root,
};

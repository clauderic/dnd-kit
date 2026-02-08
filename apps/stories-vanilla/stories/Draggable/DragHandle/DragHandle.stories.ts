import type {Meta, StoryObj} from '@storybook/html-vite';

import {DragHandleExample} from './DragHandleExample.ts';

const meta: Meta = {
  title: 'Draggable/Drag handle',
};

export default meta;
type Story = StoryObj;

export const Example: Story = {
  render: () => DragHandleExample().root,
};

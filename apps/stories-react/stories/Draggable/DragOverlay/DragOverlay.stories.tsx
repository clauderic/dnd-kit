import type {Meta, StoryObj} from '@storybook/react-vite';

import {DraggableExample} from '../DraggableExample.tsx';

const meta: Meta<typeof DraggableExample> = {
  title: 'React/Draggable/Drag overlay',
  component: DraggableExample,
};

export default meta;
type Story = StoryObj<typeof DraggableExample>;

export const DragOverlay: Story = {
  name: 'Example',
  args: {
    overlay: true,
  },
};

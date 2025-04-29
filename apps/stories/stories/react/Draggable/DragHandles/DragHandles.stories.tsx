import type {Meta, StoryObj} from '@storybook/react';

import docs from './docs/DragHandles.mdx';
import {DraggableExample} from '../DraggableExample.tsx';
import {PointerSensor, KeyboardSensor} from '@dnd-kit/dom';

const meta: Meta<typeof DraggableExample> = {
  title: 'React/Draggable/Drag handles',
  component: DraggableExample,
  tags: ['autodocs'],
  parameters: {
    docs: {
      page: docs,
    },
  },
};

export default meta;
type Story = StoryObj<typeof DraggableExample>;

export const DragHandle: Story = {
  name: 'Example',
  args: {
    handle: true,
  },
};

export const DualActivators: Story = {
  name: 'Dual activators',
  args: {
    handle: true,
    sensors: [
      PointerSensor.configure({
        activatorElements(source) {
          return [source.handle, source.element];
        },
      }),
      KeyboardSensor,
    ],
  },
};

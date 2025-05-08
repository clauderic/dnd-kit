import type {Meta, StoryObj} from '@storybook/react';
import {pointerIntersection} from '@dnd-kit/collision';

import {SortableExample} from '../SortableExample';

const meta: Meta<typeof SortableExample> = {
  title: 'React/Sortable/Grid',
  component: SortableExample,
};

export default meta;
type Story = StoryObj<typeof SortableExample>;

const defaultArgs = {
  debug: false,
  layout: 'grid',
} as const;

export const Grid: Story = {
  name: 'Basic setup',
  args: defaultArgs,
};

export const DragHandle: Story = {
  name: 'Drag handle',
  args: {
    ...defaultArgs,
    dragHandle: true,
  },
};

export const VariableSizes: Story = {
  name: 'Variable sizes',
  args: {
    ...defaultArgs,
    itemCount: 14,
    collisionDetector: pointerIntersection,
    optimistic: false,
    getItemStyle(_: number, index: number) {
      if (index === 0 || index === 10) {
        return {
          maxWidth: 'initial',
          gridRowStart: 'span 2',
          gridColumnStart: 'span 2',
        };
      }
    },
  },
};

export const Clone: Story = {
  name: 'Clone feedback',
  args: {
    ...defaultArgs,
    collisionDetector: pointerIntersection,
    optimistic: false,
    getItemStyle(_, index) {
      if (index === 0 || index === 2 || index === 10) {
        return {
          maxWidth: 'initial',
          gridRowStart: 'span 2',
          gridColumnStart: 'span 2',
        };
      }

      if (index === 12) {
        return {
          gridRowStart: 'span 2',
        };
      }
    },
    feedback: 'clone',
  },
};

export const Debug: Story = {
  name: 'Debug',
  args: {
    ...defaultArgs,
    debug: true,
  },
};

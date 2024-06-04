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
  getItemStyle() {
    return {
      height: 180,
      width: 180,
    };
  },
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
    getItemStyle(_: number, index: number) {
      if (index === 0 || index === 10) {
        return {
          width: 320,
          height: 320,
          maxWidth: 'initial',
          gridRowStart: 'span 2',
          gridColumnStart: 'span 2',
        };
      }

      return {
        height: 150,
        width: 150,
      };
    },
  },
};

export const Clone: Story = {
  name: 'Clone feedback',
  args: {
    ...defaultArgs,
    collisionDetector: pointerIntersection,
    getItemStyle(_, index) {
      if (index === 0 || index === 2) {
        return {
          maxWidth: 'initial',
          gridRowStart: 'span 2',
          gridColumnStart: 'span 2',
        };
      }

      return {
        height: 150,
        width: 150,
      };
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
